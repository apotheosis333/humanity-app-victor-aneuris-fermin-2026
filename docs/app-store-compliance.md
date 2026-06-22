# App-Store Compliance Basics

Step 12 adds the minimum safety and policy foundation needed before preparing
HuMANity for mobile app-store review. This is not a complete legal or
moderation program; founder/legal review is still required.

## Reporting

Authenticated users can submit reports with:

- reporter user ID
- target type
- target ID
- reason/category
- optional details
- status, default `pending`
- timestamps

Backend endpoint:

- `POST /api/reports`

Reports are stored in the `reports` table. Supported moderation statuses are
intended to be `pending`, `reviewed`, `dismissed`, and `actioned`.

Current frontend entry point:

- Public profile pages expose a signed-in-only `Report` action for user/profile
  reports.

## Blocking

Authenticated users can block, unblock, and list blocked users.

Backend endpoints:

- `POST /api/blocks`
- `DELETE /api/blocks/:blockedUserId`
- `GET /api/blocks`

Blocks are stored in the `blocks` table. Creating a block removes any existing
connection row between the two users.

Current blocking effects:

- Blocked pairs cannot send direct messages.
- Blocked pairs cannot start new connection requests.
- User search, recommendations, connection lists, and request lists filter
  blocked pairs where practical.
- Public profile visibility is not fully hidden yet, but profile pages expose
  the block/report controls.

Known blocking limitations:

- Existing messages are not deleted or hidden from the database.
- Blocking is not yet reflected in every content/feed surface.
- There is no admin moderation dashboard yet.

## Account Deletion

Authenticated users can submit an account deletion request.

Backend endpoint:

- `POST /api/account/delete-request`

Requests are stored in the `account_deletion_requests` table with `pending`
status. This first version does not directly delete Clerk users or hard-delete
application data.

Frontend entry point:

- `/profile/edit` includes an account deletion request action.

Manual follow-up required:

- Review the deletion request.
- Delete or anonymize local app data according to the final privacy policy.
- Delete the Clerk user manually from the Clerk dashboard or implement a safe
  server-side Clerk admin deletion workflow later.
- Remove or anonymize associated uploaded objects if required by policy.

## Privacy, Terms, And Support

Frontend placeholder pages were added:

- `/privacy`
- `/terms`
- `/support`

These pages are intentionally marked as draft/placeholder content and require
founder/legal review before public launch. Footer links make these pages visible
for app-store review.

## Moderation Hooks

The `reports` table provides a minimal moderation queue foundation through the
`status` field. A future admin/review workflow should allow authorized staff to:

- list pending reports
- inspect the reported user/content/message
- mark reports as `reviewed`, `dismissed`, or `actioned`
- document moderation action taken
- suspend accounts or remove content where policy requires it

## Database Update Required

This step adds Drizzle schema tables but does not run database push/migration
commands. After review, apply the schema update in the target environment with:

```bash
pnpm --filter @workspace/db run push
```

Do not run destructive or force push database commands without a backup and
explicit approval.

## Remaining Apple/Google Risks

- Final privacy policy and terms require founder/legal review.
- Support contact information must be replaced with a real founder-approved
  email address or support form.
- Full account deletion still requires manual Clerk deletion or a future safe
  Clerk admin integration.
- Blocking does not yet hide all historical content.
- Reporting currently covers profiles/users from the UI; message/content report
  buttons should be added where those IDs are shown.
- A moderation/admin dashboard is not implemented.
- App-store review may require visible community guidelines or safety language
  in onboarding/settings.
