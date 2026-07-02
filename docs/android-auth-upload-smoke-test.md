# Android Authenticated Upload Smoke Test

Date: 2026-06-29

This document records the Step 24 Android authenticated profile photo smoke test.
It intentionally excludes test credentials, Clerk session values, cookies, signed
upload URLs, storage keys, and private environment values.

## Scope

- Android app: `artifacts/humanity`
- Android project: `artifacts/humanity/android`
- Backend: Railway deployment
- Storage: Cloudflare R2 through the S3-compatible adapter
- Device: Android emulator `HuMANity_Pixel_API_36`

## Local Environment Check

- `artifacts/humanity/.env.local` was confirmed ignored by Git.
- The local mobile build used an ignored `VITE_API_BASE_URL` pointed at the Railway backend.
- The local mobile build used an ignored `VITE_CLERK_PUBLISHABLE_KEY`.
- No local environment values were printed or committed.

## Test Account

A Clerk test account was created for this smoke test using the Clerk backend API.
The account credentials were stored outside the repository and were not committed.

Clerk email identifiers were not available in this Clerk application during the
test-account setup, so a username-based test user was used.

## Android Build And Launch

Commands validated during the smoke test:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:build:debug
```

Results:

- Frontend typecheck: passed.
- Frontend production build: passed.
- Capacitor sync: passed.
- Android debug build: passed.
- APK install/relaunch on the emulator: passed.
- App home rendered from `https://localhost/`: passed.
- Railway backend requests were observed from the WebView.
- `https://clerk.localhost` requests were not observed.
- Replit Clerk proxy requests were not observed.
- Blank WebView startup regression was not observed.

## Auth Result

The Android WebView completed a Clerk frontend session. The WebView reported a
loaded Clerk instance, a current user, and a current session. The session token
metadata was inspected only in redacted form:

- Token shape: JWT.
- Algorithm: RS256.
- Issuer: Clerk development frontend API host.
- Authorized party: `https://localhost`.
- Session ID present: yes.
- User subject present: yes, redacted.

However, the Railway backend rejected the authenticated request:

- `GET /api/me/profile`: `401 Unauthorized`
- `POST /api/storage/uploads/request-url`: blocked by the same auth failure

The response body was the app-level unauthorized JSON from the backend auth
middleware, not a storage or CORS error. This means the Android Clerk frontend
session exists, but the deployed Express API is not accepting the WebView bearer
token as an authenticated Clerk session.

## Profile Photo Upload Result

The authenticated profile photo upload flow did not reach R2 in this step.

- Upload URL request: blocked by backend `401 Unauthorized`.
- Direct R2 PUT upload: not attempted after auth failure.
- Upload finalize: not attempted after auth failure.
- Profile save: not attempted after auth failure.
- Profile photo display: not tested after auth failure.
- Persistence after refresh/relaunch: not tested after auth failure.

The previous Step 23 direct backend-to-R2 storage smoke test remains valid, but
the end-to-end Android profile photo flow is still blocked until backend Clerk
token verification works for the mobile WebView session.

## Likely Cause

The most likely cause is Clerk configuration mismatch or incomplete deployed
backend auth configuration, such as:

- Railway backend `CLERK_SECRET_KEY` does not match the Clerk app used by the
  Android build's `VITE_CLERK_PUBLISHABLE_KEY`.
- Railway backend `CLERK_PUBLISHABLE_KEY` does not match the same Clerk app.
- Clerk authorized parties, origins, or mobile/WebView settings do not yet allow
  the `https://localhost` Capacitor origin.
- The backend Clerk middleware needs explicit production configuration for the
  mobile app's Clerk issuer/origin.

Do not bypass this with fake tokens. The next step should verify and fix the
Clerk mobile-to-backend token verification path using real deployment variables
and safe redacted diagnostics.

## R2 Notes

No new R2 credentials were created or printed in this step.

The Step 23 caveat still applies: the current R2 setup used a broader Admin
Read & Write token because the first bucket-scoped tokens were Object Read only
and could not write. Before production launch, replace it with a working
bucket-scoped Object Read & Write token and revoke unused read-only tokens.

## Follow-Up Checklist

Before rerunning this upload smoke test:

1. Confirm the Android build uses the intended Clerk app publishable key.
2. Confirm Railway uses the matching Clerk secret key and publishable key.
3. Confirm the Clerk app allows `https://localhost` for the Capacitor WebView flow.
4. Confirm the backend accepts a real Android WebView Clerk session token for
   `GET /api/me/profile`.
5. Rerun the profile photo flow only after the authenticated profile endpoint
   returns `200` or an expected authenticated `404 Profile not found`.
6. Then test upload URL request, direct R2 PUT, finalize, profile save, image
   display, and persistence after app relaunch.

## Step 25 Retest Result

Date: 2026-06-29

Root cause found in the frontend: the generated `@workspace/api-client-react`
client already supported an auth token getter, but the Vite app only configured
the API base URL and never registered Clerk `getToken()`. The profile upload
helper also requested backend upload URLs without a bearer token. As a result,
mobile WebView sign-in succeeded, but authenticated API calls reached Railway
without a usable `Authorization` header.

Fixes:

- Registered Clerk `getToken()` with the generated API client from inside the
  `ClerkProvider`.
- Added an optional backend auth token getter to `@workspace/object-storage-web`.
- Passed Clerk tokens to backend upload request/finalize calls.
- Preserved token-free direct PUT uploads to R2 signed URLs.

Retest result on the Android emulator:

- Clerk frontend session: present.
- `GET /api/me/profile`: authenticated; returned `404` before profile creation,
  then `200` after profile save.
