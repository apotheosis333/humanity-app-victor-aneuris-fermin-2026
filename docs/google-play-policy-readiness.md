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

Status: public URL verified for policy prep.

The in-app Privacy page now has launch-prep draft copy instead of the earlier
placeholder. Step 39 deployed and verified the public frontend legal route:

```text
https://humanity-frontend-legal-production.up.railway.app/privacy
```

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
Verified Step 39 data deletion URL:

```text
https://humanity-frontend-legal-production.up.railway.app/data-deletion
```

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

## Step 39 Public Frontend Legal URL Deployment

Date: 2026-07-09

Frontend hosting provider: Railway.

Public frontend URL:

```text
https://humanity-frontend-legal-production.up.railway.app
```

Verified Play policy URLs:

```text
Privacy Policy: https://humanity-frontend-legal-production.up.railway.app/privacy
Terms: https://humanity-frontend-legal-production.up.railway.app/terms
Support: https://humanity-frontend-legal-production.up.railway.app/support
Data Deletion: https://humanity-frontend-legal-production.up.railway.app/data-deletion
```

Verification results:

- Direct route HTTP checks returned `200` for `/`, `/privacy`, `/terms`,
  `/support`, and `/data-deletion`.
- Rendered browser checks found current Privacy, Terms, Support, and Data
  Deletion copy.
- Support page includes the approved support contact.
- Data Deletion page includes the request-only/manual-review wording and
  30-day target after a verified deletion request, unless legal/security
  retention is required.
- Mobile viewport check found no horizontal overflow on legal pages.
- Footer includes Data Deletion links.
- Explore route loaded from the public frontend.
- Browser fetch to Railway backend `/api/countries` returned `24` countries.
- Backend CORS allowlist was updated to include the public frontend origin.
- No Google Play production action, policy submission, or AAB upload occurred.

Remaining blockers:

- Clerk still uses Development keys and shows Clerk's expected public web
  development warning.
- Clerk production migration is still required before broader testing or
  production review.
- Play Console policy URLs have not been entered/submitted yet.

## Step 42 Policy Readiness Update

Date: 2026-07-12

The Play-installed `8 (1.0.7)` app is not ready for Play policy submission yet
because the signed-out Android auth/profile entry point was not reliable during
the retest.

Current status:

- Public backend country data works.
- Public Support, Privacy, Terms, and Data Deletion URLs return `200`.
- The Android app launches from Google Play Internal testing.
- The signed-out auth control can stay in Clerk loading state in `1.0.7`,
  blocking production Clerk OAuth/profile/upload verification.

Prepared remediation:

- Android `9 (1.0.8)` has been prepared with a small auth-entry fix.
- A signed `1.0.8` AAB exists locally but has not been uploaded or published.

Policy forms should wait until a Play-installed `1.0.8` pass confirms:

- Production Clerk Google OAuth.
- `/api/me/profile`.
- Profile save.
- R2 profile photo upload.
- Support route from inside the app.
- Report/block visibility with safe QA profiles.

## Step 43 Policy Readiness Update

Date: 2026-07-12

Google Play Internal testing remains the only Android track used for this pass.
No production rollout was started.

Latest internal build:

- Track: Internal testing.
- Latest release: `11 (1.0.10)`.
- Installed from Google Play on the Play Store AVD with installer
  `com.android.vending`.

Policy-impacting blocker:

- Account/profile, reporting, blocking, and upload flows still need a
  Play-installed signed-in retest.
- The current blocker is Android Clerk hosted redirect handoff from the
  Play-installed `1.0.10` app, not a Play policy form issue.

No policy forms, Data Safety answers, production submissions, tester private
data, credentials, screenshots, AABs/APKs, signing files, or private user data
are documented here.

## Step 45 Production Auth Domain Decision

Date: 2026-07-20

The selected path is to recover DNS management for `humanity.global`; no new
domain will be introduced at this stage. This avoids changing the locked Play
package identity and keeps the native callback at
`app.humanity.global://callback`.

DNS access is still unavailable. No DNS records, nameservers, Clerk domains,
Play releases, or policy forms changed during this decision step.

When access is confirmed, the approved-scope proposal is limited to these
Clerk CNAME hosts:

```text
clerk            CNAME  frontend-api.clerk.services
accounts         CNAME  accounts.clerk.services
clkmail          CNAME  mail.wp979peffdxu.clerk.services
clk._domainkey   CNAME  dkim1.wp979peffdxu.clerk.services
clk2._domainkey  CNAME  dkim2.wp979peffdxu.clerk.services
```

No new Internal testing or production release should be submitted until Clerk
verifies DNS and certificates and production Google OAuth passes locally.

