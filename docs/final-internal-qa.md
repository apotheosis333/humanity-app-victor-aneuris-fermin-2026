# Final Internal QA Readiness

Date: 2026-07-03

This document records Step 32 final internal QA for the Google Play
Internal testing build. It intentionally excludes tester email addresses,
test credentials, Google credentials, Clerk keys, Railway tokens, R2 keys,
database URLs, cookies, signed URLs, signing keys, AABs/APKs, build outputs,
screenshots, and private account data.

## Play-Installed Baseline

- AVD: `HuMANity_PlayStore_Test_API_36`.
- Package ID: `app.humanity.global`.
- Installed version code: `5`.
- Installed version name: `1.0.4`.
- Installer package: `com.android.vending`.
- Initiating package: `com.android.vending`.
- Update owner: `com.android.vending`.
- App launch: passed.
- Blank WebView check: passed.
- Unexpected permission prompts: none observed.
- Android permissions observed: `android.permission.INTERNET`, Play license
  check permission, and the app's dynamic receiver permission.

Google Play Console status:

- Internal testing track shows latest release `5 (1.0.4)`.
- Release status is available to internal testers.
- Production track is locked; Play Console says production access is not
  available yet. No production rollout exists.
- Temporary app name remains `app.humanity.global (unreviewed)` until app setup
  and review are complete.

## Clerk Development Mode Review

Findings:

- The Clerk dashboard is using the `HuMANity` app in the `Development`
  environment.
- The Clerk environment selector shows `Development` selected and offers
  `Create production instance`.
- The Android native sign-in page includes a visible `Development mode` label in
  app source.
- Prior setup notes confirm the mobile build uses a development Clerk
  publishable key from an ignored local environment file.

Development mode is acceptable for the current internal-only QA track, but it is
not production-ready and should be resolved before closed testing with broader
external testers or any production submission.

Safe production migration recommendation:

1. Create a Clerk production instance from the HuMANity Clerk dashboard.
2. Configure Google OAuth/social connection in the production Clerk instance.
3. Add native callback/deep-link redirect settings for
   `app.humanity.global://callback`.
4. Add allowed origins/redirects needed by deployed web and Capacitor WebViews.
5. Set Railway backend environment variables to the production Clerk values:
   `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`.
6. Set the mobile/frontend build environment to the production client-safe
   `VITE_CLERK_PUBLISHABLE_KEY`.
7. Remove or gate the native `Development mode` label.
8. Rebuild, sync Capacitor, create a new signed AAB, upload only to Internal
   testing, and retest Google OAuth, `/api/me/profile`, profile save, R2 upload,
   report/block, and account deletion request before wider testing.

Do not switch Clerk instances or update production keys without an explicit
approval step.

## Legal And Support Route Results

Routes tested from the Play-installed app footer:

- Privacy route/page: opened, readable on mobile, no blank screen.
- Terms route/page: opened, readable on mobile, no blank screen.
- Support route/page: opened, readable on mobile, no blank screen.
- Android back navigation returned to the previous app page.
- No private data was visible on the legal/support pages.

Status:

- These pages are draft placeholders, not launch-ready legal copy.
- Privacy and Terms both say they require founder/legal review.
- Support is a contact placeholder and still needs a final support email or
  support form URL before store submission.

## Account Deletion Request Result

- Profile edit page opened in the Play-installed build.
- Account deletion card is reachable on mobile.
- The UI copy says deletion is request-only and manual-review based.
- The backend route is `POST /api/account/delete-request` and creates or returns
  a pending request rather than immediately deleting the Clerk user.
- The request was not submitted in this pass because the active signed-in tester
  account may be private. This avoids creating a deletion request for a real
  tester account during QA.

Before Play production review, provide a public data deletion URL or clear
instructions that cover both Clerk identity deletion and app-owned data cleanup.

## Second-Account Report And Block QA

Attempted non-destructive setup:

- Connections page opened in the Play-installed build.
- Find People tab opened.
- Search for an existing harmless test profile returned no visible second
  profile.

Result:

- A second visible test profile was not available in the production backend data.
- No new Clerk user or database profile was created in this step because that
  would require persistent external account setup and/or database writes.
- Report and block UI could not be tested end-to-end from the Play-installed app
  without a second visible test profile.

Implementation status from source:

- `POST /api/reports` requires auth and creates a pending report.
- `POST /api/blocks` requires auth, blocks the target user, and removes any
  connection between the two accounts.
- `DELETE /api/blocks/:blockedUserId` exists for unblock.
- `ReportBlockControls` render on another user's profile and are hidden for the
  viewer's own profile.

Remaining blocker:

- Create two dedicated QA accounts with completed public profiles, then test
  report and block flows end-to-end. Keep credentials outside the repository.

## Core Internal QA Checklist

