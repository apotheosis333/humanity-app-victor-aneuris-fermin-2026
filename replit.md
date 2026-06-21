# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- API contract source of truth: `lib/api-spec/openapi.yaml` (run codegen after edits)
- DB schema: `lib/db/src/schema/` (countries, `profiles.ts`, `dinner-table.ts`); re-exported from `schema/index.ts`
- Generated client hooks + types: `@workspace/api-client-react`; Zod schemas: `@workspace/api-zod`
- Web app: `artifacts/humanity/src/` (pages in `pages/`, shared UI in `components/`)
- Auth wiring: web `src/App.tsx` (ClerkProvider + branded appearance); server `src/app.ts` + `src/middlewares/auth.ts`
- Design system classes: `artifacts/humanity/src/index.css`

## Architecture decisions

- Auth is Replit-managed Clerk. Web auth is cookie-based via the shared proxy (no bearer token); server uses `requireAuth`/`optionalAuth` middleware that set `req.userId`.
- `GET /dinner-table/current` uses the `CurrentDinner` schema (nullable question), distinct from `DinnerQuestionDetail` (non-null), because no seeded question is a valid state.
- Dinner-answer submit is transactional (insert + humanityScore += 10) and relies on the `userId+questionId` unique index, catching Postgres `23505` to return 409 deterministically.
- Profile photos: presign (`POST /storage/uploads/request-url`) → client PUT → finalize (`POST /storage/uploads/finalize`). Both write endpoints `requireAuth`; request-url enforces image MIME (`jpeg/png/webp`) + 5MB server-side; finalize sets a public ACL (`owner=userId, visibility=public`). `GET /storage/objects/*` uses `optionalAuth` + `canAccessObjectEntity`, so only public-ACL objects serve to everyone. See `.agents/memory/object-storage-public-photos.md`.
- Profile song uses the public iTunes Search API proxied by `GET /music/search?q=` (no key); only metadata is stored (title, artist, artwork, preview/track URLs), never audio files.
- See `.agents/memory/humanity-auth-data.md` for Clerk/Orval/React-Query quirks (no SignedIn/SignedOut export; queryKey required with custom options; 404-onboarding pattern).
- App UI language switching: `artifacts/humanity/src/lib/i18n.ts` (i18next + react-i18next + browser detector, 11 languages incl. RTL ar/he). Auto-detects the visitor's device/region locale (`nonExplicitSupportedLngs` + `load:"languageOnly"` maps `he-IL`→`he`), caches choice in localStorage (`humanity_lang`), and flips `document.dir/lang` for RTL via `applyDir`. Switcher is `components/language-switcher.tsx`. Scope is intentional: only persistent chrome (nav/footer/auth/score), the home hero, and the Live Map are translated via `t()`; deep page bodies and dynamic DB-sourced content stay in their source language. To add a language: add an entry to `LANGUAGES` + a `resources` block.
- Human Connections (mutual friend requests, not follow): `connections` table enforces ONE row per UNORDERED pair via a unique expression index on `least(requester_id,addressee_id), greatest(...)` — a plain ordered unique would let `A→B` and `B→A` coexist and break auto-accept/status. Per-viewer status is `none|pending_outgoing|pending_incoming|connected`. `POST /connections/requests` auto-accepts when a reverse pending row exists, and re-reads on Postgres `23505` to resolve concurrent cross-requests deterministically. All mutations scope `WHERE` to `req.userId`. Profiles gained `username` (unique, `/^[a-z0-9_]{3,20}$/`, lowercased) + `email` (Clerk-synced on GET /me/profile backfill + PUT); search matches displayName/username/exact email. See `.agents/memory/human-connections.md`.
- Timeline events ("Chronicles of Time" / Humanity Timeline) are seeded from JSON in `scripts/data/timeline/*.json` via `pnpm --filter @workspace/scripts run seed-timeline` (transactional wipe+reinsert; validates code/year/title/description/category; drops year < -10000). All 196 countries are populated. Era filtering lives in `artifacts/api-server/src/routes/humanity-timeline.ts`.
- Account registry (`accounts` table, `lib/db/src/schema/accounts.ts`): canonical record of EVERY Clerk account (userId PK, email, created/updated). Deliberately separate from `profiles` (which is onboarding-gated and only exists after the user saves their profile), so every account is "accounted for" the moment it authenticates — even pre-onboarding — and future updates/migrations can target all accounts. Populated two ways: (1) `recordAccount(userId)` fire-and-forget `onConflictDoNothing` insert from BOTH `requireAuth` and `optionalAuth` (never blocks/fails a request); (2) `syncAccountsFromClerk()` runs on server startup (and is re-runnable) — paginates `clerkClient.users.getUserList` and upserts userId+email, mirroring Clerk as source of truth. IMPORTANT: Replit-managed Clerk has SEPARATE dev and production user pools; the dev preview server only sees dev-instance users, the published app sees production users. An empty `accounts` table in dev just means nobody has signed into the dev instance.
- AI-curated World News (`/world-news`): positive-only stories generated by OpenAI (`artifacts/api-server/src/lib/news-generator.ts`), NOT community-submitted. Generation runs on server startup if stale + an hourly scheduler tick (STALE_AFTER_MS 6h), guarded by a module-level `generating` lock and timer `.unref()`; batches append (never wipe). Model output is validated defensively (length checks + category/region normalization + ISO alpha-2 country-code validation against the DB country set) — invalid output yields 0 inserts, never a partial/corrupt write. Routes in `routes/world-news.ts`: GET feed/saved (`optionalAuth`), react/save mutations (`requireAuth`, scoped to `req.userId`, idempotent via `onConflictDoUpdate`/`onConflictDoNothing` on the `userId+newsId` unique indexes). `toDTOs` batches reaction-count aggregation (one grouped query + viewer-specific queries keyed by `inArray`) to avoid N+1. NOTE: api-server has NO `zod` dependency — validate request/AI payloads manually there (zod lives in `lib/db` + generated `@workspace/api-zod`). Feed UI `pages/world-news.tsx` (category/region pill filters, reaction buttons, save toggle, Saved tab).

## Product

huMANity — a premium global empathy/education platform covering every nation. Explore countries via an interactive 3D globe, a Daily Nation, featured nations, "Walk In Their Shoes", a Humanity Timeline (civilizations side by side), nation comparison, and a Humanity Pledge. Theme: "One Earth. Many Stories. One Humanity."

### Account features
- Real user accounts via Replit-managed Clerk, with branded dark sign-in/up.
- Rich customizable profiles: display name, country, photo, bio, cultural background, languages, interests, favorite books/music, profile song, humanity score, pledge badge. Public view at `/profile/:userId`; owner edit/onboarding at `/profile/edit`.
- World Dinner Table (`/dinner-table`): one weekly universal human question; people from different countries share answers shown with their country + profile. Emphasizes shared humanity, not engagement metrics. Answering grants +10 humanity score.

### Visual design
Dark "Earth-from-orbit" futuristic theme is the global default (glassmorphism, soft blue/gold glow, global starfield, Space Grotesk + Playfair fonts, fade-up animations). The design system and its utility classes live in `artifacts/humanity/src/index.css`; all pages reuse them and stay transparent over the `<Starfield/>` mounted in `layout.tsx`. See `.agents/memory/humanity-design-system.md` for the full conventions.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