Exact next task: recover the correct GoDaddy account, confirm the DNS zone is
editable without a transfer or nameserver change, and request approval to add
only the five Clerk records.

## Play Console App Setup Progress

Date: 2026-07-30

The following Google Play app-setup items are now saved for the draft app:

- Privacy policy URL points to the verified public Privacy page.
- Ads declaration: the app does not contain ads.
- Government apps declaration: the app is not a government app.
- Financial features declaration: the app has no financial features.
- Health declaration: the app has no health features.
- App type/category: App / Social.
- Public store contact details and website are configured in Play Console.
- Founder-approved short and full descriptions are saved as a store-listing
  draft.
- Data Safety has a saved partial draft covering collection, encryption in
  transit, OAuth account creation, the verified data-deletion URL, and the lack
  of a separate partial-data-deletion flow.

The app remains on Internal testing. No production release or production
rollout was created.

Remaining blockers:

1. Sign in details requires a dedicated reviewer account that gives Google
   full access without asking reviewers to create or use a personal account.
2. Data Safety still needs an exact inventory of data collected by the app,
   Clerk, backend services, and supporting SDKs before data types and handling
   answers can be submitted.
3. Content Rating requires acceptance of the IARC terms and questionnaire
   answers. Target Audience remains locked until Sign in details is complete.
4. The store listing still needs compliant Play icon, feature graphic, and
   phone screenshots before it can be completed.

Exact next task: create a dedicated Play reviewer sign-in path/account, prepare
the final Data Safety inventory, obtain owner acceptance of the IARC terms and
questionnaire answers, and prepare the required store-listing graphics. Keep
all work on Internal testing until those items are reviewed.

## Reviewer Access And Listing Assets

Date: 2026-07-30

- Android `23 (1.0.22)` adds an email/password reviewer-access form alongside
  the existing Google OAuth button.
- Production Clerk email/password authentication is enabled.
- A dedicated reviewer account exists; its credentials are local-only and
  ignored by Git.
- A code-derived Data Safety inventory is available at
  `docs/google-play-data-safety-inventory.md`.
- Play-ready assets are under `docs/play-store-assets`: a 512 x 512 icon, a
  1024 x 500 feature graphic, and four 1080 x 1920 screenshots captured from
  the real Play-installed Android app without private profile data.

Remaining owner gates are acceptance of the IARC terms, approval of the exact
Content Rating questionnaire answers, and final confirmation of the Data Safety
sharing/retention judgments.

Play Console draft status:

- Dedicated reviewer sign-in details are saved without storing credentials in
  the repository.
- Target audience is saved as ages 16-17 and 18 and over.
- Approved listing copy, app icon, feature graphic, and four phone screenshots
  are saved in the default store-listing draft.
- No publishing-overview submission, production rollout, or Content Rating
  acceptance was completed during this update.

## Play App Information Setup Complete

Date: 2026-07-30

After explicit owner approval:

- The IARC Terms of Use were accepted and the Social/Communication
  questionnaire was completed. Google Play reports a Teen or 12+ rating,
  depending on the regional rating authority, with a Users Interact element.
- The conservative Data Safety inventory was entered and saved. It discloses
  collected personal information, approximate location, in-app messages,
  photos, diagnostics, app activity, user-generated content, and device IDs;
  it declares encrypted transport and no non-exempt third-party sharing.
- The target audience remains ages 16-17 and 18 and over.
- The public store contact and website were saved, and the approved default
  listing text and visual assets were saved to Publishing overview.
- Google Play no longer shows the Finish setting up your app section, which
  confirms that all app-information setup tasks are complete.

No production release, production rollout, or Play policy review submission
was started. The next Google Play gate is a closed test with at least 12 opted-
in testers maintained for at least 14 days before production access can be
requested.

## Reviewer Access And Closed-Test Gate

Date: 2026-07-30

- Internal release `23 (1.0.22)` is available to internal testers and its
  dedicated reviewer login passed in a clean Play Store installation.
- Clerk Client Trust was disabled because it required a second-factor email
  code on every fresh reviewer device. This is an explicit security/usability
  tradeoff for deterministic Play review access; password lockout, bot
  protection, and user-enumeration protection remain enabled.
- Reviewer credentials are stored only in Google Play Console and an ignored
  local file. They must never be copied into repository documentation.
- The existing Alpha closed track still needs country selection, a tester list,
  a release, and review/rollout confirmation.
- At least 12 testers must actually opt in and remain opted in for at least 14
  continuous days before the production-access application unlocks.
- Do not request production access or start a production rollout until the
  closed-test requirement is complete and its feedback has been reviewed.
