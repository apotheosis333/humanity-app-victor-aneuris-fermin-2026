# Backend Deployment Notes

These notes are for deploying the HuMANity Express API to Render or Railway. Do not put real secret values in this file.

For the Step 22 mobile backend deployment handoff and Android API smoke-test checklist, see `docs/step22-backend-deployment-mobile-smoke-test.md`.

Step 22B deployed the backend to Railway:

```text
https://humanity-app-victor-aneuris-fermin-2026-production.up.railway.app
```

Current verified status:

- Railway backend deployment: `SUCCESS`
- `/health`: passing
- `/api/healthz`: passing
- Railway Postgres: provisioned
- Initial schema: applied
- Android WebView API smoke test: passed

See `docs/step22-backend-deployment-mobile-smoke-test.md` for the exact deployment and smoke-test record.

## Backend Package

- Workspace package: `@workspace/api-server`
- Package path: `artifacts/api-server`
- Server entry after build: `artifacts/api-server/dist/index.mjs`

## Build And Start Commands

From the repository root:

```bash
pnpm install
pnpm run backend:build
pnpm run backend:start
```

Equivalent package-filter commands:

```bash
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

For Render or Railway, use:

- Build command: `pnpm install && pnpm run backend:build`
- Start command: `pnpm run backend:start`
- Health check path: `/health`

The existing `/api/healthz` endpoint is preserved for API-level health checks.

## Required Environment Variables

Set these in the Render/Railway service dashboard. Use real values only in the provider dashboard, never in GitHub.

```bash
NODE_ENV=production
PORT=
DATABASE_URL=
CORS_ORIGINS=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
AI_INTEGRATIONS_OPENAI_BASE_URL=
AI_INTEGRATIONS_OPENAI_API_KEY=
PUBLIC_OBJECT_SEARCH_PATHS=
PRIVATE_OBJECT_DIR=
REPLIT_SIDECAR_ENDPOINT=
STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
LOG_LEVEL=
```

`PORT` is usually injected by Render/Railway. The backend requires it and will fail startup if it is missing or invalid.

## CORS_ORIGINS

`CORS_ORIGINS` is a comma-separated allowlist of frontend origins that may call the API with credentials.

Placeholder example:

```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-frontend-domain.com,capacitor://localhost,ionic://localhost
```

Local development origins are allowed automatically when `NODE_ENV` is not `production`. In production, browser origins must be listed explicitly. Requests without an `Origin` header, such as health checks and server-to-server calls, are still allowed.

## Database

The backend uses PostgreSQL through Drizzle and requires `DATABASE_URL`.

See `docs/database-auth-readiness.md` for the current database/auth production checklist and known account deletion gaps.

Before pointing production traffic at the backend, provision a production PostgreSQL database and run the repository's database setup command from a trusted environment:

```bash
pnpm --filter @workspace/db run push
```

Review schema changes before running `push-force`.

## Clerk

Set Clerk production values in the provider dashboard:

```bash
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
```

The frontend also needs its public Clerk value through `VITE_CLERK_PUBLISHABLE_KEY`.

## OpenAI Integration

The backend imports server-side OpenAI integration code for features such as world news and walk-in-shoes generation.

```bash
AI_INTEGRATIONS_OPENAI_BASE_URL=
AI_INTEGRATIONS_OPENAI_API_KEY=
```

## Storage Warning

Object storage now supports the existing Replit sidecar mode and an S3-compatible mode selected by `STORAGE_PROVIDER`.

For Render/Railway, use `STORAGE_PROVIDER=s3` with a provider such as Cloudflare R2, AWS S3, or Backblaze B2. Replit mode still depends on a Replit sidecar and is not suitable for normal Render/Railway deployment. See `docs/storage-readiness.md` for setup details.
