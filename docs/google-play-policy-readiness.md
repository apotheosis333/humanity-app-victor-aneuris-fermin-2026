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

Status: not ready.

The in-app Privacy page is currently a draft placeholder and explicitly requires
founder/legal review. Play Console will need a public privacy policy URL before
production review.

Needs owner/legal confirmation:

- What exact personal data is collected.
- Data retention periods.
- Deletion/anonymization process.
- Third-party processors and subprocessors.
- Support/contact address.

### Data Safety Form

Status: not ready.

Likely data categories to review:

- Account identifiers and sign-in data handled through Clerk.
- Profile content such as display name, username, bio, interests, languages,
  country, profile photo, and other voluntary profile fields.
- User-generated content such as messages, reports, blocks, connection state,
  and community/social interactions.
- Uploaded images stored through Cloudflare R2.
- Backend diagnostics/logs from Railway.

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

Status: needs owner decision.

The app mission is broad and community-oriented, but target audience choices in
Play Console have policy implications. Do not guess age ranges without founder
approval.

### Ads Declaration

Status: likely no ads based on current source and QA, but owner confirmation is
required before submitting the declaration.

### App Access Instructions

Status: needed.

Because the app requires sign-in for profile, connections, messaging, reporting,
blocking, uploads, and account deletion request testing, Play review may require
app access instructions or test credentials. Do not commit test credentials to
the repository.

Recommended approach:

1. Create dedicated reviewer/test accounts in Clerk.
2. Store credentials outside the repository.
3. Provide Play Console app access instructions only inside Play Console.
4. Ensure each test account has a completed harmless QA profile.

### Data Deletion / Account Deletion

Status: not production-ready.

Current app behavior:

- The mobile UI has an account deletion request section.
- Backend endpoint `POST /api/account/delete-request` creates or returns a
  pending request.
- Actual Clerk identity deletion and app-owned data cleanup remain manual/future
  work.

Play will need either a public data deletion URL or clear account deletion
instructions. A dedicated public data deletion page is recommended before
production review.

### UGC / Social Moderation

Status: partially ready.

Implemented:

- User reporting endpoint.
- User blocking endpoint.
- Block filtering in discovery/connections/messaging paths.
- Account deletion request entry point.

Still needed:

- Admin/moderation review workflow for pending reports.
- Clear public safety/moderation policy language.
- End-to-end QA with two dedicated test profiles.
- Owner-approved terms covering prohibited content, moderation decisions, and
  account enforcement.

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
2. Launch-ready Privacy Policy and Terms of Service.
3. Final support/contact page or URL.
4. Public data deletion instructions or URL.
5. Dedicated QA/reviewer accounts with completed profiles.
6. Report/block end-to-end QA with two test profiles.
7. Play Console Data Safety, Content Rating, Target Audience, Ads, App Access,
   and UGC/moderation declarations.
8. Store listing copy and graphics/screenshots.
9. Review of any current Play personal-developer-account closed-testing
   requirements before production access.