- `POST /api/storage/uploads/request-url`: `200`.
- Direct R2 PUT to the signed URL: `200`.
- `POST /api/storage/uploads/finalize`: `200`.
- `PUT /api/me/profile`: `200`.
- Profile readback: `200` with a saved photo URL.
- Profile image endpoint: `200` with `image/png`.
- Profile page display: storage image present and loaded in the Android WebView.
- Persistence after reload: confirmed by reading the saved profile again after
  WebView reload.

Railway Clerk environment variables were not changed during this step. Clerk
dashboard settings were not changed during this step. The remaining production
Clerk work is to verify final production keys, allowed origins, and OAuth/deep
link behavior before public launch.

## Step 26 R2 Credential Hardening Retest

Date: 2026-06-29

The Cloudflare R2 credentials used by Railway were replaced with a bucket-scoped
Object Read & Write token for `humanity-profile-uploads`. Credential values,
signed upload URLs, Clerk tokens, cookies, and environment files were not printed
or committed.

Backend and Android validation after the Railway variable update:

- Railway `/health`: passed.
- Railway `/api/healthz`: passed.
- Frontend typecheck: passed.
- Frontend production build: passed.
- Capacitor sync: passed.
- Android debug build: passed.
- APK reinstall and launch on emulator: passed.
- Backend typecheck: passed.
- Backend build: passed.

Authenticated Android upload retest:

- Clerk frontend session: present.
- `GET /api/me/profile`: `200`.
- `POST /api/storage/uploads/request-url`: `200`.
- Direct R2 `PUT` to the signed upload URL: `200`.
- `POST /api/storage/uploads/finalize`: `200`.
- `PUT /api/me/profile`: `200`.
- Profile readback: `200`, with saved `photoUrl` persisted.
- Backend object read through `/api/storage/objects/...`: `200`, with `image/png`.
- Profile reload/readback: persisted photo path still present.

Cloudflare cleanup:

- The old all-buckets `Admin Read & Write` token named
  `humanity-railway-r2-admin-write` was deleted after the new bucket-scoped token
  passed the upload test.
- Two read-only R2 tokens remain visible in Cloudflare. They do not power the
  current Railway backend write path and should be reviewed/revoked later if
  unused.

## Step 31B Play-Installed Upload Regression

Date: 2026-07-02

The Play-installed Google Play Internal testing build `4 (1.0.3)` successfully
completed Google OAuth with the native callback scheme and opened the profile
edit form. A non-private local test PNG was selected through Android's photo
picker.

Observed upload behavior:

- Android photo picker handoff to the app: passed.
- Backend signed upload URL request: `200`.
- Direct upload/finalize chain: failed before finalize.
- App UI message: `Upload failed. Please try again.`

Likely next investigation:

1. Verify Cloudflare R2 bucket CORS allows direct browser/WebView `PUT` uploads
   from the deployed app origin and the Capacitor WebView origin.
2. Compare the signed URL upload headers expected by the backend with the
   headers sent by `@workspace/object-storage-web`.
3. Add non-sensitive client/backend logging around the direct upload failure
   status without printing signed URLs or credentials.
4. Retest `POST /api/storage/uploads/finalize` and profile photo persistence
   after the direct upload succeeds.

## Step 31C Play-Installed Upload Fix Retest

Date: 2026-07-02

Release tested:

- Google Play Internal testing release: `5 (1.0.4)`.
- Package ID: `app.humanity.global`.
- Installer package: `com.android.vending`.
- Android version code: `5`.
- Android version name: `1.0.4`.

Fix summary:

- The Android WebView upload helper now normalizes picker `File` objects into a
  plain `Blob` before direct signed URL upload.
- The direct R2 `PUT` uses `credentials: "omit"` and sends only the expected
  `Content-Type` header.
- If WebView `fetch` fails before receiving an HTTP response, the helper retries
  the same signed upload with an `XMLHttpRequest` fallback.
- Client diagnostics are sanitized and include only upload stage, status, and a
  generic message. Signed URLs, tokens, cookies, and credentials are not logged.

R2 CORS:

- No Cloudflare R2 CORS change was made in this step.
- Existing R2 CORS configuration remained sufficient after the Android WebView
  upload body/header handling was fixed.

Play-installed retest result:

- Google Play Internal testing track showed latest release `5 (1.0.4)`.
- The Play Store AVD updated the installed app from `4 (1.0.3)` to `5 (1.0.4)`
  through Google Play.
- App launch after update: passed.
- Existing authenticated session after update: passed.
- `/api/me/profile` before profile creation: authenticated `404`, expected for
  a signed-in account without a saved profile.
- Profile edit/create form: opened successfully.
- Android photo picker handoff: passed.
- Backend `POST /api/storage/uploads/request-url`: `200`.
- Direct R2 `PUT`: passed, inferred from successful finalize and object read.
- Backend `POST /api/storage/uploads/finalize`: `200`.
- Backend `GET /api/storage/objects/...`: `200`.
- Backend `PUT /api/me/profile`: `200`.
- Backend `GET /api/me/profile` after save: `200`.
- Profile card displayed the uploaded non-private blue test image.
- Uploaded profile photo persisted after app restart; the header avatar still
  showed the uploaded test image.

Additional smoke checks:

- Public `GET /api/countries` returned 24 baseline country records.
- Explore loaded production country data in the Play-installed app.
- Privacy Policy, Terms of Service, and Support footer links were visible in the
  installed mobile UI.
- Account deletion request UI was visible in profile edit.
- Reporting and blocking controls remain implemented, but an end-to-end mobile
  test still needs a second visible test profile.

Remaining risks:

1. Clerk still displays development-mode presentation and should be moved to
   final production configuration before public launch.
2. Username/password sign-in was not separately tested in this pass.
3. Report/block end-to-end testing needs a second test account or seeded visible
   profile.
4. Direct legal/support page navigation should be opened in a short follow-up
   pass before production review.
