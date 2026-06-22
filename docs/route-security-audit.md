# Backend Route Security Audit

Step 10 reviewed backend write routes for production readiness and app-store
safety. Public read routes remain public. User-specific writes remain protected
with Clerk-backed `requireAuth`.

## Audited Write Routes

| Route | Purpose | Auth status after audit | Notes |
| --- | --- | --- | --- |
| `POST /api/countries` | Create country content | `requireAuth` | Needs future admin-role enforcement. |
| `POST /api/countries/:code/timeline` | Create timeline event | `requireAuth` | Needs future admin-role enforcement. |
| `POST /api/countries/:code/milestones` | Create cultural milestone | `requireAuth` | Needs future admin-role enforcement. |
| `POST /api/countries/:code/stories` | Create country story | `requireAuth` | Needs future admin-role enforcement. |
| `POST /api/walk-in-shoes` | Generate OpenAI narrative | `requireAuth` | Rate-limited; still needs abuse monitoring and budget controls. |
| `POST /api/pledge` | Public Humanity Pledge signature/counter | Public | Intentional visitor flow; rate-limited, but still needs bot protection. |
| `POST /api/me/pledge` | Mark signed-in profile as pledged | `requireAuth` | User-specific profile write. |
| `PUT /api/me/profile` | Create/update own profile | `requireAuth` | User-specific profile write. |
| `POST /api/storage/uploads/request-url` | Request upload URL | `requireAuth` | Uploads are limited to image types and max size. |
| `POST /api/storage/uploads/finalize` | Publish uploaded object ACL | `requireAuth` | Uses request user as object owner. |
| `POST /api/connections/requests` | Send connection request | `requireAuth` | User-specific social write. |
| `POST /api/connections/requests/:id/accept` | Accept connection request | `requireAuth` | User-specific social write. |
| `DELETE /api/connections/requests/:id` | Decline/cancel request | `requireAuth` | User-specific social write. |
| `DELETE /api/connections/:userId` | Remove connection | `requireAuth` | User-specific social write. |
| `POST /api/messages/:userId` | Send message | `requireAuth` | Requires accepted connection. |
| `POST /api/messages/:userId/read` | Mark messages read | `requireAuth` | Requires accepted connection. |
| `POST /api/dinner-table/questions/:id/answers` | Submit dinner table answer | `requireAuth` | User-generated content; reporting/moderation still needed. |
| `POST /api/world-news/:id/react` | React to news | `requireAuth` | User-specific interaction. |
| `DELETE /api/world-news/:id/react` | Remove reaction | `requireAuth` | User-specific interaction. |
| `POST /api/world-news/:id/save` | Save news item | `requireAuth` | User-specific interaction. |
| `DELETE /api/world-news/:id/save` | Remove saved news item | `requireAuth` | User-specific interaction. |

## Routes Changed

- `POST /api/countries`
- `POST /api/countries/:code/timeline`
- `POST /api/countries/:code/milestones`
- `POST /api/countries/:code/stories`
- `POST /api/walk-in-shoes`

These routes were public before this step. They now require a signed-in Clerk
user.

## Intentionally Public Routes

- Public read routes for countries, timeline, stories, milestones, public
  object reads, music search, pledge count, world news feed, and the public
  dinner-table question list/detail.
- `POST /api/pledge` remains public because the current product flow allows
  visitors to sign the Humanity Pledge without creating an account. This route
  creates persistent aggregate pledge data, so it should receive bot protection
  before production/mobile launch.

## Future Admin Gating

No admin role or permission helper was found in the current backend. The content
management routes now require authentication, but they still allow any signed-in
user to create country, timeline, milestone, or story records. Before production
launch, add an admin authorization helper backed by Clerk metadata or a database
role table, then replace the temporary `requireAuth` gate on those routes.

Routes needing admin checks:

- `POST /api/countries`
- `POST /api/countries/:code/timeline`
- `POST /api/countries/:code/milestones`
- `POST /api/countries/:code/stories`

## Rate Limiting Status

Step 11 added basic in-memory rate limiting for the highest-risk public,
authenticated, upload, and AI routes. See `docs/rate-limiting.md` for limits and
deployment notes.

Future rate-limit work before public mobile launch should include Redis-backed
shared counters for multi-instance deployments and additional abuse monitoring,
especially for:

- `POST /api/walk-in-shoes`
- `POST /api/pledge`
- `POST /api/dinner-table/questions/:id/answers`
- `POST /api/messages/:userId`
- `POST /api/connections/requests`
- `POST /api/storage/uploads/request-url`

## App-Store Safety Notes

The write-route auth pass reduces anonymous content creation and unauthenticated
AI usage risk. Remaining app-store safety work still includes reporting,
blocking, account deletion, moderation review hooks, privacy policy, terms of
service, and support/contact surfaces.
