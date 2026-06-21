# Storage Deployment Readiness

This note documents the current HuMANity object storage flow and the recommended replacement path for non-Replit deployment. It contains no secret values.

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
4. The backend asks the Replit object storage sidecar for a signed PUT URL.
5. The browser uploads the file directly to that signed URL.
6. The frontend calls `POST /api/storage/uploads/finalize`.
7. The backend stores ACL metadata on the object with the Clerk user as owner and public visibility.
8. Profile photos are stored as `/api/storage/objects/...` URLs and are served through the backend ACL-aware object route.

## Replit-Specific Dependencies

The backend currently uses `@google-cloud/storage`, but authentication and signed URL generation depend on Replit's local object storage sidecar.

Current Replit-specific behavior:

- Default sidecar endpoint: `http://127.0.0.1:1106`.
- Token endpoint: `/token`.
- Credential endpoint: `/credential`.
- Signed URL endpoint: `/object-storage/signed-object-url`.
- Path variables: `PUBLIC_OBJECT_SEARCH_PATHS` and `PRIVATE_OBJECT_DIR`.

`REPLIT_SIDECAR_ENDPOINT` can override the default sidecar URL, but this preserves Replit-style behavior only. It does not make storage cloud-portable on Render/Railway by itself.

## What Fails On Render/Railway

On Render/Railway there is no Replit sidecar at `127.0.0.1:1106`, so these operations will fail:

- Generating signed upload URLs.
- Fetching sidecar credentials for Google Cloud Storage.
- Any upload flow that depends on `getObjectEntityUploadURL()`.

Profile image uploads are therefore blocked until storage is replaced or adapted for a normal cloud provider.

## Current Environment Variables

Currently used:

```bash
PUBLIC_OBJECT_SEARCH_PATHS=
PRIVATE_OBJECT_DIR=
REPLIT_SIDECAR_ENDPOINT=
```

Planned production adapter variables:

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

## Implementation Plan

Implement storage replacement in a dedicated step.

Suggested approach:

1. Add a storage adapter interface for the backend methods already used by routes:
   - create signed upload URL
   - normalize object path
   - fetch object metadata/stream
   - set/get ACL metadata or equivalent app-owned metadata
   - check read access
2. Keep the existing Replit adapter as `STORAGE_PROVIDER=replit`.
3. Add an S3-compatible adapter as `STORAGE_PROVIDER=s3`.
4. Preserve existing API routes:
   - `POST /api/storage/uploads/request-url`
   - `POST /api/storage/uploads/finalize`
   - `GET /api/storage/objects/*`
5. Preserve the frontend upload contract so profile upload UI does not need a redesign.
6. Store stable app object paths such as `/objects/<id>` rather than provider URLs.
7. Use backend serving or short-lived read URLs for private/protected objects.
8. Add migration notes for existing Replit object paths if production data already exists there.

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
5. Keep the bucket private unless a deliberate CDN/public object strategy is chosen.
6. Verify profile photo upload, finalize, profile save, profile view, and object read behavior.

## Cost And Complexity

- Cloudflare R2: low to moderate complexity, generally low cost for this use case.
- AWS S3: moderate complexity, mature ecosystem, costs depend on region/egress.
- Backblaze B2: low cost, S3-compatible, slightly more provider-specific setup.
- Google Cloud Storage: moderate complexity, viable but requires replacing Replit sidecar credentials with normal cloud credentials/signing.
- Supabase Storage: moderate complexity, best if Supabase becomes a larger platform dependency.

Recommendation: implement the adapter in the next storage-specific development step before deploying backend uploads to Render/Railway.
