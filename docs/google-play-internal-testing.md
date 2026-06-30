# Google Play Internal Testing Preparation

Date: 2026-06-29

This document records the Step 28 Google Play Internal Testing preparation for HuMANity. It contains no signing passwords, keystore contents, tokens, Clerk keys, R2 keys, Railway tokens, database URLs, cookies, or environment values.

## Android App Identity

- App name: `HuMANity`
- Application ID/package name: `com.humanity.app`
- Version code: `1`
- Version name: `1.0`
- Min SDK: `24`
- Target SDK: `36`
- Compile SDK: `36`

The package name is still the final Android identity once uploaded to Play Console. Confirm `com.humanity.app` before creating a Play app because package names cannot be changed after publication.

## Release Signing

Release signing is configured in `artifacts/humanity/android/app/build.gradle`.

Gradle reads signing values from the ignored local file:

```text
artifacts/humanity/android/key.properties
```

The local release keystore was created at:

```text
artifacts/humanity/android/release-signing/humanity-release.jks
```

Signing alias:

```text
humanity-release
```

Both the keystore and signing properties file are ignored by Git and must never be committed. If `key.properties` is missing or incomplete, release signing fails with a clear Gradle error. Debug builds still work without release signing files.

Keep an offline backup of the keystore and passwords outside this repository. Losing the upload key can block future updates unless Google Play App Signing recovery is available.

## Build Commands

From the repo root:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:bundle:release
```

The release bundle command runs Gradle `bundleRelease` through:

```text
artifacts/humanity/scripts/android-bundle-release.mjs
```

## Signed AAB Output

Generated signed release bundle:

```text
artifacts/humanity/android/app/build/outputs/bundle/release/app-release.aab
```

The `.aab` is ignored by Git and must not be committed.

Verification completed:

- Release AAB exists.
- Release AAB contains bundle metadata and `base/manifest/AndroidManifest.xml`.
- Release AAB contains signature files.
- `jarsigner -verify` reported `jar verified`.
- Signer certificate subject is `CN=HuMANity, OU=Mobile, O=HuMANity, L=New York, ST=NY, C=US`.
- Package metadata in Gradle remains `com.humanity.app`, version code `1`, version name `1.0`.

`jarsigner` reports expected self-signed certificate warnings for the local Android upload key. Do not confuse this with debug signing; the release bundle is signed by the local HuMANity release keystore.

## Google Play Internal Testing Checklist

Manual Play Console setup still required:

- Create or open the Google Play Console app for `HuMANity`.
- Confirm package name `com.humanity.app`.
- Upload `artifacts/humanity/android/app/build/outputs/bundle/release/app-release.aab` to an Internal testing release.
- Add internal tester email list or Google Group.
- Add app access/test account instructions because the app requires sign-in.
- Add privacy policy URL.
- Complete Data Safety form.
- Complete content rating questionnaire.
- Configure target audience and age settings.
- Add short description.
- Add full description.
- Add Play Store app icon. Current Android icon is a temporary launch-prep placeholder.
- Add feature graphic.
- Add phone screenshots.
- Add tablet screenshots if Play requires or recommends them.
- Confirm support contact email.
- Confirm terms/support/privacy links are reachable in the app.
- Confirm account deletion request flow is documented and accessible.
- Confirm reporting and blocking flows are testable.
- Confirm backend health and mobile API environment are production-ready.

Do not submit to production from this step. Some Google Play developer accounts may need closed testing before production access; follow the current Play Console requirements shown for the account.

## Missing Store Assets And Content

Still needed before a polished store submission:

- Founder/designer-approved 512x512 Play Store icon.
- Feature graphic.
- Screenshot set from the actual Android app.
- Final short description.
- Final full description.
- Final privacy policy URL.
- Final support contact.
- Final internal tester list.
- Clear test account instructions for reviewers/testers.

## Step 28 Validation Result

Commands run:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:build:debug
pnpm run android:bundle:release
pnpm run backend:typecheck
pnpm run backend:build
```

Results:

- Frontend typecheck: passed.
- Frontend build: passed with existing Vite sourcemap/chunk warnings.
- Capacitor sync: passed.
- Android debug build: passed.
- Android signed release AAB build: passed.
- Backend typecheck: passed.
- Backend build: passed.
- Signing files ignored: confirmed.
- AAB output ignored: confirmed.

Google Play Console was not accessed and no upload/submission was performed in Step 28.

## Step 29 Play Console Attempt

Date: 2026-06-29

Google Play Console was accessed with the developer account dashboard available.

Status:

