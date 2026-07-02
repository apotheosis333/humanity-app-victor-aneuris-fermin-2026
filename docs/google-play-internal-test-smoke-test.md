# Google Play Internal Test Smoke Test

Date: 2026-07-01

This document records the Step 30B Google Play Internal testing smoke test for HuMANity. It contains no tester email addresses, passwords, tokens, cookies, Clerk keys, Railway tokens, R2 keys, signed URLs, `.env` values, signing keys, AABs/APKs, screenshots, or private Google account data.

## Play Internal Testing Status

- Google Play Internal testing track: active enough for tester opt-in and Play Store install.
- Release available to internal testers: `1 (1.0)`.
- Package ID: `app.humanity.global`.
- Tester opt-in link:

```text
https://play.google.com/apps/internaltest/4701483710954512652
```

Play status was confirmed through the internal-testing opt-in flow and a successful Play Store install. The Play Console was not used to publish, change testers, upload a new build, or start production rollout during this step.

## Google Play Store AVD

- New AVD created: `HuMANity_PlayStore_Test_API_36`.
- Device profile: Pixel 8.
- System image: `system-images;android-36;google_apis_playstore;x86_64`.
- ADB online: passed.
- Real Play Store support: passed.
- Play Store package present: `com.android.vending`.
- Google Play services present: `com.google.android.gms`.
- Chrome present for OAuth/browser flows: `com.android.chrome`.
- `market://details?id=app.humanity.global` resolves to Play Store: passed.

This was a legitimate Google Play Store-enabled Android Studio emulator image. The app was not sideloaded for this test.

## Play Store Install

The emulator was signed into the tester Google account manually. No passwords, MFA codes, or account credentials were printed, saved, or committed.

The HuMANity listing opened through Google Play Internal testing and showed the install action for `app.humanity.global (unreviewed)`. The app installed successfully from Google Play.

ADB package verification:

- Installed package ID: `app.humanity.global`.
- Version code: `1`.
- Version name: `1.0`.
- Installer package: `com.android.vending`.
- Initiating package: `com.android.vending`.
- minSdk: `24`.
- targetSdk: `36`.
- Install permissions granted: `android.permission.INTERNET`, `com.android.vending.CHECK_LICENSE`.

## Launch Smoke Test

- Play-installed app launch: passed.
- App opened to HuMANity home: passed.
- Blank WebView check: passed; no blank screen observed.
- Startup crash check: passed; no fatal crash observed in filtered logcat.
- Unexpected permission prompts: none observed.
- Public home content: passed.
- Public side navigation: passed.
- Public globe/home section rendering: passed.
- Clerk sign-in route rendering: passed.

Known UI note:

- Clerk renders with a visible `Development mode` label. This is acceptable for internal testing, but it should be removed before production submission by using production-ready Clerk configuration.

## Backend And Data Smoke Test

Railway public endpoint checks from the workstation:

- `GET /health`: `200`.
- `GET /api/countries`: `200`, but returned an empty array.

In the Play-installed app:

- Explore page opened: passed.
- Explore data state: blocked by empty backend country data. The UI showed no loaded nations even though it references the expected total.

The empty country response is a release blocker for a polished internal/production experience unless this is intentionally seeded later.

## Clerk Auth Smoke Test

The app opened the Clerk sign-in page in the Play-installed build and the Google account consent flow completed far enough to return from Google/Clerk.

Auth did not complete in the app. Chrome landed on a localhost callback URL and showed `ERR_CONNECTION_REFUSED`. Relaunching HuMANity returned to the sign-in screen with no completed session.

Result:

- Google sign-in screen: passed.
- Google account consent: passed.
- Return to HuMANity app session: failed.
- Clerk session in app: not established.
- `/api/me/profile` authenticated check: blocked.

Likely cause:

- The mobile OAuth callback/deep-link configuration is still using a development/local callback path instead of returning cleanly to the Capacitor Android app.

Do not treat authenticated Android Play testing as complete until the Clerk mobile OAuth callback issue is fixed and retested from the Play-installed app.

## Profile, Upload, And Persistence

These flows were not completed because authenticated login did not complete:

- Profile load/create: blocked by auth callback failure.
- Profile edit: blocked by auth callback failure.
- Profile photo upload/R2: blocked by auth callback failure.
- Profile save: blocked by auth callback failure.
- Profile/photo persistence after relaunch: blocked by auth callback failure.

The previously configured Railway/R2 backend remains the expected path for upload testing after auth is fixed.

## Safety, Support, Privacy, And Terms Smoke

Verified from source and prior implementation:

- Privacy route exists: `/privacy`.
- Terms route exists: `/terms`.
- Support route exists: `/support`.
- Reporting/blocking controls exist for signed-in profile views.
- Account deletion request UI exists in profile edit.

Verified in this Play-installed app session:

- Public navigation opened: passed.
- Authenticated reporting/blocking/account deletion UI: blocked by auth callback failure.
- Footer/legal route UI: not fully verified in this session because authenticated testing was blocked and mobile scrolling was interrupted by interactive home/globe content.

