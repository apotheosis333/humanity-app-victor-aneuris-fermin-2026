# Google Play Policy Readiness

Date: 2026-07-08

This document records Step 33 policy readiness notes for HuMANity. It is a
planning document only. It does not contain Play Console credentials, tester
emails, test credentials, Clerk keys, Railway tokens, R2 keys, database URLs,
cookies, signed URLs, signing keys, AABs/APKs, screenshots, or private user
data.

## Current Internal Testing Status

- Package ID: `app.humanity.global`.
- Current internal testing version: `5 (1.0.4)`.
- Installer verified in prior QA: `com.android.vending`.
- Internal testing is active and available to internal testers.
- Production rollout has not been started.
- Production access was previously observed as unavailable/locked in Play
  Console.

## Known App Behavior For Policy Work

- HuMANity is a social/community app.
- Users sign in with Clerk.
- Users can create and edit public profile information.
- Users can upload profile photos.
- Users can discover other completed profiles.
- Users can request connections and use messaging where connection rules allow.
- Users can report and block users.
- Account deletion currently exists as a request-only/manual-review flow.
- Backend is hosted on Railway.
- Database is PostgreSQL.
- Object storage is Cloudflare R2 through an S3-compatible adapter.
- No intentional native camera, microphone, contacts, calendar, or location
  permissions are present in the Android manifest.
- Android uses Internet permission for auth, API calls, remote images, and
  storage.

## Policy Areas

### Privacy Policy URL

Status: draft route exists; blocked by missing confirmed public frontend URL.

The in-app Privacy page now has launch-prep draft copy instead of the earlier
placeholder. Play Console will still need a public hosted privacy policy URL
before production review. The backend Railway URL is not a confirmed frontend
legal-page host.

Needs owner/legal confirmation:

- What exact personal data is collected.
- Data retention periods.
- Deletion/anonymization process.
- Third-party processors and subprocessors.
- Support/contact address.

### Data Safety Form

Status: preparation matrix drafted; not ready for submission until owner/legal
review is complete.

Likely data categories to review:

- Account identifiers and sign-in data handled through Clerk.
- Profile content such as display name, username, bio, interests, languages,
  country, profile photo, and other voluntary profile fields.
- User-generated content such as messages, reports, blocks, connection state,
  and community/social interactions.
- Uploaded images stored through Cloudflare R2.
- Backend diagnostics/logs from Railway.

See `docs/data-safety-readiness.md` for the current preparation matrix.

Needs owner/legal confirmation:

- Whether data is encrypted in transit and at rest for every category.
- Whether any data is shared beyond processors needed to operate the app.
- Whether analytics or crash diagnostics are collected now or later.
- Whether users can request deletion through a web URL or only support/manual
  review.

### Content Rating

Status: not ready.

HuMANity includes social/user-generated content, profile text, messages, and
uploaded images. The content rating questionnaire should be answered only after
owner review of moderation, reporting, blocking, and UGC policy language.

### Target Audience And Content

Status: owner draft answer recorded as `16+`; still needs Play Console
submission and final policy review.

The app mission is broad and community-oriented, but target audience choices in
Play Console have policy implications. Do not guess age ranges without founder
approval.

### Ads Declaration

Status: owner draft answer recorded as `No ads`; source check found no obvious
ad SDK or ad placement dependency.

### App Access Instructions

Status: draft ready; still needs Play Console-only reviewer credentials or a
reviewer sign-in plan that works with the Android build.

Because the app requires sign-in for profile, connections, messaging, reporting,
blocking, uploads, and account deletion request testing, Play review may require
app access instructions or test credentials. Do not commit test credentials to
the repository.

Recommended approach:

1. Use the dedicated harmless QA profiles now available for internal testing:
   `HuMANity QA One` and `HuMANity QA Two`.
2. Store any future reviewer credentials outside the repository.
3. Provide Play Console app access instructions only inside Play Console.
4. Do not document tester emails, passwords, tokens, or account identifiers in
   repository docs.
5. Current Android native sign-in offers Google OAuth only. Username-only Clerk
   QA users cannot sign in to the Play-installed app unless email/OAuth access
   is added for those accounts or another approved reviewer sign-in path is
   implemented.

### Data Deletion / Account Deletion

Status: public draft route exists; workflow remains request-only/manual-review.

Current app behavior:

- The mobile UI has an account deletion request section.
- Backend endpoint `POST /api/account/delete-request` creates or returns a
  pending request.
- Actual Clerk identity deletion and app-owned data cleanup remain manual/future
  work.
- Public route `/data-deletion` now explains the current request-only process
  and links users to Support.

Play will need the final public URL for this page before production review.

### UGC / Social Moderation

Status: partially ready.

Implemented:

- User reporting endpoint.
- User blocking endpoint.
- Block filtering in discovery/connections/messaging paths.
- Account deletion request entry point.
- Two completed harmless QA profiles are available for internal testing.
- Authenticated backend report/block QA passed with real Clerk QA users:
  report creation returned `201 pending`, block creation returned
  `201 blocked`, blocked users were hidden from discovery in both directions,
  and unblock restored future QA visibility.
