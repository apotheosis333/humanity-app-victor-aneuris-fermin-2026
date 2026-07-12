# Clerk Production Migration Checklist

Date: 2026-07-08

This document is a planning checklist only. No Clerk production instance, keys,
OAuth settings, Railway variables, or app binaries were changed in Step 33. Do
not commit Clerk keys, Railway tokens, cookies, credentials, `.env` files, AABs,
APKs, signing keys, or private account data.

## Current State

- HuMANity currently uses a Clerk Development environment for internal Android
  QA.
- Google OAuth works in the Play-installed internal test build.
- The current native callback is `app.humanity.global://callback`.
- The Android native sign-in UI still includes a visible Development mode label.
- A Clerk production instance was not created during Step 33.

Development mode is acceptable for a small internal-only QA loop, but it should
be replaced before broader closed testing, app review, or production launch.

## Migration Steps

1. Create a Clerk production instance for the HuMANity Clerk application.
2. Configure the production Clerk app name, branding, and allowed sign-in
   methods.
3. Configure Google OAuth/social connection in the production Clerk instance.
4. Add native/mobile callback and redirect settings for:

```text
app.humanity.global://callback
```

5. Add allowed origins/redirects for the deployed web frontend, deployed backend
   proxy if used, and Capacitor WebView origin as required by Clerk.
6. Confirm no production mobile OAuth setting points to localhost or a Replit
   proxy.
7. Update Railway backend environment variables with production Clerk values:

```text
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
```

8. Update the local or CI mobile/frontend build environment with the production
   client-safe value:

```text
VITE_CLERK_PUBLISHABLE_KEY=
```

9. Keep `VITE_CLERK_PROXY_URL` unset for native Capacitor builds unless a
   deliberate production Clerk proxy strategy is implemented and tested.
10. Remove or gate the native sign-in `Development mode` label.
11. Rebuild the frontend, sync Capacitor, and build Android.
12. If Android code/config changes are required, bump to the next release
    version before upload.
13. Generate a new signed release AAB using local ignored signing files.
14. Upload only to Google Play Internal testing.
15. Retest on a Play-installed build:
    - Google OAuth.
    - Clerk session persistence.
    - `/api/me/profile`.
    - Profile create/edit.
    - Cloudflare R2 profile photo upload.
    - Explore/countries.
    - Report/block.
    - Account deletion request.
    - Privacy/terms/support.
16. Confirm Clerk Development mode is no longer visible.
17. Confirm backend logs show authenticated API calls without leaking tokens or
    signed URLs.

## Rollback Plan

- Keep the current internal testing build and development Clerk configuration
  documented until production Clerk passes QA.
- If production Clerk auth fails, do not promote the build. Revert local ignored
  mobile env values to the previous working development Clerk values and retest
  internally.
- Do not delete the working development Clerk app during migration.

## Approval Gate

Pause for explicit approval before:

- Creating the Clerk production instance.
- Updating Railway Clerk variables.
- Changing OAuth provider credentials.
- Removing or rotating Clerk keys.
- Uploading/publishing a new Internal testing release.

## Step 37 Decision Note

Date: 2026-07-09

Recommendation: complete Clerk production migration before broader closed
testing, Play policy submission that depends on stable reviewer access, or
production review.

Rationale:

- The current Play-installed internal build works with Clerk Development mode,
  but the native sign-in UI still shows a visible `Development mode` label.
- Reviewers may treat Development mode as unfinished or confusing.
- Production OAuth callback/origin settings must be verified with
  `app.humanity.global://callback`.
- Railway backend Clerk variables and the mobile/frontend publishable key must
  be switched together and retested.

Packaging impact:

- Clerk production migration should be bundled with the Step 36 legal and
  `/data-deletion` route changes in the next Internal testing release.
- The next likely Android version after current internal testing
  `5 (1.0.4)` is `versionCode 6`, `versionName 1.0.5`, unless the release plan
  changes.
- Do not upload the new AAB until migration is approved, built, and retested.

## Step 38 Prepared Migration Plan

Date: 2026-07-09

Planning approval exists, but production Clerk settings and keys must not be
switched until an explicit migration step.

Exact migration plan for the next Clerk implementation step:

1. Create Clerk production instance.
2. Configure Google OAuth in Clerk production.
3. Add native callback:

```text
app.humanity.global://callback
```

4. Add required allowed origins/redirects for deployed web frontend,
   Capacitor WebView origin, and backend/proxy settings if used.
5. Copy the production publishable key into local ignored mobile env only.
6. Set Railway backend Clerk production secret/env vars without printing values.
7. Confirm Railway backend verifies production Clerk tokens.
8. Remove or gate the native sign-in `Development mode` label.
9. Rebuild Android as `versionCode 6`, `versionName 1.0.5`.
10. Include Step 36 legal/data-deletion route changes in the release.
11. Build the signed AAB with ignored local signing files.
12. Upload to Google Play Internal testing only.
13. Test Google OAuth, `/api/me/profile`, R2 upload, Explore, report/block,
    privacy/terms/support/data-deletion.