- Home renders: passed.
- Explore renders country data: passed.
- Public backend country count: `24`.
- Country detail page: passed with Egypt detail content visible.
- Profile page opens: passed.
- Profile edit opens: passed.
- Profile photo persists: passed from previous Step 31C retest and remained
  visible in this QA session.
- Navigation works on mobile: passed for Home, Explore, Profile, Connections,
  legal routes, and country detail. The drawer is easiest to use from top-of-page
  positions; deep footer navigation can be finicky.
- Footer links work: passed for Privacy, Terms, and Support.
- Connections UI opens: passed.
- Messaging UI: not opened in this pass.
- Dinner Table/social feature: not opened in this pass.
- Sign out/sign back in: not retested in this pass to avoid disrupting the
  existing tester session; Google OAuth already passed in Step 31C.
- Unexpected native permissions: none observed.
- Fatal Android/WebView log scan: no matching fatal/crash/error entries found in
  the recent log window.
- Sensitive tokens or signed URLs in normal UI: none observed.

## Google Play Readiness Review

Ready for continued internal testing:

- Play Internal testing is active.
- Play-installed build is verified from Google Play.
- Google OAuth works in the internal build.
- Backend, countries, profile save, R2 upload, and profile photo persistence are
  working in the Play-installed build.

Still required before wider closed testing or production:

1. Move Clerk to a production instance and retest the full mobile auth/API/upload
   path.
2. Replace draft Privacy Policy and Terms with founder/legal-reviewed copy.
3. Add final support/contact URL or email.
4. Provide account deletion/data deletion URL or instructions for Play.
5. Create two dedicated QA profiles and complete report/block end-to-end testing.
6. Complete Play Store listing short description and full description.
7. Upload final Play Store app icon, feature graphic, and phone screenshots.
8. Complete Privacy policy URL, Data Safety, Content rating, Target audience and
   content, Ads declaration, app access/test instructions, and any UGC/social
   moderation declarations Google asks for.
9. Resolve the temporary app name by completing app setup and review.
10. Review Play Console requirements for personal developer accounts before
    production access, including any closed-testing tester-count/duration
    requirements shown by Google.

Do not guess legal, policy, or Data Safety answers. Handle those in a dedicated
founder/legal review step.

## Remaining Blockers

- Production Clerk migration is not done.
- Legal/support pages are placeholders.
- Report/block end-to-end QA is blocked by lack of a second visible QA profile.
- Account deletion request was verified as reachable but not submitted.
- Play Console store listing and policy declarations remain incomplete.
- No new AAB was needed for this QA pass.

## Next Recommended Task

`TASK: STEP 33 - CREATE DEDICATED QA TEST PROFILES AND COMPLETE REPORT/BLOCK PLUS PLAY POLICY READINESS`

## Step 33 Report/Block And Policy Readiness Update

Date: 2026-07-08

Second profile visibility finding:

- Find People searches completed `profiles` rows, not every Clerk user.
- Search excludes the current signed-in user.
- Search excludes users where either side has blocked the other.
- Recommendation matching also requires a completed viewer profile with overlap
  data and completed candidate profiles.
- Clerk users without completed profile rows do not appear in Find People.
- In the Play-installed build, the known harmless search term did not return a
  second visible QA profile.

Production data inspection note:

- A direct local read-only database count could not connect because the
  PostgreSQL hostname is Railway-internal.
- No direct database insert, seed, or destructive command was run.

Second QA profile result:

- A second dedicated QA profile was not created in this step.
- Creating a second Clerk account/profile or inserting profile data directly
  would be persistent external account/database setup and should happen in a
  dedicated approved setup step with credentials kept outside the repository.

Report/block result:

- Report and block could not be completed end-to-end because no second visible
  QA profile was available to target.
- Source review confirms the backend endpoints exist and require auth:
  - `POST /api/reports`
  - `POST /api/blocks`
  - `DELETE /api/blocks/:blockedUserId`
- Source review confirms block records remove existing connection rows and
  discovery/messaging/connection paths check block state.

Account deletion request review:

- UI remains reachable from Profile edit.
- Copy says account deletion is request-only and manually reviewed.
- Backend route `POST /api/account/delete-request` creates or returns a pending
  request and does not immediately delete Clerk identity data.
- A public data deletion URL or instructions are still needed for Play readiness.

Policy readiness:

- See `docs/google-play-policy-readiness.md`.
- Privacy/Terms/Support are not launch-ready because they are placeholders.
- Data Safety, Content Rating, Target Audience, Ads, App Access, UGC moderation,
  account/data deletion, store listing, screenshots, icon, and feature graphic
  still need owner/legal review and Play Console completion.

Clerk production migration:

- See `docs/clerk-production-migration.md`.
- No Clerk environment, key, OAuth, Railway variable, or app binary was changed
  in this step.

## Step 34 Dedicated QA Profiles And Report/Block Result

Date: 2026-07-08

QA profile setup:

