package app.humanity.global

import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.sso.OAuthProvider
import com.clerk.api.signin.SignIn
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

        val existingSession = Clerk.session
        if (existingSession != null) {
          if (Clerk.activeSession == null) {
            when (Clerk.auth.setActive(existingSession.id)) {
              is ClerkResult.Success -> Unit
              is ClerkResult.Failure -> {
                call.reject("Clerk could not reactivate the mobile session")
                return@launch
              }
            }
          }
          resolveToken(call)
          return@launch
        }

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
              is ClerkResult.Success -> resolveToken(call)
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
  fun signInWithPassword(call: PluginCall) {
    if (BuildConfig.CLERK_PUBLISHABLE_KEY.isBlank()) {
      call.reject("Clerk publishable key is missing")
      return
    }

    val identifier = call.getString("identifier")?.trim().orEmpty()
    val password = call.getString("password").orEmpty()
    if (identifier.isBlank() || password.isBlank()) {
      call.reject("Reviewer email and password are required")
      return
    }

    scope.launch {
      try {
        Clerk.initialize(context, BuildConfig.CLERK_PUBLISHABLE_KEY)
        withTimeout(60_000) { Clerk.isInitialized.first { it } }
        Clerk.auth.signOut()

        when (
          val authResult = Clerk.auth.signInWithPassword {
            this.identifier = identifier
            this.password = password
          }
        ) {
          is ClerkResult.Success -> {
            if (authResult.value.status == SignIn.Status.COMPLETE) {
              resolveToken(call)
              return@launch
            }

            val sessionId = authResult.value.createdSessionId
            if (sessionId == null) {
              call.reject("Clerk reviewer sign-in requires an additional verification step")
              return@launch
            }

            when (val activeResult = Clerk.auth.setActive(sessionId)) {
              is ClerkResult.Success -> resolveToken(call)
              is ClerkResult.Failure -> call.reject("Clerk could not activate the reviewer session")
            }
          }
          is ClerkResult.Failure -> call.reject("Clerk reviewer sign-in failed")
        }
      } catch (_: Exception) {
        call.reject("Clerk reviewer sign-in could not finish")
      }
    }
  }

  private suspend fun resolveToken(call: PluginCall) {
    when (val tokenResult = Clerk.auth.getToken()) {
      is ClerkResult.Success -> {
        val result = JSObject()
        result.put("token", tokenResult.value)
        call.resolve(result)
      }
      is ClerkResult.Failure -> call.reject("Clerk could not create a session token")
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
