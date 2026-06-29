# Storage Deployment Readiness

This note documents the HuMANity object storage flow and the storage adapter paths for Replit and S3-compatible production deployment. It contains no secret values.

## Current Architecture

The current storage implementation lives in:

- `artifacts/api-server/src/lib/objectStorage.ts`
- `artifacts/api-server/src/lib/objectAcl.ts`
- `artifacts/api-server/src/routes/storage.ts`
- `lib/object-storage-web/src/use-upload.ts`
- `artifacts/humanity/src/pages/profile-edit.tsx`

Current profile image upload flow:

1. The signed-in frontend calls `POST /api/storage/uploads/request-url`.
2. The backend validates image type and size.
3. The backend creates a private object path under `PRIVATE_OBJECT_DIR`.
4. The backend asks the configured storage adapter for a signed PUT URL.
5. The browser uploads the file directly to that signed URL.
6. The frontend calls `POST /api/storage/uploads/finalize`.
7. The backend stores ACL metadata on the object with the Clerk user as owner and public visibility.
8. Profile photos are stored as `/objects/...` object paths and are served through the backend ACL-aware `/api/storage/objects/...` route.

## Storage Providers

`STORAGE_PROVIDER` selects the backend adapter:

- Empty or `replit`: use the existing Replit object storage sidecar behavior.
- `s3`: use S3-compatible storage, such as Cloudflare R2, AWS S3, or Backblaze B2.

The frontend upload contract remains stable:

- `POST /api/storage/uploads/request-url`
- `POST /api/storage/uploads/finalize`
- `GET /api/storage/objects/*`

## Replit Storage

The backend currently uses `@google-cloud/storage`, but authentication and signed URL generation depend on Replit's local object storage sidecar.

Current Replit-specific behavior:

- Default sidecar endpoint: `http://127.0.0.1:1106`.
- Token endpoint: `/token`.
- Credential endpoint: `/credential`.
- Signed URL endpoint: `/object-storage/signed-object-url`.
- Path variables: `PUBLIC_OBJECT_SEARCH_PATHS` and `PRIVATE_OBJECT_DIR`.

`REPLIT_SIDECAR_ENDPOINT` can override the default sidecar URL, but this preserves Replit-style behavior only.

## What Fails On Render/Railway

On Render/Railway there is no Replit sidecar at `127.0.0.1:1106`, so Replit mode will fail for:

- Generating signed upload URLs.
- Fetching sidecar credentials for Google Cloud Storage.
- Any upload flow that depends on `getObjectEntityUploadURL()`.

Use `STORAGE_PROVIDER=s3` for non-Replit production deployment.

## S3-Compatible Storage

The S3 adapter can generate presigned PUT URLs and serve stored objects through the existing backend routes. It stores app ACL metadata in object metadata and keeps stable app object paths such as `/objects/uploads/<id>`.

Required env vars when `STORAGE_PROVIDER=s3`:

