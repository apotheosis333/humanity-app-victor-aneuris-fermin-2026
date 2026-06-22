# Android Build Readiness

Steps 16 and 17 prepare the generated Capacitor Android project for local testing and future Google Play Internal Testing.

## Project Location

- Android project: `artifacts/humanity/android`
- Android manifest: `artifacts/humanity/android/app/src/main/AndroidManifest.xml`
- Android Gradle app file: `artifacts/humanity/android/app/build.gradle`
- Android labels: `artifacts/humanity/android/app/src/main/res/values/strings.xml`

## Identity

- Application ID: `com.humanity.app`
- Android namespace: `com.humanity.app`
- App display name: `HuMANity`
- Activity label: `HuMANity`

The app ID is still a professional placeholder. Confirm the final package name before creating a Play Console app because package names cannot be changed after publication.

## Permissions

Current permissions:

- `android.permission.INTERNET` - required for API calls, Clerk auth, remote images, and storage uploads.

No camera, storage, contacts, microphone, or location permissions are currently declared. Do not add native permissions unless a future native feature requires them.

## Scripts

From the repo root:

```bash
pnpm run mobile:build
pnpm run cap:sync
pnpm run cap:open:android
pnpm run android:build:debug
```

`pnpm run android:build:debug` runs the Android Gradle wrapper from `artifacts/humanity/android` and builds a debug APK when a compatible JDK and Android Gradle tooling are available.

This command has been validated on the Windows development machine after Android tooling setup.

## Local Tooling Setup

Installed/validated tooling:

- Android Studio: `C:\Program Files\Android\Android Studio`
- JDK/JBR: `C:\Program Files\Android\Android Studio\jbr`
- `JAVA_HOME`: `C:\Program Files\Android\Android Studio\jbr`
- `ANDROID_HOME`: `C:\Users\jawso\AppData\Local\Android\Sdk`
- `ANDROID_SDK_ROOT`: `C:\Users\jawso\AppData\Local\Android\Sdk`
- Android SDK Platform: `platforms;android-36`
- Android SDK Build-Tools: `build-tools;36.0.0`
- Android SDK Platform-Tools: `platform-tools` 37.0.0
- Android Emulator: installed
- Android command-line tools: `cmdline-tools;latest`

PowerShell sessions may need to be restarted before user-level environment variable changes are visible automatically.

## Required Mobile Environment

Android builds must use a deployed backend:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_or_test_placeholder
```

Do not hardcode the Replit URL as the final production backend unless that is intentionally chosen for launch.

For local Android smoke testing, place real values only in `artifacts/humanity/.env.local`, which must remain uncommitted, then rebuild and run `pnpm run cap:sync`. Do not commit real Clerk keys or backend URLs.

Do not set `VITE_CLERK_PROXY_URL` for Android builds. Capacitor serves the app from `https://localhost`, so localhost/Replit Clerk proxy settings can make the WebView request `https://clerk.localhost` and fail before the app renders.

Clerk email/password, magic-link, passkey, and social OAuth flows still need Android WebView and real-device testing. Google/social OAuth may require provider redirect settings in Clerk before release.

Backend CORS must allow Android/Capacitor origins such as:

```bash
capacitor://localhost
ionic://localhost
```

## Android Studio Debug Steps

1. Run `pnpm install`.
2. Set mobile-safe frontend env vars for the build.
3. Run `pnpm run cap:sync`.
4. Run `pnpm run cap:open:android`.
5. Let Android Studio sync Gradle.
6. Select an emulator or connected Android device.
7. Run the `app` configuration.
8. Test sign-in, profile editing, messaging, reporting/blocking, account deletion request, uploads, and legal/support links.

## Debug APK

Command:

```bash
pnpm run android:build:debug
```

Expected output when Android tooling is installed:

```text
artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
```

Debug APKs are build artifacts and must not be committed.

Validated output on this machine:

```text
artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
```

## Emulator Testing

1. Open Android Studio.
2. Open `artifacts/humanity/android`.
3. Open Device Manager.
4. Create an Android Virtual Device if one does not exist.
5. Use an image compatible with API 36 or a recent stable API.
6. Start the emulator.
7. Run the `app` configuration from Android Studio, or run a debug APK install with `adb install`.

## Physical Device Testing

1. Enable Developer Options on the Android phone.
2. Enable USB debugging.
3. Connect the phone with USB.
4. Approve the device trust prompt on the phone.
5. Run `adb devices` and confirm the device is listed.
6. Run from Android Studio or install the debug APK:

