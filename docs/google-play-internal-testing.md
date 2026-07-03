# Google Play Internal Testing Preparation

Date: 2026-06-29

This document records the Step 28 Google Play Internal Testing preparation for HuMANity. It contains no signing passwords, keystore contents, tokens, Clerk keys, R2 keys, Railway tokens, database URLs, cookies, or environment values.

## Android App Identity

- App name: `HuMANity`
- Application ID/package name: `app.humanity.global`
- Version code: `1`
- Version name: `1.0`
- Min SDK: `24`
- Target SDK: `36`
- Compile SDK: `36`

The package name is still the final Android identity once uploaded to Play Console. Confirm `app.humanity.global` before creating a Play app because package names cannot be changed after publication.

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
- Package metadata in Gradle remains `app.humanity.global`, version code `1`, version name `1.0`.

`jarsigner` reports expected self-signed certificate warnings for the local Android upload key. Do not confuse this with debug signing; the release bundle is signed by the local HuMANity release keystore.

## Google Play Internal Testing Checklist

Manual Play Console setup still required:

- Create or open the Google Play Console app for `HuMANity`.
- Confirm package name `app.humanity.global`.
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
- Package name after AAB upload: `app.humanity.global`.
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

## Step 29A-3 Guided Android Device Verification Flow

Date: 2026-06-30

Google Play Console was accessed again to prepare a guided Android device verification session. No app was created, no AAB was uploaded, and no testing or production release action was started.

Current exact blocker:

- Identity verification remains under review.
- Android mobile device verification is available and pending.
- Contact phone verification remains locked until the other verification tasks are complete.
- App creation remains locked; the `Create app` button is disabled.

The device verification detail page shows:

- Page title: `Verify that you have access to an Android mobile device`.
- No separate `Get started` button was shown on the detail page.
- A QR code is shown for installing or opening the Google Play Console mobile app.
- A `Copy URL` button is shown for the same mobile-app link.
- The page says to open the Google Play Console app on an Android mobile device.
- The page says to sign in using the same Google account currently signed in to Play Console.
- The page says to choose this developer account and follow the instructions on the device.
- The page does not say identity verification must finish before starting device verification, but the overall account setup still requires identity approval before app creation and phone verification can be completed.

Official Google help guidance for the mobile app flow:

1. Log into Play Console on the web as the account owner.
2. Find `Verify that you have access to an Android mobile device` and open `View details`.
3. Scan the QR code to launch or install the Play Console mobile app on the real Android device.
4. Open the Play Console mobile app and log in as the account owner.
5. Select the developer account.
6. Tap `Verify` and follow the instructions on screen.
7. After device verification completes, the mobile device verification task should no longer be shown on the Home page in Play Console.

Live phone-side steps when a real Android phone is available:

1. Keep the web Play Console device verification detail page open.
2. On the Android phone, open Google Play Store.
3. Install or update `Google Play Console`.
4. Scan the QR code from the web Play Console page if possible. If scanning is awkward, use `Copy URL` on the web page and open that URL on the phone using a safe method you control.
5. In the Play Console mobile app, sign in with the same Google account that owns the paid Play Console developer account.
6. Complete MFA only on Google-owned screens. Do not share codes in chat or save passwords on a borrowed phone.
7. If the app shows multiple accounts or developer accounts, switch to the same developer account shown in web Play Console.
8. Look for a card, banner, or task named `Verify that you have access to an Android mobile device`, `Device verification`, or similar.
9. Tap `Verify`.
10. Follow the on-device prompts.
11. Return to web Play Console Home and refresh.
12. Confirm the Android mobile device verification task is gone or marked complete.

If the mobile app does not show verification:

1. Confirm the phone is signed into the same Google account that owns the paid Play Console developer account.
2. Update the Google Play Console app from Google Play.
3. Fully close and reopen the Play Console app.
4. Sign out of the Play Console app and sign back in.
5. Switch accounts inside the app if another Google account is selected.
6. Manually select the correct developer account if the app shows an account picker.
7. Open the web verification detail page first, then scan the QR code again.
8. Use the `Copy URL` button and open the copied URL on the real Android phone if QR scanning does not route correctly.
9. Clear the Play Console app cache if the task still does not appear.
10. Wait for identity verification to complete if Google begins gating the device task behind identity approval.
11. Try another real Android device with Google Play Store support.

Borrowed-phone cleanup:

1. Sign out of the Play Console mobile app.
2. Remove the Google account from the borrowed phone.
3. Check Google Account security devices and remove the borrowed phone if needed.
4. Do not leave passwords, passkeys, recovery prompts, screenshots, or account data on the borrowed phone.

Resume Step 29B only after web Play Console shows device verification complete and app creation is enabled.

