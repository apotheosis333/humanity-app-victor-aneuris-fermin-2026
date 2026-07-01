# Google Play Internal Test Smoke Test

Date: 2026-07-01

This document records the Step 30 attempt to install and test the HuMANity Google Play Internal testing build. It contains no tester email addresses, passwords, tokens, cookies, Clerk keys, Railway tokens, R2 keys, signed URLs, `.env` values, signing keys, AABs/APKs, or private Google account data.

## Play Internal Testing Status

- Google Play Internal testing track: active.
- Release available to internal testers: `1 (1.0)`.
- Package ID: `app.humanity.global`.
- Tester opt-in link:

```text
https://play.google.com/apps/internaltest/4701483710954512652
```

## Device Used

- Android emulator: `HuMANity_Pixel_API_36`.
- Device model reported by ADB: `sdk_gphone64_x86_64`.
- The emulator was signed into the tester Google account.

## Result

Tester opt-in worked. The opt-in page confirmed the account is a tester for `app.humanity.global (unreviewed)` and showed the `Download test app` action.

The Play Store install could not be completed on this emulator because the emulator does not have a launchable native Google Play Store app. ADB showed `com.android.vending` installed only as `/product/app/LicenseChecker/LicenseChecker.apk`, with no launcher activity and no `market://` handler. The Google Play web page reported that the Google account is not yet associated with a device and instructed that the Play Store app must be opened on the device before installing apps.

This means the current emulator is not valid for the required Play-distributed install test. The local debug build was not sideloaded for this smoke test.

## Previous Local Install Note

ADB showed `app.humanity.global` was already present from an earlier local install with:

- Version code: `1`.
- Version name: `1.0`.
- Installer package: none.

Because this install was not delivered by Google Play, it does not satisfy the Step 30 Play-distributed build requirement.

## Smoke Test Coverage

- Tester opt-in: passed.
- Play Store install: blocked by emulator image limitation.
- Installed package ID from Play: not tested.
- Play-installed app launch: not tested.
- Clerk auth on Play build: not tested.
- `/api/me/profile` on Play build: not tested.
- Profile edit on Play build: not tested.
- R2 profile photo upload on Play build: not tested.
- Profile persistence on Play build: not tested.
- Safety/support/privacy/terms smoke on Play build: not tested.

## Required Next Path

Use one of these options:

1. Use a real Android phone with Google Play Store support, signed into the tester Google account.
2. Create a fresh Android emulator image that explicitly includes the Google Play Store, not only Google APIs or license-checker components.

Then:

1. Open the opt-in link on that device.
2. Confirm tester access.
3. Install HuMANity from Google Play.
4. Confirm the installed package is `app.humanity.global`.
5. Confirm version `1 (1.0)`.
6. Launch the Play-installed app.
7. Run the full end-to-end smoke test: home, Clerk sign-in, profile load, profile edit, profile photo upload, persistence, navigation, reporting/blocking, support, privacy, terms, and account deletion entry points.

## Follow-Up Task

`TASK: STEP 30B — RUN GOOGLE PLAY INTERNAL TEST BUILD SMOKE TEST ON REAL ANDROID DEVICE OR GOOGLE PLAY STORE AVD`