- Developer account exists.
- App creation is currently blocked by account verification.
- Play Console shows identity verification in progress.
- Play Console requires Android mobile device verification.
- Contact phone verification is not available until other verification tasks are complete.
- HuMANity app was not created.
- Internal testing track was not created or opened.
- Signed AAB was not uploaded.
- No release was saved, submitted, rolled out, or published.
- No production release action was taken.

Manual action required before continuing Step 29:

1. Wait for Google identity verification approval.
2. Complete Android mobile device verification in Play Console or the Play Console mobile app if Google requires it.
3. Complete contact phone verification when Google unlocks it.
4. Return to the web Play Console app list.
5. Confirm the `Create app` button is enabled.

After account verification is complete, continue Step 29 from app creation:

- Create/select app: `HuMANity`.
- Default language: English (United States), if available.
- App type: App.
- Price: Free.
- Package name after AAB upload: `com.humanity.app`.
- Create/open internal testing track.
- Upload `artifacts/humanity/android/app/build/outputs/bundle/release/app-release.aab`.
- Add internal testing release notes.
- Add tester list or pause for tester Gmail addresses if required.
- Configure app access/sign-in instructions if Play Console asks.
- Save as draft or ask before any final start-testing/review action.

## Step 29A Verification Status Check

Date: 2026-06-30

Google Play Console was accessed again to verify the current account blocker. No app was created, no AAB was uploaded, and no release/testing action was started.

Current non-sensitive verification status:

- Identity verification: under review. Play Console says identity documents were uploaded and Google is verifying them. Google says the account owner will receive an email when verification is complete, and that this may take a few days.
- Android mobile device verification: pending. Play Console requires signing in to the Google Play Console mobile app on a real Android device.
- Contact phone verification: locked until other verification tasks are complete, including identity verification and document approval.
- App creation: still locked. The `Create app` button is disabled.
- Android developer verification/package registration: blocked until the outstanding Home-page verifications are complete.
- Step 29 cannot continue yet.

Exact manual next actions:

1. On the web Play Console Home page, complete `Verify your identity`.
   - Upload the official identity document Google requests.
   - Do not edit or manipulate the document.
   - Wait for Google to approve the uploaded document. Google says the process may take a few days.
2. Complete Android mobile device verification.
   - Install or open the Google Play Console mobile app on a real Android device.
   - Sign in with the same Google account that owns the Play Console developer account.
   - Select the developer account that owns the Play Console registration if prompted.
   - Follow the on-device verification instructions.
3. After identity approval and device verification, complete contact phone verification.
   - Go to Play Console account details.
   - Confirm the contact phone number.
   - Choose SMS or phone call for the verification code.
   - Enter the code only in Play Console.
4. Return to the web Play Console app list and confirm `Create app` is enabled.

Resume with Step 29B only after all required account verifications are complete and app creation is unlocked.

## Step 29A-2 Android Device Verification Status

Date: 2026-06-30

Google Play Console was accessed to inspect the Android device verification blocker. No app was created, no AAB was uploaded, and no testing or production release action was started.

Current non-sensitive status:

- Identity verification: still under review.
- Android mobile device verification: available and pending.
- Play Console says the Play Console mobile app is required.
- Play Console explicitly requires access to a real Android mobile device for developing and testing Android apps.
- Play Console offers a QR code or URL to get the Play Console mobile app on the chosen Android device.
- Contact phone verification: still gated until the other verification tasks are complete.
- App creation: still locked. The `Create app` button remains disabled.

Local device check:

- ADB is available on this workstation.
- The only Android device currently visible to ADB is an emulator.
- No physical Android phone is currently connected to this computer.
- Do not use an emulator to bypass this requirement unless Google explicitly accepts it in Play Console. The current Play Console wording requires a real Android mobile device.

Safest manual next action:

1. Use a real Android phone with Google Play Store support.
2. Install or update the Google Play Console app from Google Play.
3. Sign in with the same Google account that owns the Play Console developer account.
4. Complete MFA only on the device or Google-owned screens.
5. Select the developer account if prompted.
6. Follow the Play Console mobile app verification steps.
7. Return to web Play Console and confirm the Android device verification task disappears or is marked complete.

If using a borrowed trusted phone:

1. Do not save the Google password on the borrowed phone.
2. After verification, sign out of the Play Console app.
3. Remove the Google account from the borrowed phone.
4. Check Google Account security settings and remove the borrowed device if needed.

Safe device options:

- Borrow a trusted friend or family Android phone for a short verification session.
- Use an older Android phone that can install the Google Play Console app from Google Play.
- Buy an inexpensive certified Android phone with Google Play Store support.
- Avoid public or shared devices unless absolutely necessary.

Resume Step 29B only after identity verification, Android mobile device verification, and contact phone verification are complete and web Play Console enables app creation.
