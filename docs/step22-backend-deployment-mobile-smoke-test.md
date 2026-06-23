# Step 22B Railway Backend Deployment And Android API Smoke Test

Date: 2026-06-23

This note records the backend deployment and Android API smoke test completed from the Windows development machine. Do not put real secret values in this file.

## Deployment Summary

- Provider: Railway
- Railway project: `energetic-perception`
- Backend service: `humanity-app-victor-aneuris-fermin-2026`
- Postgres service: `Postgres`
- GitHub repo: `apotheosis333/humanity-app-victor-aneuris-fermin-2026`
- Branch: `replit-source-import`
- Backend URL: `https://humanity-app-victor-aneuris-fermin-2026-production.up.railway.app`
- Deployment status: `SUCCESS`
- Deployment health check path: `/health`

The backend service is connected to the `replit-source-import` branch. The first successful Railway deployment was completed from a local snapshot so the backend could be smoke-tested before this documentation commit reached GitHub.

## Railway Build Configuration

Railway uses `railway.json` at the repository root.

Build command:

```bash
corepack enable && corepack prepare pnpm@11.7.0 --activate && pnpm install --frozen-lockfile && pnpm run backend:build
```

Start command:

```bash
pnpm run backend:start
```

Health check:

```text
/health
```

The root `package.json` pins `packageManager` to `pnpm@11.7.0` so Railway/Corepack uses the same major PNPM version as the local lockfile.

## Environment Variables

The Railway backend service was configured with provider-side variables only. Real values must stay in Railway, local ignored env files, or another secret manager.

Required:

```bash
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CORS_ORIGINS=https://localhost,capacitor://localhost,ionic://localhost
```

Provider-managed:

```bash
PORT=
```

Optional for full feature coverage:

```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=
AI_INTEGRATIONS_OPENAI_API_KEY=
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

`STORAGE_PROVIDER=s3` was intentionally not enabled during this smoke test because real S3/R2 values were not configured yet.

## Health And API Verification

Verified backend endpoints:

```text
GET /health -> 200
GET /api/healthz -> 200
GET /api/me/profile without auth -> 401
GET /api/countries -> 200
```

Expected `/health` shape:

```json
{
  "ok": true,
  "service": "humanity-api",
  "timestamp": "..."
}
```

`/api/healthz` is registered before Clerk middleware so provider health checks can verify API liveness without requiring Clerk configuration or a user session.

## Database Setup

Railway Postgres was provisioned and linked through `DATABASE_URL`.

The intended Drizzle command:

```bash
pnpm --filter @workspace/db run push
```

The command connected to the Railway database but did not finish cleanly from the Railway run environment. After explicit approval, the initial schema was generated locally with Drizzle and applied to the Railway Postgres database through a temporary Railway TCP proxy.

Result:

```text
Applied 39 schema statements.
```

The temporary public TCP proxy was deleted after schema setup. `railway tcp-proxy list` for the Postgres service returned an empty list afterward.

## Storage Status

Storage upload testing is still pending.

The backend can start without S3/R2 values because Replit storage remains the default mode and S3 mode is enabled only when `STORAGE_PROVIDER=s3`. For Railway production upload testing, configure Cloudflare R2 or another S3-compatible provider before testing profile photos or object URLs.

See `docs/storage-readiness.md` for the storage setup plan.

## Local Mobile Env

The ignored local frontend env file was updated:

```text
artifacts/humanity/.env.local
```

It contains the deployed backend URL:

```bash
VITE_API_BASE_URL=https://humanity-app-victor-aneuris-fermin-2026-production.up.railway.app
```

The file remains ignored by Git and must not be committed.

## Android API Smoke Test

Device:

- Android emulator: `HuMANity_Pixel_API_36`
- Package: `com.humanity.app`

Commands run from the repository root:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:build:debug
adb install -r artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.humanity.app -c android.intent.category.LAUNCHER 1
```

Results:

- Frontend typecheck: passed
- Frontend production build: passed
- Capacitor sync: passed
- Android debug build: passed
- APK reinstall: passed
- Native launch: passed
- Home screen rendering: passed
- Backend `/health` fetch from inside Android WebView: passed
- Railway API requests from WebView: observed
- Clerk sign-in route rendering: passed
- `https://clerk.localhost` requests: not observed
- Replit Clerk proxy requests: not observed

The sign-in page rendered Clerk's development-mode sign-in UI. No credentials were entered and no completed login was tested.

## Remaining Risks

- Completed Android sign-in still needs a real test account.
- Google OAuth needs final Clerk redirect/origin configuration and real-device testing.
- Production Clerk keys should replace development keys before public launch.
- S3/R2 storage must be configured before upload/profile-photo smoke testing.
- OpenAI env vars are still needed before AI-backed features can be used in production.
- A deployed web frontend origin should be added to `CORS_ORIGINS` before public web deployment.
- The Railway service name can be renamed to a cleaner name later, but the current service is functional.