## Step 29B Internal Testing Upload Attempt

Date: 2026-06-30

Google Play Console was accessed after account verification completed. No production rollout was started, no production review was requested, and no AAB was uploaded.

Current status:

- Account verification: complete enough for `Create app` to be enabled.
- HuMANity app creation: attempted but blocked.
- Requested app name: `HuMANity`.
- Requested package/application ID: `com.humanity.app`.
- Default language: English (United States).
- App type: App.
- Pricing: Free.
- Play App Signing terms: accepted during the create-app form.
- Developer Program Policies declaration: accepted during the create-app form.
- US export laws declaration: accepted during the create-app form.

Blocker:

- Google Play Console reported that `com.humanity.app` is already in use.
- The app list still showed no created app after the failed create attempt.
- The signed AAB was not uploaded because the Play app could not be created with the existing package ID.

Do not choose a different package ID without an explicit Android identity decision. The package ID is part of the Android app identity and must match the signed AAB. If the package ID changes, the Android project must be updated, rebuilt, re-signed, and revalidated before upload.

Recommended next action:

1. Confirm whether `com.humanity.app` is owned by another Google Play Console account, an earlier app draft, or another publisher.
2. If it can be recovered/transferred, use the owning Play Console account or transfer path.
3. If it cannot be recovered, choose a new final package ID, such as a reverse-domain ID owned by the project.
4. Update Android `applicationId`/namespace through a dedicated step.
5. Rebuild and sign a new release AAB.
6. Return to Play Console app creation using the new approved package ID.

Pending after this blocker is resolved:

- Create the Play Console app.
- Upload the signed AAB to Internal testing.
- Configure the internal testing track.
- Configure tester list.
- Configure app access/sign-in instructions if Play Console asks.
- Complete Privacy policy, Data Safety, Content rating, Target audience, Ads, data deletion/account deletion, store listing, app icon, feature graphic, screenshots, and any UGC/social moderation declarations required by Play Console.

## Step 29C Package ID Change And Internal Test Draft

Date: 2026-06-30

The Android package/application ID was changed from `com.humanity.app` to `app.humanity.global` after Google Play Console reported the old package ID was already in use. The app was rebuilt, re-signed, validated, and uploaded only to the Play Console Internal testing release flow.

Local validation completed before upload:

- Frontend typecheck: passed.
- Frontend production build with `PORT=5173` and `BASE_PATH=/`: passed.
- Capacitor sync: passed.
- Android debug build: passed.
- Android debug APK install/relaunch on `HuMANity_Pixel_API_36`: passed.
- Android app launched as package `app.humanity.global` and rendered the HuMANity home screen.
- Clerk sign-in page rendered in the Android WebView.
- Signed release AAB build: passed.
- Backend typecheck: passed.
- Backend build: passed.

Release bundle verification:

- Signed AAB output: `artifacts/humanity/android/app/build/outputs/bundle/release/app-release.aab`.
- Release AAB remains ignored and must not be committed.
- Local signing files remain ignored and must not be committed.
- AAB manifest/resources/config references were checked for `app.humanity.global`; old `com.humanity.app` references were not present in the new release bundle metadata.
- Debug APK package check confirmed `app.humanity.global`.

Play Console result:

- Play Console app created successfully for `HuMANity`.
- Package/application ID: `app.humanity.global`.
- Default language: English (United States).
- App type: App.
- Pricing: Free.
- Google Play App Signing was accepted for the new app.
- Google automatic protection was left enabled.
- Internal testing track was opened.
- Signed release AAB `app-release.aab` was uploaded to the Internal testing release.
- Uploaded bundle version: `1 (1.0)`, min API `24+`, target SDK `36`.
- Internal testing release notes were added for `en-US`.
- Release was saved as a draft. It was not rolled out to testers and no production rollout was started.

Tester status:

- Tester list is still pending.
- Do not invent tester email addresses. Ask the founder for tester Gmail addresses or a Google Group before rolling out internal testing.

Pending Play Console checklist:

- Add internal tester list.
- Provide app access/sign-in instructions or test credentials if Google asks.
- Add Privacy policy URL.
- Complete Data Safety form.
- Complete Content rating questionnaire.
- Complete Target audience and content.
- Complete Ads declaration.
- Add data deletion/account deletion URL or instructions.
- Complete store listing short description and full description.
- Upload Play Store app icon, feature graphic, and phone screenshots.
- Complete UGC/social moderation declarations if Google asks.
- Review any closed testing requirement Google shows before production access.

Next action:

1. Collect tester Gmail addresses or create a Google Group for `HuMANity Internal Testers`.
2. Finish the required Play Console setup checklist.
3. Preview the draft Internal testing release.
4. Roll out to Internal testing only after the tester list and required declarations are complete.

