# Play Policy Owner Review

Date: 2026-07-09

This document prepares owner/legal review for Google Play policy forms. It is not legal advice and must not be copied into Play Console until the owner confirms the remaining open questions. It contains no tester emails, test credentials, Google credentials, Clerk keys, Railway tokens, R2 keys, database URLs, cookies, signed URLs, signing keys, AABs/APKs, build outputs, screenshots, or private user data.

## Legal And Support Copy Review

Reviewed routes and docs:

- `/privacy`
- `/terms`
- `/support`
- `/data-deletion`
- `docs/legal-copy-drafts.md`
- `docs/data-safety-readiness.md`
- `docs/google-play-policy-readiness.md`
- `docs/final-internal-qa.md`

Result:

- The copy is internally consistent with the current app and backend.
- The Privacy draft accurately describes Clerk auth, Railway hosting, PostgreSQL data, Cloudflare R2/S3-compatible uploads, profile data, social data, reports, blocks, deletion requests, and technical logs at a high level.
- The Terms draft correctly treats HuMANity as a social/user-generated-content app and mentions report/block/moderation expectations without claiming a finished admin dashboard.
- Support contact is approved for draft policy work as `jawsofthetrap@gmail.com`. A public support route is already present in the app, but the current Play-installed Android build does not include the Step 36 copy yet.
- The Data Deletion draft correctly says deletion is request-only/manual-review. It does not promise instant or automated deletion.
- `/data-deletion` is wired into the React router and footer. It will be publicly reachable in the built app/web deployment after the Step 36 code is included in a deployed web build or future Android AAB.

Unsupported or unresolved claims:

- Owner-approved deletion timeline target is within 30 days after a verified request, unless legal/security retention is required.
- Clerk identity deletion is not automated in the backend.
- The operational moderation/admin review process for pending reports is not fully defined.
- Final public web domain, Privacy Policy URL, and Data Deletion URL are not confirmed.

## Owner Review Checklist

Owner answers recorded in Step 38:

- Support contact: `jawsofthetrap@gmail.com`.
- Target age: `16+`.
- Ads: no ads.
- In-app purchases: no.
- Native location permission: no.
- Native contacts permission: no.
- Native camera permission: no.
- Native microphone permission: no.
- Account deletion flow: request-only/manual review.
- Deletion timeline target: within 30 days after a verified deletion request, unless legal/security retention is required.
- Retention/anonymization: still requires owner/legal confirmation; do not overpromise instant full deletion.
- Reviewer sign-in method: Google OAuth first; provide QA credentials in Play Console only if Google requires direct credentials.
- Clerk production migration: recommended before broader closed testing and Play policy submission; planning approved, but production keys/settings must not be switched until a later explicit migration step.

Still open before Play Console submission:

1. What is the final public website/domain for HuMANity?
2. What exact URL should Play use for the Privacy Policy?
3. What exact URL should Play use for Data Deletion instructions?
4. Should support remain email-only, or should a public support form be added?
5. Which records are fully deleted versus anonymized or retained?
6. Do logs/backups have a defined retention period?
7. Will Google reviewers use Google OAuth only, or will a direct test credential path be required by Play?
8. Is the current moderation review process for reports sufficient for submission, or should an admin review workflow be added first?

## Behavior Verification Against Owner Answers

Verified from code/config in Step 38:

- No obvious ad SDK or ad placement dependency was found.
- No obvious Google Play Billing/in-app purchase dependency was found.
- Android manifest declares only `android.permission.INTERNET`; no native location, contacts, camera, microphone, or calendar permissions are intentionally declared.
- Account deletion is request-only/manual-review through `POST /api/account/delete-request`.
- Report and block backend routes exist and require auth.
- Profile photo upload exists through authenticated storage upload/finalize routes and profile edit UI.
- Connections and direct messages exist; messages are limited to accepted connections in backend route logic.
- Android native sign-in starts Google OAuth with `oauth_google`.
- `/privacy`, `/terms`, `/support`, and `/data-deletion` are routed in the frontend code.

No policy-answer mismatch was found. Remaining gaps are operational, not contradictions: public web URLs, Clerk production migration, final retention/anonymization rules, and report moderation operations.

## Public URL Strategy

Current status:

- Backend public URL exists: `https://humanity-app-victor-aneuris-fermin-2026-production.up.railway.app`.
- That URL is an API/backend service, not a confirmed current public frontend serving `/privacy` or `/data-deletion`.
- The Step 36 `/data-deletion` route exists in source but is not yet included in a new Play release and is not confirmed on a public web frontend.
- Do not use the old Replit app URL for Play policy URLs unless the current Step 36 legal build is deployed there and verified.

Recommended public URL plan:

1. Deploy the current `artifacts/humanity` frontend to a public web host such as Railway static hosting, Vercel, Netlify, or Cloudflare Pages.
2. Configure it with the deployed backend URL through `VITE_API_BASE_URL`.
3. Verify these routes publicly:
   - `https://<public-domain>/privacy`
   - `https://<public-domain>/terms`
   - `https://<public-domain>/support`
   - `https://<public-domain>/data-deletion`
