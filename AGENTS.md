# AGENTS.md

## Project Overview

HuMANity is a social platform for selfless connection, global understanding, peace, and helping people discover humanity beyond stereotypes.

The launch goal is to prepare the existing Vite/React web app and Express backend for eventual iOS and Android launch using Capacitor, but only after the backend, authentication, storage, API configuration, mobile responsiveness, and app-store compliance work are ready.

## Monorepo Structure

- `artifacts/humanity` - Vite/React frontend.
- `artifacts/api-server` - Express backend API.
- `lib/db` - Drizzle/PostgreSQL database package.
- `lib/api-client-react` - generated React API client.
- `lib/api-zod` - generated API validation/types.
- `lib/object-storage-web` - upload UI helpers.
- `scripts` - workspace tooling.
- `attached_assets` - imported assets.

## Package Manager And Workspace

This repo uses PNPM workspaces.

- Workspace config: `pnpm-workspace.yaml`
- Lockfile: `pnpm-lock.yaml`
- Use `pnpm`, not `npm` or `yarn`.

## Commands

Run commands from the repo root unless a package filter is shown.

### Install

```bash
pnpm install
```

### Root Package

```bash
pnpm run build
pnpm run typecheck
pnpm run typecheck:libs
```

No root `dev`, `start`, `test`, or `lint` script is currently defined.

### Frontend Package

```bash
pnpm --filter @workspace/humanity run dev
pnpm --filter @workspace/humanity run build
pnpm --filter @workspace/humanity run serve
pnpm --filter @workspace/humanity run typecheck
```

The frontend Vite build output is configured under `artifacts/humanity/dist/public`.

### Backend Package

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
pnpm --filter @workspace/api-server run typecheck
```

The backend `start` script expects the server bundle to already exist in `artifacts/api-server/dist`.

### Database Package

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run push-force
```

No database migration script beyond Drizzle push commands is currently defined.

## Environment Variables

Do not commit real environment values. This list documents variable names only.

Known or likely required variables:

- `DATABASE_URL` - PostgreSQL connection string used by `lib/db`.
- `PORT` - required by the backend server and currently required by the frontend Vite config.
- `CORS_ORIGINS` - comma-separated backend CORS allowlist for deployed web and mobile origins.
- `BASE_PATH` - currently required by the frontend Vite config.
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for the frontend.
- `VITE_CLERK_PROXY_URL` - optional Clerk proxy URL used by the frontend.
- `CLERK_SECRET_KEY` - Clerk secret key used by the backend/proxy.
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key used by backend Clerk middleware.
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI integration base URL.
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI integration API key.
- `PUBLIC_OBJECT_SEARCH_PATHS` - public object storage search paths.
- `PRIVATE_OBJECT_DIR` - private object storage directory.
- `LOG_LEVEL` - optional backend logging level.
- `NODE_ENV` - runtime environment.

Rules:

- Never commit `.env` files.
- Never commit API keys, tokens, passwords, private keys, database URLs, Clerk secrets, service account JSON, session files, or credentials.
- Add `.env.example` later with placeholder values only.
- Secrets must live in deployment provider dashboards or local ignored env files, not in GitHub.

## Safety Rules For Codex

- Complete only the assigned step.
- Do not expose secrets.
- Do not commit `.env` files.
- Do not delete files unless explicitly approved.
- Do not rewrite the whole app unless explicitly requested.
- Preserve the existing UI and branding unless the task asks for UI changes.
- Prefer small pull-request-sized changes.
- Stop and ask if multiple project choices are detected.
- Stop and ask before destructive actions.
- Do not add Capacitor until all pre-Capacitor tasks are approved.
- Do not deploy, merge branches, or submit to app stores unless explicitly asked.

## Current Launch-Readiness Findings

From the Step 1 audit:

- Frontend is Vite + React + TypeScript + Tailwind.
- Backend is Express + TypeScript.
- Database is PostgreSQL with Drizzle.
- Authentication is Clerk.
- The frontend can build static output for Capacitor in principle.
- The API base URL is not yet mobile-configurable.
- Replit object storage behavior is a deployment blocker for Render/Railway-style hosting.
- CORS is too permissive for production.
- A health endpoint exists as `/api/healthz`, but not as `/health`.
- App-store compliance features are missing or unverified, including reporting, blocking, account deletion, privacy policy, terms, support/contact, and moderation workflows.
- Capacitor is recommended later, not now.

## Required Order Of Future Work

1. Create `AGENTS.md`.
2. Centralize mobile-safe API configuration with `VITE_API_BASE_URL`.
3. Add `.env.example` files with placeholders only.
4. Prepare backend deployment config and health endpoint.
5. Replace or rework Replit object storage dependency.
6. Add production CORS allowlist.
7. Review and secure unauthenticated write routes.
8. Confirm Clerk production/mobile strategy.
9. Add reporting, blocking, account deletion, privacy, terms, support, and moderation.
10. Perform mobile responsiveness pass.
11. Add Capacitor.
12. Prepare Android build.
13. Prepare iOS build.
14. Prepare store listings and launch materials.

## Definition Of Done For Future Tasks

A future task is done when:

- The assigned step, and only the assigned step, is complete.
- Code compiles or the task explains why build/typecheck was not run.
- Typecheck/build commands are run when appropriate for the scope.
- Files changed are summarized.
- Testing steps are provided.
- Secrets are not exposed.
- No unrelated changes are made.
- Risks and manual steps are clearly listed.
