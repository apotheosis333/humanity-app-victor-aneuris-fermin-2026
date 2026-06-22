# Android Build Readiness

Step 16 prepares the generated Capacitor Android project for local testing and future Google Play Internal Testing.

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

On the current Windows validation machine, the command is wired up but cannot complete until Java is installed and `JAVA_HOME` points to the JDK.

## Required Mobile Environment

Android builds must use a deployed backend:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_or_test_placeholder
```

Do not hardcode the Replit URL as the final production backend unless that is intentionally chosen for launch.

Backend CORS must allow Android/Capacitor origins such as:

```bash
capacitor://localhost
ionic://localhost
```

## Android Studio Debug Steps

1. Install Android Studio and the Android SDK.
2. Install a JDK compatible with the Android Gradle plugin used by this project.
3. Run `pnpm install`.
4. Set mobile-safe frontend env vars for the build.
5. Run `pnpm run cap:sync`.
6. Run `pnpm run cap:open:android`.
7. Let Android Studio sync Gradle.
8. Select an emulator or connected Android device.
9. Run the `app` configuration.
10. Test sign-in, profile editing, messaging, reporting/blocking, account deletion request, uploads, and legal/support links.

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
