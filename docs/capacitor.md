# Capacitor Mobile Wrapper

Step 15 adds Capacitor to the HuMANity Vite/React frontend without changing backend behavior or app UI.

## Configuration

- Frontend package: `artifacts/humanity`
- Capacitor config: `artifacts/humanity/capacitor.config.ts`
- App name: `HuMANity`
- App ID placeholder: `com.humanity.app`
- Web directory: `dist/public`

The app ID is a professional placeholder. Replace it before store submission if the founder chooses a final domain or organization namespace.

## Scripts

From the repo root:

```bash
pnpm run mobile:build
pnpm run cap:copy
pnpm run cap:sync
pnpm run cap:add:android
pnpm run cap:add:ios
pnpm run cap:open:android
pnpm run cap:open:ios
pnpm run android:bundle:release
```

From `artifacts/humanity`, the same scripts are available without the workspace filter.

`mobile:build` supplies default local build values for `PORT=5173` and `BASE_PATH=/` when they are not already set.

Capacitor-generated copied web assets and generated native config files are intentionally ignored by the generated native `.gitignore` files. Run `pnpm run cap:sync` after cloning or after any frontend build/config change.

## Required Mobile Environment

Mobile builds must point to a deployed backend:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_or_test_placeholder
```

Do not put private secrets in `VITE_` variables. Backend secrets such as `DATABASE_URL`, `CLERK_SECRET_KEY`, storage access keys, and OpenAI keys belong only in backend deployment environments.

For Android/iOS smoke testing, put real local values only in an ignored frontend env file such as `artifacts/humanity/.env.local`, then rebuild and run `pnpm run cap:sync`. Do not commit that file.

Do not use localhost or Replit Clerk proxy settings for Capacitor builds. Native WebViews run the app at `https://localhost`, so a Clerk proxy such as `https://clerk.localhost` will fail inside Android/iOS. The app only applies `VITE_CLERK_PROXY_URL` on non-native web builds.

## Android

Android platform files live under `artifacts/humanity/android` after `cap add android`.

Android launcher and splash resources are generated inside the Android project under `artifacts/humanity/android/app/src/main/res`. Step 27 replaced the default Capacitor assets with temporary HuMANity-branded launcher and splash assets generated from `artifacts/humanity/public/logo.png`.

Step 28 added a signed Android App Bundle command for Google Play Internal Testing:

```bash
pnpm run android:bundle:release
```

Release signing uses ignored local files under `artifacts/humanity/android/key.properties` and `artifacts/humanity/android/release-signing/`. Do not commit those files or the generated `.aab`.

Manual Android steps not performed in this repo:

- Install Android Studio and a supported JDK.
- Open the project with `pnpm run cap:open:android`.
- Replace temporary icon/splash placeholders with final designer-approved assets.
- Confirm package display name and release signing.
- Generate signing keys outside the repo.
- Build debug APKs and release AABs in Android Studio.
- Upload only through Google Play Console when the account and listing are ready.

## iOS

iOS platform files live under `artifacts/humanity/ios` after `cap add ios` if generated.

Manual iOS steps not performed in this repo:

- Use macOS with Xcode installed.
- Run `pnpm install`, then `pnpm run cap:sync`.
- Open the project with `pnpm run cap:open:ios`.
- Configure Apple signing, team, provisioning profiles, final bundle ID, icons, and splash assets in Xcode.
- Submit TestFlight builds only from an approved Apple developer account.

## Backend, Auth, And Storage Warnings

- `VITE_API_BASE_URL` must be set to the deployed API URL for Android/iOS builds.
- Clerk authentication must be tested inside Android and iOS Capacitor WebViews.
- Google/social OAuth may require Clerk provider redirect configuration and real-device testing.
- Profile uploads require a deployed backend and configured S3-compatible storage such as Cloudflare R2.
- CORS must allow the deployed web origin and mobile origins such as `capacitor://localhost` and `ionic://localhost`.

## Pre-TestFlight And Google Internal Testing Checklist

- Run frontend and backend typechecks/builds.
- Run `pnpm run cap:sync` after every frontend build or config change.
- Verify Android project opens in Android Studio.
- Verify iOS project opens in Xcode on macOS.
- Sign in with Clerk inside each native app.
- Confirm API calls use the deployed backend.
- Upload and view a profile image.
- Test reporting, blocking, messaging, account deletion request, legal/support links, and error states.
- Confirm no signing keys, `.env` files, secrets, or build artifacts are committed.