4. Use those verified public URLs in Play Console.

## Proposed Play Console App Access Answer

Status: ready as draft, needs Play Console submission and possible reviewer-credential decision. Do not include real credentials in GitHub.

```text
HuMANity requires sign-in to test the full app. Open the app, tap Sign In, and use Google OAuth first. If Google Play requires direct QA credentials and a direct credential sign-in path is configured, use:

Username: TEST_USERNAME_PLACEHOLDER
Password: TEST_PASSWORD_PLACEHOLDER

After signing in, reviewers can test profile creation/editing, profile photo upload, Explore/countries, viewing another profile, report/block controls, Privacy/Terms/Support/Data Deletion pages, and the account deletion request UI under Profile > Edit profile.
```

Current risk: the Android native sign-in flow currently offers Google OAuth only. If Play requires username/password credentials, a safe reviewer sign-in path or Google-OAuth-compatible reviewer account is needed before submitting this answer.

## Proposed Data Deletion Answer

Status: needs public URL and final owner/legal confirmation before submission.

```text
Users can request account and app data deletion in HuMANity by signing in, opening Profile, choosing Edit profile, and using the account deletion request section. HuMANity also provides public deletion instructions at https://<public-domain>/data-deletion.

The current deletion process is request-only and manually reviewed. Deletion may include app-owned profile data, profile photo references, uploaded profile photos where applicable, account registry records, connections, messages, reports, blocks, and other app-owned data associated with the account. Some records may be retained or anonymized when needed for safety, legal compliance, fraud prevention, or moderation history.

Clerk manages authentication identity, so completing a full deletion may require manual coordination to delete or deactivate the related Clerk identity. Deletion target: within 30 days after a verified deletion request, unless legal/security retention is required.
```

Do not promise immediate or fully automated deletion until the backend and Clerk workflow support it.

## Proposed Data Safety Answers

These are draft classifications only. Confirm each item before Play Console submission.

| Data category | Collected? | Required or optional | Purpose | Shared with service providers? | Encrypted in transit | User deletion path | Needs confirmation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Account/profile information | Likely yes | Required for account/profile features; profile fields are partly optional | Account setup, profile display, discovery, matching | Yes, processors such as Railway/PostgreSQL and Clerk | Yes, via HTTPS/TLS in normal deployment | In-app deletion request and support | Exact fields, retention |
| User identifiers | Yes | Required for auth/account mapping | Authentication, account security, profile ownership | Yes, Clerk and backend/database processors | Yes | In-app deletion request plus Clerk coordination | Clerk production retention |
| Authentication data handled by Clerk | Yes | Required to sign in | Authentication, session security, fraud/abuse prevention | Yes, Clerk | Yes | Clerk identity deletion coordination | Clerk production setup |
| Profile photos/uploads | Yes when user uploads | Optional | Profile display | Yes, R2/S3-compatible storage and backend/database references | Yes | Manual deletion request | Object cleanup process |
| User-generated content | Yes where users create profiles/messages/content | Optional but required for those features | Social features, profile/community experience | Yes, backend/database processors | Yes | Manual deletion/anonymization review | UGC scope at launch |
| Reports/blocks | Yes when used | Optional safety features | Safety, moderation, abuse prevention | Yes, backend/database processors | Yes | May be retained/anonymized for safety | Moderation retention |
| Connections/messages | Yes if enabled/used | Optional social features | Connection management and direct communication | Yes, backend/database processors | Yes | Manual deletion/anonymization review | Launch availability |
| App interactions/activity | Likely yes | Required for app functionality | Feature operation, safety, discovery, moderation | Yes, backend/database/processors | Yes | Manual deletion request where applicable | Exact activity categories |
| Diagnostics/logs | Likely yes | Required for app operation/security | Debugging, reliability, security, abuse prevention | Yes, Railway/Clerk/storage/platform providers | Yes | Provider retention plus support/deletion request where applicable | Retention period |
| Device/network data | Likely yes through server/auth logs | Required for app operation/security | Authentication, API routing, security, troubleshooting | Yes, hosting/auth/storage providers | Yes | Provider retention plus support/deletion request where applicable | Exact provider logs |
| Precise location | Not observed | Not used | Not applicable | Not applicable | Not applicable | Not applicable | Confirm no native location before submission |
| Contacts/calendar/microphone | Not observed | Not used | Not applicable | Not applicable | Not applicable | Not applicable | Owner says no native contacts or microphone permissions |
| Camera | Not observed as a native permission | Not used as native permission; users can select/upload profile photos | Profile photo upload if user chooses a file/photo | R2/S3-compatible storage and backend/database references | Yes | Manual deletion request | Owner says no native camera permission |
| Ads data | No | Not used | Not applicable | Not applicable | Not applicable | Not applicable | Owner says no ads |

## Content Rating, Target Audience, Ads, And UGC Notes

