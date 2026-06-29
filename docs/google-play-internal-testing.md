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
