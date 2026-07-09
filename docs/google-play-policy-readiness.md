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

Status: draft route exists; not ready for submission until public URL and
founder/legal review are complete.

The in-app Privacy page now has launch-prep draft copy instead of the earlier
placeholder. Play Console will still need a public hosted privacy policy URL
before production review.

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

Status: needs owner decision.

The app mission is broad and community-oriented, but target audience choices in
Play Console have policy implications. Do not guess age ranges without founder
approval.

### Ads Declaration

Status: likely no ads based on current source and QA, but owner confirmation is
required before submitting the declaration.

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