Before production submission, run a dedicated signed-in legal/safety pass after fixing Clerk mobile auth.

## Issues Found

1. Clerk mobile OAuth callback fails by redirecting to localhost in Chrome instead of completing inside the Capacitor Android app.
2. Clerk is visibly in development mode in the Play-installed build.
3. Railway `GET /api/countries` returns an empty array, so the Explore page has no country data in the mobile test build.
4. Authenticated flows could not be tested from the Play-installed app: `/api/me/profile`, profile edit, R2 profile photo upload, persistence, reporting/blocking, and account deletion request.
5. Legal/support route rendering should be manually rechecked after auth/data blockers are fixed.

## Security Notes

- No tester email address was documented.
- No test credentials were requested or committed.
- No Google credentials, cookies, tokens, Clerk keys, Railway tokens, R2 keys, signed URLs, `.env` values, keystores, signing properties, AABs, APKs, build outputs, or screenshots were committed.
- The Play-installed package was verified through ADB metadata rather than by committing any build artifact.

## Next Recommended Task

`TASK: STEP 31 - FIX PLAY-INSTALLED ANDROID CLERK OAUTH CALLBACK AND SEED/VERIFY MOBILE DATA`

Focus:

1. Configure Clerk and the Capacitor app so Google OAuth returns to the installed Android app instead of `localhost` in Chrome.
2. Remove Clerk development-mode presentation from the internal/release build if production Clerk keys are ready.
3. Verify or seed production/Railway country data so Explore is not empty.
4. Rebuild/sign/upload a new internal testing AAB only after the fixes are complete and approved.
5. Reinstall/update from Google Play Internal testing and rerun the full authenticated smoke test.

## Step 31B Play-Installed Retest

Date: 2026-07-02

Release tested:

- Google Play Internal testing release: `4 (1.0.3)`.
- Package ID: `app.humanity.global`.
- Installer package: `com.android.vending`.
- Android version code: `4`.
- Android version name: `1.0.3`.

Setup result:

- Country seed: already complete; Railway `GET /api/countries` returns 24
  baseline public country records.
- Clerk Native application callback allowlist includes
  `app.humanity.global://callback`.
- Google social sign-in is enabled in Clerk.
- The Play Store AVD updated from release `3 (1.0.2)` to release `4 (1.0.3)`
  through Google Play.

Auth result:

- Play-installed app launch: passed.
- Custom native Android sign-in screen: passed.
- Google OAuth opened the Google sign-in/consent flow: passed.
- OAuth returned to the installed Android app using the native callback scheme:
  passed.
- Localhost callback failure: not reproduced.
- Clerk frontend session after callback: passed.
- Signed-in navigation showed Profile, Connections, Messages, and Pledge:
  passed.
- Session persisted after app relaunch: passed.

Profile and API result:

- `/api/me/profile` via the authenticated app flow: passed enough to load the
  profile route and show the create-profile state instead of an auth failure.
- Profile create/edit form: opened successfully.
- Existing Clerk account display name prefilled in the profile form.

Explore/country result:

- Explore page loaded in the Play-installed app.
- Country cards rendered from production backend data; Egypt and Ethiopia were
  visible during the smoke test.
- The prior empty-country blocker is resolved for the baseline seed.

Profile photo/R2 result:

- Android photo picker opened from the profile form.
- A local non-private test PNG was selected from the Android photo picker.
- Backend `POST /api/storage/uploads/request-url` returned `200`.
- The app displayed `Upload failed. Please try again.` before finalize.
- Railway logs showed no matching finalize request after the successful upload
  URL request, so the remaining failure is likely the direct signed PUT step to
  R2 from the Android WebView/photo-picker flow.

Safety/legal result:

- Footer links for Privacy Policy, Terms of Service, and Support are visible in
  the installed mobile UI.
- Source routes exist for `/privacy`, `/terms`, and `/support`.
- Reporting/blocking controls remain implemented for signed-in profile views.
- Account deletion request remains implemented in profile edit.
- A dedicated follow-up should retest legal route navigation and report/block
  controls after the upload issue is resolved and a second test profile exists.

Issues remaining:

1. Profile photo upload still fails after the backend signed upload URL request.
   Investigate R2 bucket CORS, signed PUT headers/content type, and Android
   WebView direct-upload behavior.
2. Clerk remains in Development mode.
3. Username/password sign-in was not separately tested in this pass.
4. Reporting/blocking UI needs two test accounts or another visible profile to
   test end-to-end.
5. Legal/support pages should be opened directly in a short follow-up pass after
   the upload fix.

Security notes:

- No tester email address is recorded here.
- No test credentials are recorded here.
- No Google credentials, cookies, tokens, Clerk keys, Railway tokens, R2 keys,
  signed URLs, `.env` values, keystores, signing properties, AABs, APKs, build
  outputs, or screenshots are committed.

Next recommended task:

`TASK: STEP 31C - FIX ANDROID WEBVIEW R2 DIRECT UPLOAD AND RETEST PROFILE PHOTO`
