# Database And Auth Production Readiness

This note documents the current database and Clerk authentication setup for HuMANity. It contains no secret values.

## Database Setup

- Database engine: PostgreSQL.
- ORM/tooling: Drizzle ORM and Drizzle Kit.
- Database package: `lib/db`.
- Runtime database entry: `lib/db/src/index.ts`.
- Drizzle config: `lib/db/drizzle.config.ts`.
- Schema exports: `lib/db/src/schema/index.ts`.
- Required variable: `DATABASE_URL`.

The database package currently exposes these scripts:

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run push-force
```

No generated migration folder, migration history table setup, or seed script was found during Step 6. Treat `push-force` as dangerous for production unless a developer has reviewed the exact schema impact.

## Current Tables

The current schema includes:

- `accounts` - Clerk account registry keyed by Clerk `user_id`.
- `profiles` - onboarding/profile data keyed by Clerk `user_id`.
- `connections` - pending/accepted social connections.
- `messages` - direct messages between connected users.
- `countries`, `timeline_events`, `cultural_milestones`, `stories`, `country_phrases`, `humanity_pledges` - country, content, and pledge data.
- `dinner_questions`, `dinner_answers` - dinner table prompts and user answers.
- `world_news`, `news_reactions`, `news_saves` - generated news and authenticated user interactions.

## Production Database Checklist

Before production launch:

1. Provision a managed PostgreSQL database.
2. Set `DATABASE_URL` only in the deployment provider dashboard.
3. Run `pnpm --filter @workspace/db run push` from a trusted environment.
4. Review whether this project should switch from `drizzle-kit push` to versioned Drizzle migrations before public launch.
5. Add a backup/restore plan for production data.
6. Add a rollback plan for schema changes.
7. Avoid running `push-force` against production without explicit review.

## Clerk Auth Setup

Frontend Clerk usage:

- `artifacts/humanity/src/App.tsx`
- Requires `VITE_CLERK_PUBLISHABLE_KEY`.
- Optionally uses `VITE_CLERK_PROXY_URL`.

Backend Clerk usage:

- `artifacts/api-server/src/app.ts`
- `artifacts/api-server/src/middlewares/auth.ts`
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`
- `artifacts/api-server/src/lib/accounts.ts`
- Requires `CLERK_SECRET_KEY` for Clerk server operations/proxy behavior.
- Uses `CLERK_PUBLISHABLE_KEY` in backend Clerk middleware.

The backend uses `requireAuth` for protected routes and `optionalAuth` where public reads can include user-specific state. Authenticated requests record an `accounts` row through `recordAccount(userId)`. Server startup also calls `syncAccountsFromClerk()` to mirror Clerk users into the local account registry.

## Route Protection Notes

Protected user/social writes observed:

- Profile read/update for the current user.
- Profile pledge flag for the current user.
- Connection request, accept, delete, and disconnect flows.
- Direct messages and read markers.
- Dinner table answer submission.
- Storage upload request/finalize.
- World news reactions and saves.

Public write routes that need product/security review before production:

- `POST /api/countries`
- `POST /api/countries/:code/timeline`
- `POST /api/countries/:code/milestones`
- `POST /api/countries/:code/stories`
- `POST /api/pledge`
- `POST /api/walk-in-shoes`

Some of these may be intentionally public, but production should still define rate limits, abuse controls, moderation, and auth/admin gating where appropriate.

## Account Deletion Gap

No complete account deletion flow was found.

Missing pieces:

- No `DELETE /api/me/account` or equivalent backend route.
- No frontend account deletion screen/action.
- No cleanup flow for profile, connections, messages, dinner answers, news reactions/saves, uploads, and account registry data.
- No Clerk user deletion integration or documented manual deletion process.
- No soft-delete/hard-delete policy.

Before app-store submission, implement and document an account deletion flow that covers both Clerk and application-owned data.

## Clerk Production And Mobile Risks

- Replit-managed Clerk behavior is referenced in existing comments/docs and should be verified for a normal Clerk production instance.
- Capacitor/mobile builds may not behave like same-origin browser sessions. Confirm whether Clerk cookies/proxy behavior works inside Capacitor or whether token-based API auth is required.
- If token auth is needed, the generated API client already exposes `setAuthTokenGetter`, but the frontend does not currently configure it.
- Production Clerk allowed origins, redirect URLs, callback URLs, and OAuth provider settings must be configured manually in Clerk before launch.

## Manual Setup Required

- Configure production Clerk instance/settings.
- Set backend `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`.
- Set frontend `VITE_CLERK_PUBLISHABLE_KEY`.
- Set `VITE_CLERK_PROXY_URL` only if the deployed Clerk proxy path is needed.
- Confirm production CORS origins include the deployed frontend and future mobile origins.
- Decide which public write routes should require auth/admin privileges.
- Implement account deletion before store review.
