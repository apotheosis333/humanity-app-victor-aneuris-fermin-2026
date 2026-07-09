# Play Policy Owner Review

Date: 2026-07-09

This document prepares owner/legal review for Google Play policy forms. It is not legal advice and must not be copied into Play Console until the owner confirms the open questions. It contains no tester emails, test credentials, Google credentials, Clerk keys, Railway tokens, R2 keys, database URLs, cookies, signed URLs, signing keys, AABs/APKs, build outputs, screenshots, or private user data.

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
- The Support draft still uses a support-contact placeholder. A final email or form URL is required before Play submission.
- The Data Deletion draft correctly says deletion is request-only/manual-review. It does not promise instant or automated deletion.
- `/data-deletion` is wired into the React router and footer. It will be publicly reachable in the built app/web deployment after the Step 36 code is included in a deployed web build or future Android AAB.

Unsupported or unresolved claims:

- No exact deletion timeline is implemented or documented yet.
- Clerk identity deletion is not automated in the backend.
- The operational moderation/admin review process for pending reports is not fully defined.
- The final public web domain and support contact are not confirmed.

## Owner Review Checklist

Please answer these before final Play Console policy submission:

1. What is the final public website/domain for HuMANity?
2. What exact URL should Play use for the Privacy Policy?
3. What exact URL should Play use for Data Deletion instructions?
4. What is the final support email or support form URL?
5. Should HuMANity target users 13+, 16+, 18+, or another age group?
6. Are ads present now, or planned before submission?
7. Are in-app purchases present now, or planned before submission?
8. Does HuMANity collect precise or approximate device location now?
9. Does HuMANity collect contacts from the device now?
10. Does HuMANity use native camera or microphone permissions now?
11. Are direct messages enabled for users at launch?
12. Is user-generated content public, private, moderated, report-only, or a mix?
13. Are profile photos visible to other users?
14. Are account deletions completed manually or automatically at launch?
15. What deletion timeline should be promised after a request?
16. Which records are fully deleted versus anonymized or retained?
17. Do logs/backups have a defined retention period?
18. Are support requests handled by email, form, or both?
19. Will Google reviewers sign in with Google OAuth or a username/password test account?
20. Should Clerk production migration happen before Play policy form submission?

## Proposed Play Console App Access Answer

Needs owner confirmation before submission. Do not include real credentials in GitHub.

```text
HuMANity requires sign-in to test the full app. Open the app, tap Sign In, and use Google OAuth if the provided reviewer account supports it. If a non-OAuth reviewer account is configured, use:

Username: TEST_USERNAME_PLACEHOLDER
Password: TEST_PASSWORD_PLACEHOLDER

After signing in, reviewers can test profile creation/editing, profile photo upload, Explore/countries, viewing another profile, report/block controls, Privacy/Terms/Support/Data Deletion pages, and the account deletion request UI under Profile > Edit profile.
```

Current risk: the Android native sign-in flow currently offers Google OAuth only. If Play requires username/password credentials, a safe reviewer sign-in path or Google-OAuth-compatible reviewer account is needed before submitting this answer.

## Proposed Data Deletion Answer

Needs owner/legal confirmation before submission.

```text
Users can request account and app data deletion in HuMANity by signing in, opening Profile, choosing Edit profile, and using the account deletion request section. HuMANity also provides public deletion instructions at https://<your-public-web-domain>/data-deletion.

The current deletion process is request-only and manually reviewed. Deletion may include app-owned profile data, profile photo references, uploaded profile photos where applicable, account registry records, connections, messages, reports, blocks, and other app-owned data associated with the account. Some records may be retained or anonymized when needed for safety, legal compliance, fraud prevention, or moderation history.

Clerk manages authentication identity, so completing a full deletion may require manual coordination to delete or deactivate the related Clerk identity. Final deletion timeline: <OWNER_TO_CONFIRM>.
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
| Contacts/calendar/microphone | Not observed | Not used | Not applicable | Not applicable | Not applicable | Not applicable | Confirm no permissions are added |
| Ads data | Not observed | Not used | Not applicable | Not applicable | Not applicable | Not applicable | Owner confirmation |

## Content Rating, Target Audience, Ads, And UGC Notes

- Target audience: choose only after owner approval. Because HuMANity has social/user-generated content, messaging, profile photos, reports, and blocking, avoid children/families positioning unless the app is specifically designed and moderated for children.
- Ads declaration: likely `No ads` based on source and QA so far, but owner must confirm no ad SDKs or ad placements are present before submission.
- In-app purchases: no purchase flow has been observed, but owner must confirm before Play submission.
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

## Clerk Production Migration Decision

Recommendation: migrate to a Clerk production instance before broader closed testing, Play policy submission that depends on stable reviewer access, or production review.

Why:

- The current Android build uses a Clerk Development environment.
- The native sign-in page still displays `Development mode`.
- Play reviewers may see Development mode as unfinished or confusing.
- Production Clerk keys, OAuth settings, allowed origins, and native callback settings need final verification.

Required migration steps:

1. Create/configure Clerk production instance.
2. Enable Google OAuth/social connection.
3. Add native callback `app.humanity.global://callback`.
4. Configure deployed web/mobile redirect/origin settings.
5. Update Railway backend Clerk env vars.
6. Update ignored local/CI frontend build env with production `VITE_CLERK_PUBLISHABLE_KEY`.
7. Remove or gate the visible Development mode label.
8. Rebuild, sync Capacitor, create a new signed AAB, upload to Internal testing only, and retest auth/API/upload/report/block/legal routes.

This migration requires a versionCode bump and a new AAB before Play-installed testers can validate the production Clerk path.

## AAB Recommendation

Do not upload a new AAB for legal copy alone yet unless Play urgently requires the updated Data Deletion route inside the installed app.

Recommended path:

1. Finish owner/legal answers.
2. Confirm final public web domain and support contact.
3. Perform Clerk production migration.
4. Bundle the updated legal/data-deletion copy and Clerk production changes into the next Android internal-testing release.
5. Use next Android version after current `5 (1.0.4)`: `versionCode 6`, `versionName 1.0.5`, unless a different release plan is chosen.

## Exact Next Recommended Task

`TASK: STEP 38 - ANSWER OWNER POLICY QUESTIONS AND PREPARE CLERK PRODUCTION MIGRATION`
