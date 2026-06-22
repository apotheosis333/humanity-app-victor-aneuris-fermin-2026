# Step 22 Backend Deployment And Mobile API Smoke Test

Date: 2026-06-22

This step could not complete an automated cloud deployment from this workstation because provider dashboard control was unavailable and no Railway/Render API token or required backend secrets were present in the local environment. This file is the safe handoff checklist for completing the deployment without committing secrets.

## Deployment Target

Preferred provider: Railway.

Fallback provider: Render.

Repository:

```text
apotheosis333/humanity-app-victor-aneuris-fermin-2026
```

Branch:

```text
replit-source-import
```

## Backend Commands

Configure the backend service from the repository root.

Build command:

```bash
pnpm install && pnpm run backend:build
```

Start command:

```bash
pnpm run backend:start
```

Health check path:

```text
/health
```

API health path:

```text
/api/healthz
```

The backend package is `@workspace/api-server` at `artifacts/api-server`.

## Required Provider Environment Variables

Set real values only in the Railway or Render dashboard. Do not put real values in GitHub, docs, committed files, or frontend env.

Required for a useful backend deployment:

```bash
NODE_ENV=production
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CORS_ORIGINS=
```

Provider-managed:

```bash
PORT=
```

Optional but needed for full feature coverage:

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
LOG_LEVEL=
TRUST_PROXY_HOPS=
RATE_LIMIT_WINDOW_MS=
RATE_LIMIT_PUBLIC_MAX=
RATE_LIMIT_AUTH_MAX=
RATE_LIMIT_AI_MAX=
RATE_LIMIT_UPLOAD_MAX=
```

Do not set `CLERK_SECRET_KEY`, database URLs, OpenAI keys, or storage credentials in any `VITE_` frontend variable.

## Suggested CORS_ORIGINS

Use a comma-separated allowlist. Include only origins that should call the API with credentials.

Placeholder pattern:

```bash
CORS_ORIGINS=https://localhost,capacitor://localhost,ionic://localhost,https://your-deployed-frontend-domain.com
```

Add local development origins only when intentionally needed:

```bash
http://localhost:5173,http://localhost:3000
```

Do not use wildcard CORS in production.

## Railway Checklist

1. Create a new Railway project.
2. Add a PostgreSQL service if no production database exists.
3. Create a backend service from the GitHub repository and select `replit-source-import`.
4. Confirm the service uses the repository root.
5. Set the build command to `pnpm install && pnpm run backend:build`.
6. Set the start command to `pnpm run backend:start`.
7. Set the health check path to `/health`.
8. Add the required environment variables in Railway variables.
9. Do not paste secret values into build logs, GitHub issues, docs, or source files.
10. Deploy the backend service.
11. Open the generated backend URL and verify `/health`.

## Render Checklist

1. Create a new Web Service.
2. Connect the GitHub repository and select `replit-source-import`.
3. Use the repository root as the root directory unless Render requires otherwise.
4. Set the build command to `pnpm install && pnpm run backend:build`.
5. Set the start command to `pnpm run backend:start`.
6. Set the health check path to `/health`.
7. Add a managed PostgreSQL database if no production database exists.
8. Add the required environment variables in Render environment settings.
9. Do not paste secret values into build logs, GitHub issues, docs, or source files.
10. Deploy the backend service.
11. Open the generated backend URL and verify `/health`.

## Database Setup

The backend uses PostgreSQL through Drizzle and requires `DATABASE_URL`.

Before running schema push:

1. Confirm the database is a new or intended production database.
2. Confirm the provider/project/service name without revealing the connection string.
3. Review the schema impact.
4. Run the push only after explicit approval:

```bash
pnpm --filter @workspace/db run push
```

Do not run `push-force` against production without a schema review.

## Storage Setup

Basic health and auth smoke tests can proceed without S3/R2 storage if upload testing is deferred.

For upload testing on Railway or Render, configure S3-compatible storage:

```bash
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

Cloudflare R2 remains the recommended first provider. Configure bucket CORS for browser/mobile direct PUT uploads before testing profile photo upload.

## Backend Verification

After deployment, verify only non-secret diagnostics:

```bash
curl https://your-backend.example.com/health
curl https://your-backend.example.com/api/healthz
```

Expected `/health` shape:

```json
{
  "ok": true,
  "service": "humanity-api",
  "timestamp": "..."
}
```

Expected unauthenticated protected endpoint behavior:

```text
401 or 403
```

Do not copy tokens, cookies, database URLs, or secret-bearing logs into chat or docs.

## Local Mobile Env

After the backend URL is known, update only the ignored local file:

```text
artifacts/humanity/.env.local
```

Keep the existing frontend-safe Clerk publishable key and add:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url.com
```

Confirm the local env file is ignored:

```bash
git check-ignore -v artifacts/humanity/.env.local
git status --short
```

## Android Rebuild And Smoke Test

From the repository root:

```powershell
pnpm --filter @workspace/humanity run typecheck
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run cap:sync
pnpm run android:build:debug
adb install -r artifacts/humanity/android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.humanity.app -c android.intent.category.LAUNCHER 1
```

Verify:

1. App opens.
2. Home renders.
3. Clerk sign-in UI loads.
4. No `clerk.localhost` requests.
5. No Replit Clerk proxy requests.
6. Backend requests use `VITE_API_BASE_URL`.
7. `/health` or another simple backend request succeeds from the device.
8. Auth flow can start.
9. Completed login is tested only with a real test account.
10. Backend failures show a non-blank UI.

## Current Step 22 Status

- Deployment provider used: none yet.
- Backend service status: not created from this workstation.
- Backend URL: pending.
- Health check: pending deployed backend.
- Database setup: pending provider database or existing production database.
- DB schema push: not run.
- Storage setup: pending R2/S3 credentials; upload smoke test deferred.
- Local mobile `VITE_API_BASE_URL`: not updated because no deployed backend URL exists yet.
- Android API smoke test: pending deployed backend URL.

## Remaining Blockers

- Railway or Render dashboard access is required.
- A production PostgreSQL database URL is required.
- Clerk backend secret and publishable keys are required in the backend provider dashboard.
- Optional OpenAI and S3/R2 secrets are required for full feature coverage.
- A deployed backend URL is required before Android backend-dependent flows can be smoke-tested.
