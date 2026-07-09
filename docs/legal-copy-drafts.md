# Legal Copy Drafts

Date: 2026-07-09

These are launch-prep drafts for HuMANity. They are not legal advice and need founder/legal review before Google Play production review or wider public launch. This document intentionally contains no reviewer credentials, tester emails, Clerk keys, Railway tokens, R2 keys, database URLs, cookies, signed URLs, signing keys, AABs/APKs, screenshots, or private user data.

## Current Public Routes

- `/privacy`
- `/terms`
- `/support`
- `/data-deletion`

The deployed public web URL still needs to be confirmed before entering Privacy Policy or data deletion links in Play Console.

## Google Play App Access Draft

Use this as placeholder copy for Play Console App access. Enter any actual credentials only inside Play Console, never in repository docs.

```text
HuMANity requires sign-in. A dedicated test account can be provided in Google Play Console App access credentials. After signing in, reviewers can test profile creation/editing, profile photo upload, Explore/countries, report/block controls, Privacy/Terms/Support/Data Deletion pages, and the account deletion request UI.
```

Current limitation: the Android native sign-in flow uses Google OAuth. Play reviewer credentials must work with the current Google OAuth flow, or a future approved step must add a safe reviewer sign-in path.

## Data Deletion Draft

Recommended public route after web deployment:

```text
https://<your-public-web-domain>/data-deletion
```

Draft user instructions:

```text
To request deletion in the app, sign in, open Profile, choose Edit profile, and use the account deletion request section. HuMANity currently handles deletion through a manual-review process. If you cannot access your account, use Support for help with an account or data deletion request.
```

Deletion may cover app-owned profile data, profile photo references, uploaded profile photos where applicable, account registry records, connections, messages, reports, blocks, account deletion request records, and other app-owned data associated with the account. Some records may need to be retained or anonymized for safety, fraud prevention, legal compliance, or moderation history. Clerk identity deletion may require manual coordination with Clerk in addition to app-owned data cleanup.

Do not promise instant or fully automated deletion until the deletion workflow is implemented and legally reviewed.

## Privacy Policy Draft Summary

The app draft explains that HuMANity uses Clerk for authentication, Railway for backend hosting, PostgreSQL for app data, and Cloudflare R2 or another S3-compatible provider for uploads. It covers profile data, profile photos, user-generated/social data, reports, blocks, deletion requests, technical logs, service providers, retention/deletion requests, and the need for owner/legal review.

Before launch, confirm exact data collected, retention periods, support contact, subprocessors, international transfer language, and account/data deletion handling.

## Terms Draft Summary

The app draft covers respectful use, user-generated content responsibilities, prohibited harassment/hate/abuse/spam/illegal/harmful content, reporting and blocking tools, moderation actions, content rights, HuMANity brand rights, service-change disclaimers, and the need for legal review.

Before launch, legal review should add final governing law, dispute terms, limitation of liability, contact terms, and any app-specific enforcement language.

## Support Draft Summary

The app draft points users to support for account access, profile issues, uploads, reporting, blocking, safety concerns, moderation questions, privacy requests, and account deletion requests.

A final founder-approved support email or support form URL is still required before store submission. Do not invent or publish a support address without approval.

## Owner/Legal Questions

1. What is the final public web domain for Privacy Policy and Data Deletion URLs?
2. What is the final support email or support form URL?
3. What deletion timeline should be promised, if any?
4. Which records should be deleted, retained, or anonymized for safety/moderation/legal reasons?
5. Which Clerk production instance and subprocessors will be used for launch?
6. Will analytics, crash reporting, or additional diagnostics be added before submission?
7. What age range should be selected for Play target audience?
8. What legal entity, jurisdiction, and contact information should appear in final terms?

## Step 37 Owner Review Reference

See `docs/play-policy-owner-review.md` for:

- Owner review checklist.
- Proposed Play Console App Access wording.
- Proposed Data Deletion wording.
- Proposed Data Safety answer matrix.
- Content rating, target audience, ads, and UGC notes.
- Store listing draft.
- Clerk production migration decision note.
- AAB recommendation.

## Step 38 Owner Policy Answers

Owner-approved draft values for policy preparation:

- Support contact: `jawsofthetrap@gmail.com`.
- Target age: `16+`.
- Ads: no ads.
- In-app purchases: no.
- Native location, contacts, camera, microphone permissions: no.
- Account deletion: request-only/manual review.
- Deletion target: within 30 days after a verified request, unless
  legal/security retention is required.
- Reviewer access: Google OAuth first; QA credentials only in Play Console if
  Google requires direct credentials.

Still not final:

- Whether a support form should be added in addition to email.
- Exact retention/anonymization rules for reports, messages, logs, backups, and
  moderation records.

Step 39 verified public frontend policy URLs:

- Privacy Policy: `https://humanity-frontend-legal-production.up.railway.app/privacy`
- Terms: `https://humanity-frontend-legal-production.up.railway.app/terms`
- Support: `https://humanity-frontend-legal-production.up.railway.app/support`
- Data Deletion: `https://humanity-frontend-legal-production.up.railway.app/data-deletion`

These URLs are ready for owner approval before Play Console entry. A custom
domain can replace them later if desired, but no DNS/domain change was made in
Step 39.