## Step 29D Internal Testing Rollout

Date: 2026-07-01

The Google Play Internal testing setup was completed for the existing HuMANity draft release. This was an internal testing rollout only; no production rollout was started and no production review was requested.

Internal testing result:

- Track: Internal testing.
- Track status: Active.
- Release: `1 (1.0)`.
- Release status: Available to internal testers.
- Release time shown by Play Console: July 1, 2026, 11:43 AM.
- Review status shown by Play Console: Not reviewed.
- Temporary app name shown by Play Console: `app.humanity.global (unreviewed)`.
- Play Console showed one non-blocking warning about no deobfuscation file for the app bundle.

Tester setup:

- Tester list name: `HuMANity Internal Testers`.
- Tester count: 1.
- The private tester email address is intentionally not recorded in this repository.
- The tester list is selected for the Internal testing track.

Tester opt-in link:

```text
https://play.google.com/apps/internaltest/4701483710954512652
```

Pending before broader testing or production readiness:

- Confirm the internal tester can open the opt-in link, join the test, install the app, and sign in.
- Complete app access/test account instructions if Google requires them later.
- Add Privacy policy URL.
- Complete Data Safety form.
- Complete Content rating questionnaire.
- Complete Target audience and content.
- Complete Ads declaration.
- Add data deletion/account deletion URL or instructions.
- Complete store listing short description and full description.
- Upload Play Store app icon, feature graphic, and phone screenshots.
- Complete any UGC/social moderation declarations Google asks for.
- Keep production closed-testing requirements separate from this internal testing rollout.

Next action:

1. Use the opt-in link with the selected internal tester account.
2. Install the HuMANity internal test build from Google Play.
3. Run an end-to-end Android internal testing smoke test: launch, sign in, edit profile, upload profile photo, navigate core screens, and verify reporting/blocking/account deletion entry points.

## Step 31B Internal Testing Release 4

Date: 2026-07-02

A new Google Play Internal testing release was uploaded and published after the
Android OAuth callback fix.

Internal testing result:

- Track: Internal testing.
- Release: `4 (1.0.3)`.
- Release status: Available to internal testers.
- Release time shown by Play Console: July 2, 2026, 12:29 PM.
- Review status shown by Play Console: Not reviewed.
- Temporary app name shown by Play Console: `app.humanity.global (unreviewed)`.
- Production rollout: not started.

Release focus:

- Android package: `app.humanity.global`.
- Android version code: `4`.
- Android version name: `1.0.3`.
- Native callback scheme: `app.humanity.global://callback`.
- Google OAuth no longer redirects to a `localhost` callback in Chrome.

Known warnings:

- Play Console continued to show one non-blocking release warning during the
  internal testing publish flow.
- The app remains unreviewed and uses a temporary app name for internal testers
  until the Play listing and review requirements are completed.
- Clerk is still in Development mode and must be moved to production-ready
  configuration before public launch.

## Step 32 Final Internal QA

Date: 2026-07-03

Final internal QA was run against the Play-installed Internal testing build
`5 (1.0.4)`.

Summary:

- Package `app.humanity.global` was verified as installed from Google Play.
- Production track remains locked, so no production rollout exists.
- Clerk is still using a Development environment; production migration is
  required before broader testing or production.
- Privacy, Terms, and Support routes opened in the Play-installed app, but they
  are still draft/placeholders requiring founder/legal review.
- Account deletion request UI is reachable and request-only; no deletion request
  was submitted during this QA pass.
- Connections and Find People opened, but no second visible QA profile was
  available, so report/block end-to-end testing remains blocked.
- Explore, country detail, profile, profile edit, footer links, and recent
  Android fatal-log checks passed.

See `docs/final-internal-qa.md` for the full Step 32 readiness record and next
recommended task.

## Step 30 Play Internal Test Install Attempt

Date: 2026-07-01

The tester opt-in link was opened on the `HuMANity_Pixel_API_36` emulator. The tester account was accepted, and Google Play confirmed tester access for `app.humanity.global (unreviewed)`.

The Play-distributed install was blocked because this emulator does not have a launchable native Google Play Store app. The Google Play web page reported that the account was not yet associated with a device and instructed that the Play Store app must be opened on the device before installing apps. ADB inspection showed only the `com.android.vending` license-checker package, not a full Play Store app with launcher or `market://` handling.

The existing app on the emulator was a previous local install with no installer package, so it does not satisfy the Play-distributed internal testing requirement. No local debug APK was sideloaded for this Step 30 attempt.

See `docs/google-play-internal-test-smoke-test.md` for the blocked smoke-test record and the required next path.