- Two dedicated username-only Clerk QA users were created or confirmed in the
  same Clerk development environment used by the current internal Android build.
- No real email addresses or Gmail aliases were used.
- No QA passwords, session tokens, Clerk keys, Railway tokens, database URLs, or
  private identifiers were printed, documented, committed, or stored in the
  repository.
- Completed public profiles now exist for:
  - `HuMANity QA One`
  - `HuMANity QA Two`
- QA profile data is harmless internal-testing content only.

Authenticated backend QA result:

- `HuMANity QA One` can find `HuMANity QA Two` in discovery before blocking.
- `HuMANity QA Two` can find `HuMANity QA One` in discovery before blocking.
- Current-user exclusion works; `HuMANity QA One` does not appear in its own
  search results.
- `HuMANity QA One` submitted a harmless report against `HuMANity QA Two`; the
  backend returned `201` with report status `pending`.
- `HuMANity QA One` blocked `HuMANity QA Two`; the backend returned `201` with
  status `blocked`.
- While blocked, both directions were hidden from discovery search.
- The block appeared in `HuMANity QA One`'s block list.
- The QA block was removed through the implemented unblock route after the test
  so both profiles remain reusable and visible for future QA.
- After unblock, `HuMANity QA One` could find `HuMANity QA Two` again.

Account deletion request review:

- The account deletion request UI and backend route remain request-only/manual
  review.
- No deletion request was submitted for the QA accounts in this step.
- A public data deletion URL or clear public instructions are still required
  before Play production review.

Remaining QA note:

- The deployed backend report/block behavior is verified with real Clerk QA
  users and completed profiles.
- A short Play-installed UI spot-check should still tap through another user's
  profile to visually confirm report/block dialog success states in the Android
  WebView before broader external testing.

Next recommended task:

`TASK: STEP 35 - PLAY-INSTALLED REPORT/BLOCK UI SPOT-CHECK AND GOOGLE PLAY APP ACCESS PREP`

## Step 35 Play-Installed Report/Block UI Spot-Check

Date: 2026-07-08

Play-installed baseline:

- AVD: `HuMANity_PlayStore_Test_API_36`.
- Package ID: `app.humanity.global`.
- Version tested: `5 (1.0.4)`.
- Installer package: `com.android.vending`.
- App launch: passed.
- Blank WebView check: passed.
- Unexpected native permission prompts: none observed.
- Existing Google OAuth/Clerk session: still active.

QA profile UI result:

- `HuMANity QA Two` appeared in Find People when searched by username.
- The QA profile page opened in the Play-installed app.
- Report and Block controls rendered on the profile page.
- The current internal build's native Android sign-in screen only offers Google
  OAuth, so the username-only QA Clerk users cannot themselves sign in to the
  Play-installed app without adding email/OAuth credentials. No real email alias
  was added in this step.

Report UI result:

- Tapping Report opened the expected browser prompt asking what should be
  reviewed.
- A harmless QA report reason was submitted.
- The UI returned to the profile page without a blank screen or crash.
- The report button briefly showed a loading state and then settled.
- No private data was shown in the report prompt.

Block UI result:

- Tapping Block opened the expected browser confirmation:
  `Block this member? Existing connections will be removed.`
- The block was not confirmed because the signed-in Play session is a private
  tester session rather than `HuMANity QA One`; this avoids creating cleanup work
  against a non-QA account.
- No blank screen or crash occurred.

Cleanup:

- A harmless accidental connection request to `HuMANity QA Two` was canceled
  through the Play-installed UI, returning the button to `Connect`.
- No QA block was created, so no unblock cleanup was needed.

Account deletion, legal, and support:

- The Profile edit page opened in the Play-installed app.
- The account deletion request section was reachable; visible copy still says
  deletion is completed manually after review.
- No deletion request was submitted.
- Footer links for Privacy Policy, Terms of Service, and Support were visible.
- Footer link tapping from this scrolled mobile position did not successfully
  navigate during this pass; these routes previously opened in Step 32 and still
  need final launch copy/legal review.

App access instruction draft:

- HuMANity requires sign-in. A dedicated test account can be provided in Google
  Play Console App access credentials. After signing in, reviewers can test
  profile creation/editing, profile photo upload, Explore/countries,
  report/block controls, privacy/terms/support pages, and the account deletion
  request UI.
- Do not commit reviewer credentials. Enter credentials only inside Play Console
  after a dedicated approval step.

Remaining blockers:

- Create or approve Play-reviewer credentials that work with the current Android
  Google OAuth-only sign-in, or add a safe reviewer sign-in path in a future
  code step.
- Production Clerk migration is still required before broader testing or
  production review.
- Privacy/Terms/Support copy and public data deletion instructions still need
  founder/legal review.

Next recommended task:

`TASK: STEP 36 - PREPARE GOOGLE PLAY APP ACCESS, DATA DELETION URL, AND LEGAL COPY DRAFTS`
