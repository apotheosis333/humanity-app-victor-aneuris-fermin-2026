# Backend Deployment Notes

These notes are for deploying the HuMANity Express API to Render or Railway. Do not put real secret values in this file.

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

Object storage is not fully cloud-portable yet. The current backend storage implementation still depends on Replit-style object storage behavior, including a local Replit sidecar endpoint for signed URLs.

Before a full non-Replit Render/Railway launch, replace or rework object storage with a deployable provider flow such as Google Cloud Storage, S3-compatible storage, Supabase Storage, or another production storage service.