- Target audience draft: `16+`, based on owner answer. Because HuMANity has social/user-generated content, messaging, profile photos, reports, and blocking, avoid children/families positioning unless the app is specifically designed and moderated for children.
- Ads declaration draft: `No ads`, based on owner answer and source check.
- In-app purchases draft: `No`, based on owner answer and source check.
- UGC/social declaration: HuMANity should be treated as a user-generated-content/social app because profiles, photos, messages, reports, blocks, and connections exist.
- Moderation tools: report, block, account deletion request, auth, and rate limiting exist. A defined admin/moderation operations process is still needed for reviewing pending reports.
- Content rating: answer carefully based on live UGC and social interaction, not just the app mission. Do not assume the lowest rating without reviewing Play's questionnaire.

## Store Listing Draft

Short description draft:

```text
Discover people, cultures, and shared humanity beyond stereotypes.
```

Full description draft:

```text
HuMANity is a social discovery app built around selfless connection, global understanding, and seeing people beyond stereotypes.

Create a profile, share a little about your culture and interests, explore countries around the world, and connect with people through respectful conversation. HuMANity is designed for people who want a calmer, more human way to learn about each other and the world.

Key features:
- Create and edit your HuMANity profile
- Add a profile photo
- Explore countries and cultural context
- Discover people with shared or complementary interests
- Connect and message when connection rules allow
- Report or block users when safety concerns arise
- Access Privacy, Terms, Support, and Data Deletion information in the app

HuMANity does not promise to solve global conflict or guarantee social outcomes. It offers a space for curiosity, respect, and meaningful connection.
```

Owner should review tone, audience, feature claims, and final screenshots/assets before store submission.

## Play Console Answer Pack Status

| Area | Proposed answer/status | Gate |
| --- | --- | --- |
| App Access | Google OAuth first; direct QA credentials only if Play requires and a safe path exists | Needs Play Console submission |
| Privacy Policy URL | `https://<public-domain>/privacy` | Needs public frontend URL |
| Data Deletion URL | `https://<public-domain>/data-deletion` | Needs public frontend URL |
| Support contact | `jawsofthetrap@gmail.com` | Ready as owner-approved draft contact |
| Target audience | `16+` | Needs Play Console submission |
| Ads | No ads | Needs Play Console submission |
| In-app purchases | No | Needs Play Console submission |
| Native sensitive permissions | No location, contacts, camera, microphone | Ready, verified against Android manifest |
| Data Safety | Draft matrix prepared | Needs owner/legal confirmation and Play Console submission |
| UGC/social | Present; report/block/account deletion request exist | Needs Play Console submission and moderation process confirmation |
| Store listing | Draft short/full descriptions prepared | Needs owner review and Play assets |
| Clerk production | Recommended before broader review/submission | Blocked until explicit migration step |

## Clerk Production Migration Decision

Recommendation: migrate to a Clerk production instance before broader closed testing, Play policy submission that depends on stable reviewer access, or production review.

Why:

- The current Android build uses a Clerk Development environment.
- The native sign-in page still displays `Development mode`.
- Play reviewers may see Development mode as unfinished or confusing.
- Production Clerk keys, OAuth settings, allowed origins, and native callback settings need final verification.

Prepared migration steps for next implementation task:

1. Create/configure Clerk production instance.
2. Enable Google OAuth/social connection.
3. Add native callback `app.humanity.global://callback`.
4. Add required allowed origins/redirects for deployed web frontend, Capacitor WebView origin, and backend/proxy settings if used.
5. Copy production publishable key into local ignored mobile env.
6. Set Railway backend Clerk production secret/env vars.
7. Confirm Railway backend verifies production Clerk tokens.
8. Remove or gate the visible Development mode label.
9. Rebuild Android as `versionCode 6`, `versionName 1.0.5`.
10. Include Step 36 legal/data-deletion route changes in that release.
11. Build signed AAB with ignored local signing files.
12. Upload to Google Play Internal testing only.
13. Test Google OAuth, `/api/me/profile`, R2 upload, Explore, report/block, privacy/terms/support/data-deletion.
14. Confirm Clerk Development label is gone.

This migration requires a versionCode bump and a new AAB before Play-installed testers can validate the production Clerk path.

## AAB Recommendation

Do not upload a new AAB for legal copy alone yet unless Play urgently requires the updated Data Deletion route inside the installed app.

Recommended path:

1. Deploy the public frontend/legal pages first so Play Privacy/Data Deletion URLs can be finalized.
2. Perform Clerk production migration.
3. Bundle the updated legal/data-deletion copy and Clerk production changes into the next Android internal-testing release.
4. Use next Android version after current `5 (1.0.4)`: `versionCode 6`, `versionName 1.0.5`, unless a different release plan is chosen.

## Exact Next Recommended Task

`TASK: STEP 39 - DEPLOY PUBLIC FRONTEND LEGAL PAGES AND VERIFY PLAY POLICY URLS`