- Play-installed report/block UI spot-check opened the `HuMANity QA Two`
  profile, rendered Report/Block controls, submitted a harmless report prompt
  without blank screen/crash, and showed the block confirmation dialog.

Still needed:

- Admin/moderation review workflow for pending reports.
- Clear public safety/moderation policy language.
- Owner-approved terms covering prohibited content, moderation decisions, and
  account enforcement.
- A Play-installed end-to-end block confirmation test from a dedicated QA or
  reviewer account that can be safely cleaned up.

### Store Listing

Status: not ready.

Needed:

- Short description.
- Full description.
- Final Play Store app icon.
- Feature graphic.
- Phone screenshots.
- Support contact.
- Privacy policy URL.

Draft positioning:

- HuMANity helps people discover humanity beyond stereotypes through profiles,
  culture exploration, connection, and respectful global understanding.

Do not submit listing copy until founder review.

## Remaining Play Readiness Blockers

1. Production Clerk migration.
2. Founder/legal-reviewed Privacy Policy and Terms of Service.
3. Final support/contact page or URL.
4. Final public hosted Privacy Policy and Data Deletion URLs.
5. Play Console-only reviewer/test account credentials or instructions if Google
   requires app access.
6. A dedicated reviewer sign-in path for the Android app, because the current
   native mobile sign-in is Google OAuth-only.
7. Play Console Data Safety, Content Rating, Target Audience, Ads, App Access,
   and UGC/moderation declarations.
8. Store listing copy and graphics/screenshots.
9. Review of any current Play personal-developer-account closed-testing
   requirements before production access.

## Step 36 Play Legal And Data Safety Drafts

Date: 2026-07-09

Safe policy-prep changes:

- Privacy, Terms, and Support public routes now use launch-prep draft copy.
- A public `/data-deletion` route was added for account/data deletion
  instructions.
- Footer legal links now include Data Deletion.
- App setup fallback legal links now include Data Deletion for missing-config
  builds.
- `docs/legal-copy-drafts.md` records app access, privacy, terms, support, and
  data deletion drafts.
- `docs/data-safety-readiness.md` records the Data Safety preparation matrix and
  Play Console readiness checklist.

No Play Console forms were submitted, no AAB was uploaded, no production rollout
was started, and no credentials or private tester data were documented.

Remaining owner/legal decisions:

- Final public web domain for Privacy Policy and Data Deletion URLs.
- Final support email or support form URL.
- Deletion timeline, retention, and anonymization policy.
- Play Data Safety answers.
- Content rating, target audience/content, ads, and UGC/social declarations.
- Reviewer sign-in path that works with the current Android Google OAuth flow.

## Step 37 Founder/Legal Review And Proposed Policy Answers

Date: 2026-07-09

Step 37 reviewed the current legal/support/data-deletion copy against the
backend routes and current QA status. The copy remains consistent with the app
because it avoids promising automated deletion, final legal terms, or a complete
moderation dashboard.

New owner-review document:

- `docs/play-policy-owner-review.md`

It includes:

- Final owner/legal question checklist.
- Proposed Play Console App Access answer with credential placeholders only.
- Proposed Data Deletion answer.
- Proposed Data Safety answer matrix.
- Content rating, target audience, ads, and UGC notes.
- Store listing short/full description drafts.
- Clerk production migration recommendation.
- AAB recommendation.

No Play Console forms were submitted, no AAB was uploaded, no production rollout
was started, and no credentials or private data were added.

## Step 38 Owner Policy Answers And URL Strategy

Date: 2026-07-09

Owner policy answers recorded:

- Support contact: `jawsofthetrap@gmail.com`.
- Target age: `16+`.
- Ads: no ads.
- In-app purchases: no.
- Native location, contacts, camera, microphone permissions: no.
- Account deletion: request-only/manual review.
- Deletion target: within 30 days after a verified deletion request, unless
  legal/security retention is required.
- Retention/anonymization: still requires owner/legal confirmation.
- Reviewer access: Google OAuth first; QA credentials only in Play Console if
  Google requires direct credentials.
- Clerk production migration: recommended before broader closed testing and
  Play policy submission; planning approved, execution deferred to a later
  explicit migration step.

Behavior verification:

- Android manifest declares only `android.permission.INTERNET`.
- No obvious ad SDK or Play Billing dependency was found.
- Report/block routes exist and require auth.
- Account deletion route creates a pending manual-review request.
- Profile photo upload and finalize flows exist.
- Connections and messages exist; messages are limited to accepted connections.
- `/privacy`, `/terms`, `/support`, and `/data-deletion` are routed in source.

Public URL gap:

- No confirmed current public frontend deployment was found for the Step 36
  legal pages.
- Do not use an old Replit URL for Play policy URLs unless it is redeployed and
  verified with the current legal build.
- Next safest step is to deploy the frontend/legal pages publicly and verify:
  - `https://<public-domain>/privacy`
  - `https://<public-domain>/data-deletion`

See `docs/play-policy-owner-review.md` for the full Play Console answer pack.