14. Confirm Clerk Development label is gone.

Recommended sequencing:

1. Deploy public frontend/legal pages first so Play policy URLs can be finalized.
2. Then perform Clerk production migration and Android `1.0.5` internal release.

## Step 40 Production Migration Status

Date: 2026-07-09

Status:

- Clerk production instance was created for HuMANity.
- Production application domain was set to `app.humanity.global` because Clerk
  does not allow `railway.app` as the production app domain.
- Production Google OAuth was configured in Clerk with custom Google
  credentials.
- The required Google authorized redirect URI was configured as:

```text
https://clerk.humanity.global/v1/oauth_callback
```

- The initial Google OAuth client created during setup was deleted after its
  generated secret appeared in the Google Cloud page controls during
  inspection. A clean replacement client was created and used for Clerk.
- The visible native Android `Development mode` label is now gated to Clerk
  test publishable keys only.
- Android Gradle metadata was bumped to `versionCode 6`, `versionName 1.0.5`.

Not completed in this pass:

- Railway backend/frontend Clerk env vars were not switched to production.
- Public frontend/backend redeploy with production Clerk was not verified.
- Signed Android `1.0.5` AAB was not built or uploaded.
- Play-installed `1.0.5` smoke testing was not run.

Remaining required env updates:

Backend Railway service:

```text
CLERK_SECRET_KEY=<production Clerk secret key>
CLERK_PUBLISHABLE_KEY=<production Clerk publishable key>
```

Frontend Railway service and local ignored mobile env:

```text
VITE_CLERK_PUBLISHABLE_KEY=<production Clerk publishable key>
VITE_API_BASE_URL=https://humanity-app-victor-aneuris-fermin-2026-production.up.railway.app
```

Do not commit production Clerk keys, local `.env` files, Google OAuth client
secrets, Railway tokens, signing files, AABs, APKs, or private account data.

## Step 40B Production Env Switch And Internal Release

Date: 2026-07-10

Status:

- Railway backend Clerk variables were switched to the Clerk production
  instance without printing or committing secret values.
- Railway frontend/mobile public configuration was switched to the production
  Clerk publishable key and deployed backend API base URL.
- Backend and frontend Railway services were redeployed and returned online.
- Public backend checks passed:
  - `GET /health`: `200`.
  - `GET /api/healthz`: `200`.
  - `GET /api/countries`: `200`, returning 24 baseline country records.
  - `GET /api/me/profile` without auth: `401`, as expected.
- Public frontend/legal URL checks passed for `/`, `/privacy`, `/terms`,
  `/support`, and `/data-deletion`.
- Android `versionCode 6`, `versionName 1.0.5` was built as a signed AAB and
  uploaded to Google Play Internal testing.
- Google Play Internal testing release `6 (1.0.5)` is active and available to
  internal testers.
- The Play Store AVD updated HuMANity from `5 (1.0.4)` to `6 (1.0.5)` through
  Google Play.

Play-installed result:

- Package ID: `app.humanity.global`.
- Version code: `6`.
- Version name: `1.0.5`.
- Installer package: `com.android.vending`.
- App launch: passed.
- Blank WebView check: passed.
- Clerk development label: not observed on the public startup surface.
- Explore route opened but displayed `Showing 0 of 195 nations` even though the
  deployed backend returned 24 country records from the workstation. This needs
  a focused follow-up before broader testing.
- Authenticated profile, Google OAuth, `/api/me/profile`, and upload flows were
  not completed in this pass because the sign-in/profile route was not reached
  reliably from the emulator UI after the update.

Security notes:

- Production Clerk keys, Railway tokens, Google credentials, tester emails,
  `.env` files, signing files, AABs/APKs, build outputs, cookies, and private
  account data were not committed.

## Step 42 Android Clerk Loading Finding

Date: 2026-07-12

Play-installed `8 (1.0.7)` uses the production Clerk configuration in the
packaged Android app, but the signed-out header auth control remained in a Clerk
loading state during the Android WebView retest. This hid the intended
`/sign-in` entry point.

The immediate app-side fix is intentionally narrow:

- Keep the production Clerk configuration unchanged.
- Do not expose or print Clerk keys.
- Render the existing `/sign-in` link while Clerk is still initializing, so
  Android users are not trapped behind a loading-only auth control.
- Retest production Google OAuth from the Play-installed `9 (1.0.8)` build after
  it is uploaded to Internal testing.

Remaining Clerk validation:

- Confirm the native Google OAuth screen appears.
- Confirm no Clerk Development warning appears.
- Confirm Google OAuth returns through `app.humanity.global://callback`.
- Confirm `/api/me/profile` succeeds after sign-in.
