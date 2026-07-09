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
