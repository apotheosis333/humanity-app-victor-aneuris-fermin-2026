# Data Safety Readiness

Date: 2026-07-09

This is a preparation matrix only. Do not submit Play Console Data Safety answers from this document without founder/legal review. It contains no credentials, private account data, tokens, signed URLs, signing keys, AABs/APKs, or private tester information.

## Data Safety Preparation Matrix

| Data category | Current status | Purpose | Shared with service providers | Deletion path | Needs confirmation |
| --- | --- | --- | --- | --- | --- |
| Account identifiers and auth data | Collected through Clerk and app account records | Authentication, account security, session handling | Clerk, Railway/PostgreSQL as needed for app account mapping | Manual deletion request and Clerk coordination | Production Clerk instance, retention, exact identifiers |
| Profile information | Collected when users create/edit profiles | Public profile, discovery, connection matching | Railway/PostgreSQL | Manual deletion request | Exact public/private fields and retention |
| Profile photos/uploads | Collected when users upload profile photos | Profile display and app personalization | Cloudflare R2 or S3-compatible storage, Railway/PostgreSQL references | Manual deletion request; storage cleanup needs final process | Object deletion workflow and retention |
| Messages and user-generated content | Collected where messaging/social features are used | User communication and community features | Railway/PostgreSQL | Manual deletion/anonymization review | Moderation retention and user deletion behavior |
| Connections and app activity | Collected through connection requests, blocks, reports, profile edits, pledges, and interactions | App functionality, safety, discovery, moderation | Railway/PostgreSQL | Manual deletion request, with possible safety retention | Which activity is retained for safety/legal reasons |
| Reports, blocks, and moderation records | Collected when users report or block others | User safety, abuse prevention, moderation review | Railway/PostgreSQL | May require retention or anonymization | Moderation retention policy and admin workflow |
| Diagnostics, logs, device/browser/network data | Likely collected by backend, hosting, auth, and storage providers | Security, debugging, reliability, abuse prevention | Railway, Clerk, Cloudflare R2/S3 provider, platform logs | Provider-specific retention plus manual request where applicable | Exact log retention and diagnostics scope |
| Location | No native precise location permission observed; country/profile fields are user-provided | Profile context and cultural exploration | Railway/PostgreSQL when provided | Manual deletion request | Confirm no GPS/native location is added before submission |
| Contacts, calendar, microphone | Not observed in Android permissions or current app behavior | Not used | Not applicable | Not applicable | Reconfirm before Play submission |
| Camera | No native camera permission observed; profile photos use upload/file selection patterns | Profile photo upload if user selects a file/photo | Cloudflare R2/S3 provider, Railway/PostgreSQL references | Manual deletion request | Confirm no native camera permission is added |
| Ads data | No ads found in current source or QA notes | Not used | Not applicable | Not applicable | Founder confirmation before Ads declaration |

## Play Console Readiness Checklist

1. App access instructions or reviewer credentials entered only in Play Console.
2. Public Privacy Policy URL confirmed.
3. Public Data Deletion URL confirmed.
4. Data Safety form reviewed and submitted by owner/legal.
5. Content rating questionnaire completed.
6. Target audience and content settings approved.
7. Ads declaration confirmed.
8. UGC/social moderation declarations reviewed.
9. Short store description drafted and approved.
10. Full store description drafted and approved.
11. App category selected.
12. Developer/contact details confirmed.
13. Phone screenshots captured from the Play-ready build.
14. Feature graphic prepared.
15. Final Play Store icon and brand assets prepared.
16. Closed testing requirements reviewed for the developer account.
17. Clerk production migration completed and retested before broader release.

## App Access Reviewer Flow

Reviewers should be able to sign in, create or edit a profile, upload a profile photo, open Explore/countries, view another profile, test report/block controls, open Privacy/Terms/Support/Data Deletion pages, and find the account deletion request UI under Profile edit.

Because the current Android sign-in path uses Google OAuth, reviewer access needs a Google-account-compatible test path or a future approved reviewer sign-in improvement.

## Step 37 Proposed Play Data Safety Answers

See `docs/play-policy-owner-review.md` for the proposed owner-review Data Safety answer matrix. It expands this readiness matrix into draft Play Console-style answers for:

- Account/profile information.
- User identifiers.
- Clerk authentication data.
- Profile photos/uploads.
- User-generated content.
- Reports and blocks.
- Connections/messages.
- App activity/interactions.
- Diagnostics/logs.
- Device/network data.
- Location, contacts, camera, microphone, and ads confirmation.

Do not submit those draft answers until the owner confirms the open questions.
