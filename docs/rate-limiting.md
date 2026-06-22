# Backend Rate Limiting

Step 11 adds in-memory Express rate limiting for high-risk backend routes. The
goal is to reduce anonymous write abuse, authenticated spam, upload abuse, and
AI cost spikes without changing normal app flows.

## Dependency

The backend uses `express-rate-limit`.

## Default Limits

All limits use the same default window:

- `RATE_LIMIT_WINDOW_MS`: `900000` milliseconds, or 15 minutes.

Default route limits:

- `RATE_LIMIT_PUBLIC_MAX`: `10` requests per window for public write routes.
- `RATE_LIMIT_AUTH_MAX`: `60` requests per window for authenticated writes.
- `RATE_LIMIT_AI_MAX`: `5` requests per window for AI generation.
- `RATE_LIMIT_UPLOAD_MAX`: `20` requests per window for upload URL/finalize
  routes.

If an environment variable is absent or invalid, the safe default is used.
Rate-limited requests return HTTP `429` with a JSON error message.

## Routes Protected

Public write limiter:

- `POST /api/pledge`

AI generation limiter:

- `POST /api/walk-in-shoes`

Upload limiter:

- `POST /api/storage/uploads/request-url`
- `POST /api/storage/uploads/finalize`

Authenticated write limiter:

- `POST /api/countries`
- `POST /api/countries/:code/timeline`
- `POST /api/countries/:code/milestones`
- `POST /api/countries/:code/stories`
- `PUT /api/me/profile`
- `POST /api/me/pledge`
- `POST /api/connections/requests`
- `POST /api/messages/:userId`
- `POST /api/dinner-table/questions/:id/answers`
- `POST /api/world-news/:id/react`
- `DELETE /api/world-news/:id/react`
- `POST /api/world-news/:id/save`
- `DELETE /api/world-news/:id/save`

Public read routes, health checks, and basic feed/explore endpoints are not
rate-limited by this step.

## Keying Behavior

Authenticated route limiters use the Clerk user ID when `requireAuth` has
populated `req.userId`. If no user ID is available, they fall back to an
IPv6-safe IP key. Public write routes use an IPv6-safe IP key.

## Proxy Deployment Notes

The API configures Express `trust proxy` only when `TRUST_PROXY_HOPS` is a
positive integer. In production, the default is one trusted proxy hop, which
matches common Render/Railway-style deployments. In local development, the
default is no trusted proxy unless explicitly configured.

Use placeholder-only examples:

```bash
TRUST_PROXY_HOPS=1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_PUBLIC_MAX=10
RATE_LIMIT_AUTH_MAX=60
RATE_LIMIT_AI_MAX=5
RATE_LIMIT_UPLOAD_MAX=20
```

## Future Production Work

This implementation uses the default in-memory store. That is acceptable for a
single API process during early launch readiness, but it does not share counters
across multiple server instances and resets on process restart. Before scaling
the backend horizontally, replace the memory store with a Redis-backed store or
another shared rate-limit backend.

AI routes should also receive abuse monitoring, request budgeting, and alerting
before broad mobile launch.