```bash
STORAGE_PROVIDER=s3
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

`STORAGE_ENDPOINT` is required for Cloudflare R2 and most S3-compatible providers. For AWS S3, it can usually be omitted.

`STORAGE_PUBLIC_BASE_URL` is optional. The current backend still preserves `/api/storage/objects/*` serving, so public CDN delivery can be added deliberately later without changing profile upload UI.

## Current Environment Variables

Replit mode:

```bash
PUBLIC_OBJECT_SEARCH_PATHS=
PRIVATE_OBJECT_DIR=
REPLIT_SIDECAR_ENDPOINT=
```

S3-compatible mode:

```bash
STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_PUBLIC_BASE_URL=
```

Do not put real storage credentials in GitHub. Set real values only in the deployment provider dashboard.

## Recommended Production Path

Recommended provider path: S3-compatible storage, preferably Cloudflare R2 for this app.

Why it fits HuMANity:

- It supports private buckets and signed upload URLs.
- It has S3-compatible APIs, so AWS S3, Cloudflare R2, and Backblaze B2 can share one adapter style.
- It is a good fit for profile photos and future user-generated media.
- It avoids depending on Replit runtime services.
- It can work from Render/Railway and mobile apps.

Alternative: Google Cloud Storage can also work because the current code already imports `@google-cloud/storage`, but the existing implementation does not use normal service account or workload identity credentials. A true GCS path would still need a new signing/auth configuration.

Supabase Storage can work too, especially if Supabase becomes the database/auth/storage platform later, but it is less aligned with the current Express/Drizzle architecture.

## Implemented Adapter Shape

`ObjectStorageService` now delegates to provider adapters while keeping the route-facing methods stable:

- `searchPublicObject`
- `downloadObject`
- `getObjectEntityUploadURL`
- `getObjectEntityFile`
- `normalizeObjectEntityPath`
- `trySetObjectEntityAclPolicy`
- `canAccessObjectEntity`
- `deleteObject` support at the adapter level for future cleanup flows

The existing Replit behavior is preserved as the default adapter. The S3 adapter is enabled only when `STORAGE_PROVIDER=s3`.

## Future Implementation Plan

Further hardening should happen in later steps.

Suggested approach:

1. Add integration tests or manual smoke tests against a real R2/S3 bucket.
2. Decide whether profile images should continue through backend reads or move to a CDN/public base URL.
3. Add object deletion to the future account deletion flow.
4. Add migration notes for existing Replit object paths if production data already exists there.

## Manual Provider Setup Checklist

For Cloudflare R2 or another S3-compatible provider:

1. Create a private bucket for uploaded user media.
2. Create an access key with least privilege for that bucket.
3. Set production env vars in Render/Railway:
   - `STORAGE_PROVIDER=s3`
   - `STORAGE_BUCKET=`
   - `STORAGE_REGION=`
   - `STORAGE_ENDPOINT=`
   - `STORAGE_ACCESS_KEY_ID=`
   - `STORAGE_SECRET_ACCESS_KEY=`
   - `STORAGE_PUBLIC_BASE_URL=` if public CDN delivery is used
4. Configure CORS on the bucket so browser PUT uploads from the deployed frontend/mobile origins are allowed.
5. Allow the `PUT` method and `Content-Type` header in bucket CORS.
6. Keep the bucket private unless a deliberate CDN/public object strategy is chosen.
7. Verify profile photo upload, finalize, profile save, profile view, and object read behavior.

## Manual Cloudflare R2 / S3 Smoke Test Checklist

Use placeholder names in documentation and real values only in local ignored env files or deployment provider secrets.

Provider setup:

1. Create a private bucket for uploaded user media.
2. Create least-privilege access keys for the bucket.
3. Set `STORAGE_PROVIDER=s3`.
4. Set `STORAGE_BUCKET`.
5. Set `STORAGE_REGION`.
6. Set `STORAGE_ENDPOINT`.
7. Set `STORAGE_ACCESS_KEY_ID`.
8. Set `STORAGE_SECRET_ACCESS_KEY`.
9. Set `STORAGE_PUBLIC_BASE_URL` only if using a public CDN/base URL.
10. Configure bucket CORS for browser/mobile direct PUT uploads.
11. Include allowed origins for local web, deployed web, and future mobile origins.
12. Allow the `PUT` method.
13. Allow the `Content-Type` request header.

Backend/API smoke test:

1. Start the backend with `STORAGE_PROVIDER=s3` and placeholder-free local secrets.
2. Sign in through the frontend so storage requests include Clerk auth.
3. Upload a JPG, PNG, or WEBP under 5 MB from the profile edit screen.
4. Confirm `POST /api/storage/uploads/request-url` returns an `uploadURL`, `objectPath`, and metadata.
5. Confirm the browser direct `PUT` upload to the signed URL succeeds.
6. Confirm `POST /api/storage/uploads/finalize` succeeds and returns an `/objects/...` path.
7. Save the profile with the returned `/objects/...` object path.
8. Confirm `GET /api/storage/objects/...` returns the uploaded image.
9. Confirm the image is visible on the profile page.
10. Confirm an unsupported file type is rejected.
11. Confirm a file over 5 MB is rejected.
12. Confirm missing S3 env vars fail with clear startup/request errors and do not log secrets.
13. Confirm `STORAGE_PROVIDER=` or `STORAGE_PROVIDER=replit` still uses the Replit adapter.

## Step 23 Cloudflare R2 Setup

Date: 2026-06-23

Provider used: Cloudflare R2.

Bucket:

```text
humanity-profile-uploads
```

Bucket location:

```text
ENAM
```

Railway backend storage variables configured by name:

```bash
STORAGE_PROVIDER=s3
STORAGE_BUCKET=humanity-profile-uploads
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
PRIVATE_OBJECT_DIR=objects
```

No storage credentials belong in frontend env, mobile env, source code, docs, or GitHub.

R2 bucket CORS was configured for direct browser/mobile uploads:

```text
Allowed origins: https://localhost, http://localhost:5173
Allowed methods: PUT, GET, HEAD
Allowed headers: Content-Type, x-amz-*
Exposed headers: ETag
Max age: 3600 seconds
```

Before public web launch, add the deployed web frontend origin to the R2 CORS allowlist. Avoid wildcard production CORS unless there is a deliberate reason.

Smoke test result:

- Railway backend redeployed successfully with `STORAGE_PROVIDER=s3`.
- `/health` passed.
- `/api/healthz` passed.
- Unauthenticated `POST /api/storage/uploads/request-url` returned `401`, as expected.
- Direct R2 S3 write/read smoke test passed using Railway storage env.
- Test object prefix: `objects/smoke-tests/`.

Credential note:

Cloudflare bucket-scoped token creation was attempted first, but the created tokens showed `Object Read only` in the dashboard and could not write objects. A broader Account API token with `Admin Read & Write` was created so storage could be smoke-tested. This works, but should be tightened later to an Object Read & Write token scoped to `humanity-profile-uploads` once the Cloudflare dashboard/API flow reliably creates that permission.

## Step 26 R2 Credential Hardening

Date: 2026-06-29

A new Cloudflare R2 account token was created for production storage with least-privilege object access:

- Token name: `humanity-profile-uploads-object-read-write-2026-06-29`
- Bucket scope: `humanity-profile-uploads`
- Permission: `Object Read & Write`

Railway backend storage variables were updated with the new bucket-scoped access key values:

```bash
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
```

No credential values, tokens, signed URLs, cookies, or environment files are stored in this repository.

Validation after updating Railway:

- Railway backend health check: passed.
- `/api/healthz`: passed.
- Authenticated Android `GET /api/me/profile`: passed.
- `POST /api/storage/uploads/request-url`: passed.
- Direct R2 `PUT` to the signed upload URL: passed.
- `POST /api/storage/uploads/finalize`: passed.
- `PUT /api/me/profile` with the returned `/objects/...` path: passed.
- Profile readback persisted the saved `photoUrl`: passed.
- Backend object serving through `/api/storage/objects/...`: passed with `image/png`.

The old all-buckets `Admin Read & Write` token named `humanity-railway-r2-admin-write` was deleted after the bucket-scoped token passed the authenticated upload smoke test.

Remaining Cloudflare cleanup:

- `humanity-railway-r2-admin-smoke` is still an all-buckets `Object Read only` token.
- `R2 Account Token` is still a bucket-scoped `Object Read only` token for `humanity-profile-uploads`.
- These read-only tokens are not required by the current Railway backend credentials and should be reviewed/revoked later if they are unused.

Manual cleanup recommended:

- Revoke the read-only R2 tokens created during setup if they are not needed.

Profile-photo upload status:

The authenticated Android profile-photo upload/save/read flow passed after the bucket-scoped R2 token was applied in Railway.

## Step 24 Android Authenticated Upload Result

Date: 2026-06-29

The Android authenticated profile photo upload smoke test was attempted after a
successful Android rebuild and Clerk frontend login. The storage flow remains
blocked before R2 because the Railway backend returned `401 Unauthorized` for
the Android WebView Clerk bearer token on the authenticated profile and upload
request endpoints.

R2 direct PUT, finalize, profile save, image display, and persistence were not
retested in Step 24. Fix Clerk mobile-to-backend token verification first, then
rerun the complete upload flow. The Step 23 direct R2 backend smoke test remains
valid, and the broader R2 token still must be replaced with a bucket-scoped
Object Read & Write token before production.

## Step 25 Android Authenticated Upload Pass

Date: 2026-06-29

After wiring Clerk token forwarding into the generated API client and object
storage upload helper, the authenticated Android profile-photo flow passed:

- Backend upload URL request: `200`.
- Direct R2 signed URL PUT: `200`.
- Backend upload finalize: `200`.
- Profile save with the uploaded object URL: `200`.
- Profile readback and image endpoint: `200`.
- Android profile page loaded the stored image.

The R2 adapter and bucket CORS worked for the Android WebView flow. Step 26
replaced the broad R2 Admin Read & Write token with a bucket-scoped Object Read
& Write token and retested the upload flow successfully.

## Cost And Complexity

- Cloudflare R2: low to moderate complexity, generally low cost for this use case.
- AWS S3: moderate complexity, mature ecosystem, costs depend on region/egress.
- Backblaze B2: low cost, S3-compatible, slightly more provider-specific setup.
- Google Cloud Storage: moderate complexity, viable but requires replacing Replit sidecar credentials with normal cloud credentials/signing.
- Supabase Storage: moderate complexity, best if Supabase becomes a larger platform dependency.

Recommendation: use Cloudflare R2 first for production smoke testing, then keep the adapter provider-neutral so AWS S3 or Backblaze B2 remain viable.
