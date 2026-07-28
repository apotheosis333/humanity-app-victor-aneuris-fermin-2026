package app.humanity.global

import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.sso.OAuthProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

@CapacitorPlugin(name = "NativeClerk")
class NativeClerkPlugin : Plugin() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

  override fun load() {
    if (BuildConfig.CLERK_PUBLISHABLE_KEY.isNotBlank()) {
      Clerk.initialize(context, BuildConfig.CLERK_PUBLISHABLE_KEY)
    }
  }

  @PluginMethod
  fun signIn(call: PluginCall) {
    if (BuildConfig.CLERK_PUBLISHABLE_KEY.isBlank()) {
      call.reject("Clerk publishable key is missing")
      return
    }

    scope.launch {
      try {
        Clerk.initialize(context, BuildConfig.CLERK_PUBLISHABLE_KEY)
        withTimeout(60_000) { Clerk.isInitialized.first { it } }

        when (val authResult = Clerk.auth.signInWithOAuth(OAuthProvider.GOOGLE)) {
          is ClerkResult.Success -> {
            val sessionId =
              authResult.value.signIn?.createdSessionId
                ?: authResult.value.signUp?.createdSessionId
            if (sessionId == null) {
              call.reject("Clerk Google sign-in did not create a session")
              return@launch
            }

            when (val activeResult = Clerk.auth.setActive(sessionId)) {
              is ClerkResult.Success -> {
                when (val tokenResult = Clerk.auth.getToken()) {
                  is ClerkResult.Success -> {
                    val result = JSObject()
                    result.put("token", tokenResult.value)
                    call.resolve(result)
                  }
                  is ClerkResult.Failure -> call.reject("Clerk could not create a session token")
                }
              }
              is ClerkResult.Failure -> call.reject("Clerk could not activate the mobile session")
            }
          }
          is ClerkResult.Failure -> call.reject("Clerk Google sign-in failed")
        }
      } catch (_: Exception) {
        call.reject("Clerk native sign-in could not finish")
      }
    }
  }

  @PluginMethod
  fun signOut(call: PluginCall) {
    scope.launch {
      try {
        Clerk.auth.signOut()
      } finally {
        call.resolve()
      }
    }
  }

  override fun handleOnDestroy() {
    scope.cancel()
  }
}
