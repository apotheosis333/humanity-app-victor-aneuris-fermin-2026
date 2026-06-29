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