```bash
adb install -r artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
```

The mobile app still requires a deployed backend URL through `VITE_API_BASE_URL` for meaningful end-to-end testing.

## Step 18 Smoke Test

Date: 2026-06-22

Device used:

- Android emulator: `HuMANity_Pixel_API_36`
- Model: `sdk_gphone64_x86_64`
- Android API: 36

Commands run from the repo root:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:build:debug
adb install -r artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.humanity.app -c android.intent.category.LAUNCHER 1
```

Results:

- APK install: passed.
- Native app launch: passed.
- Instant native crash: none found.
- Unexpected native permission prompts: none.
- Home screen rendering: failed; the app opened to a blank dark WebView screen.
- Navigation, Privacy, Terms, Support, and Profile/Login smoke checks: blocked by the blank startup screen.

Diagnostics:

- The WebView loaded `https://localhost/` and the packaged `index.html`.
- The React root stayed empty.
- DevTools reported `TypeError: t?.map is not a function`.
- Clerk JS failed to load from `https://clerk.localhost/npm/@clerk/clerk-js@6/dist/clerk.browser.js` with `net::ERR_CONNECTION_REFUSED`.

Interpretation:

This is not an Android packaging or native startup crash. The debug APK installs and launches, but the mobile WebView cannot render the app until the mobile build is configured with valid client-safe Clerk settings and a deployed backend URL. For real mobile testing, build with placeholder-free environment values supplied locally or by CI:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_or_test_placeholder
```

Do not commit real environment values. Keep them in local ignored env files or deployment/CI secret settings.

## Step 19 Startup Fix

Date: 2026-06-22

The Android startup path now uses `VITE_CLERK_PUBLISHABLE_KEY` directly and disables `VITE_CLERK_PROXY_URL` on native Capacitor builds. If the publishable key is missing, the app renders a non-secret setup screen instead of throwing during startup.

The startup fallback is only a configuration guard. Full Android auth testing still requires a real local, uncommitted `VITE_CLERK_PUBLISHABLE_KEY` and a deployed backend URL for `VITE_API_BASE_URL`.

Retest result on `HuMANity_Pixel_API_36`:

- APK reinstall: passed.
- Native launch: passed.
- Blank dark WebView: fixed.
- Visible fallback UI: passed.
- `https://clerk.localhost` requests: not observed.
- Previous `t?.map is not a function` startup error: not observed.
- Privacy route: verified through the WebView route state.
- Full auth/home smoke test: still blocked until a real local `VITE_CLERK_PUBLISHABLE_KEY` is supplied outside source control.

## Release AAB Notes

Do not create or commit signing keys in this repository.

Manual release flow later:

1. Open `artifacts/humanity/android` in Android Studio.
2. Create a signing key outside the repository or use Google Play App Signing guidance.
3. Configure release signing in Android Studio or local ignored Gradle properties.
4. Build `Generate Signed Bundle / APK`.
5. Choose Android App Bundle (`.aab`).
6. Upload the `.aab` to Google Play Console Internal Testing.

Unsigned release bundle command for local build validation only, if signing is not required by the selected task:

```bash
cd artifacts/humanity/android
gradlew.bat bundleRelease
```

On macOS/Linux, use `./gradlew bundleRelease`.

## Icons And Splash

The Android project currently uses Capacitor default icon and splash assets. Replace these with final HuMANity-branded assets before Google Play testing or release.

Needed assets:

- Adaptive launcher icon foreground/background.
- Round launcher icon.
- Splash screen image/background.
- Play Store listing icon and feature graphic.

## Google Play Internal Testing Checklist

- Final backend deployed and reachable from Android.
- `VITE_API_BASE_URL` points to the deployed backend.
- Clerk Android WebView auth tested.
- S3/R2 storage configured and upload CORS tested.
- Debug APK tested on at least one emulator and one real Android device.
- Branded app icon and splash assets installed.
- Privacy policy, terms, support, reporting, blocking, and account deletion flows tested.
- Signed release AAB generated outside this repo.
- Google Play Console app, internal testing track, testers, data safety, content rating, and store listing completed manually.

## Remaining Android Risks

- Clerk redirect/deep-link behavior still needs real Android WebView testing.
- Uploads need deployed backend plus configured S3-compatible storage.
- Default Capacitor icons and splash assets are not launch-ready.
- Final package name must be confirmed before Play Console creation.
