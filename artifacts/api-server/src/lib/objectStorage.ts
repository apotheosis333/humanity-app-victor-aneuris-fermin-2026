import { Storage, type File } from "@google-cloud/storage";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  type ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
  type ObjectAclStorageFile,
} from "./objectAcl";

const REPLIT_SIDECAR_ENDPOINT =
  process.env.REPLIT_SIDECAR_ENDPOINT || "http://127.0.0.1:1106";

const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

type StorageProvider = "replit" | "s3";
type StoredObject = ObjectAclStorageFile;

interface StorageAdapter {
  searchPublicObject(filePath: string): Promise<StoredObject | null>;
  downloadObject(objectFile: StoredObject, cacheTtlSec?: number): Promise<Response>;
  getObjectEntityUploadURL(): Promise<string>;
  getObjectEntityFile(objectPath: string): Promise<StoredObject>;
  normalizeObjectEntityPath(rawPath: string): string;
  trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: ObjectAclPolicy): Promise<string>;
  canAccessObjectEntity(args: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean>;
  deleteObject?(objectPath: string): Promise<void>;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private readonly adapter: StorageAdapter;

  constructor() {
    this.adapter = createStorageAdapter();
  }

  searchPublicObject(filePath: string): Promise<StoredObject | null> {
    return this.adapter.searchPublicObject(filePath);
  }

  downloadObject(objectFile: StoredObject, cacheTtlSec = 3600): Promise<Response> {
    return this.adapter.downloadObject(objectFile, cacheTtlSec);
  }

  getObjectEntityUploadURL(): Promise<string> {
    return this.adapter.getObjectEntityUploadURL();
  }

  getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    return this.adapter.getObjectEntityFile(objectPath);
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return this.adapter.normalizeObjectEntityPath(rawPath);
  }

  trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    return this.adapter.trySetObjectEntityAclPolicy(rawPath, aclPolicy);
  }

  canAccessObjectEntity(args: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return this.adapter.canAccessObjectEntity(args);
  }
}

class ReplitStorageAdapter implements StorageAdapter {
  getPublicObjectSearchPaths(): Array<string> {
    const paths = parseCsvEnv(process.env.PUBLIC_OBJECT_SEARCH_PATHS);
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          "tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths).",
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var.",
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(file: File, cacheTtlSec = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === "public";

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const fullPath = `${this.getPrivateObjectDir()}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);

    return signReplitObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

class S3StorageObject implements ObjectAclStorageFile {
  constructor(
    readonly client: S3Client,
    readonly bucket: string,
    readonly key: string,
  ) {}

  get name(): string {
    return this.key;
  }

  async exists(): Promise<[boolean]> {
    try {
      await this.head();
      return [true];
    } catch (error) {
      if (isNotFoundError(error)) {
        return [false];
      }
      throw error;
    }
  }

  async getMetadata(): Promise<[{ metadata?: Record<string, string | undefined> }]> {
    const metadata = await this.head();
    return [{ metadata: metadata.Metadata ?? {} }];
  }

  async setMetadata(data: { metadata: Record<string, string> }): Promise<void> {
    const existing = await this.head();
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
        CopySource: `${this.bucket}/${encodeS3CopySourceKey(this.key)}`,
        MetadataDirective: "REPLACE",
        Metadata: { ...(existing.Metadata ?? {}), ...data.metadata },
        ContentType: existing.ContentType,
        CacheControl: existing.CacheControl,
      }),
    );
  }

  async head(): Promise<HeadObjectCommandOutput> {
    return this.client.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: this.key,
      }),
    );
  }
}

class S3StorageAdapter implements StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly keyPrefix: string;
  private readonly publicBaseUrl: string | null;

  constructor() {
    const bucket = requireEnv("STORAGE_BUCKET");
    const region = requireEnv("STORAGE_REGION");
    const accessKeyId = requireEnv("STORAGE_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("STORAGE_SECRET_ACCESS_KEY");
    const endpoint = optionalEnv("STORAGE_ENDPOINT");

    this.bucket = bucket;
    this.keyPrefix = normalizeS3Prefix(process.env.PRIVATE_OBJECT_DIR ?? "");
    this.publicBaseUrl = optionalEnv("STORAGE_PUBLIC_BASE_URL")?.replace(/\/+$/, "") ?? null;
    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async searchPublicObject(filePath: string): Promise<S3StorageObject | null> {
    const searchPaths = parseCsvEnv(process.env.PUBLIC_OBJECT_SEARCH_PATHS);
    const candidates = searchPaths.length > 0 ? searchPaths : [this.keyPrefix];

    for (const searchPath of candidates) {
      const key = joinS3Key(normalizeS3Prefix(searchPath), filePath);
      const objectFile = this.createObject(key);
      const [exists] = await objectFile.exists();
      if (exists) {
        return objectFile;
      }
    }

    return null;
  }

  async downloadObject(objectFile: StoredObject, cacheTtlSec = 3600): Promise<Response> {
    const s3Object = this.asS3Object(objectFile);
    const aclPolicy = await getObjectAclPolicy(s3Object);
    const isPublic = aclPolicy?.visibility === "public";
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Object.key,
      }),
    );

    const headers: Record<string, string> = {
      "Content-Type": response.ContentType || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (response.ContentLength != null) {
      headers["Content-Length"] = String(response.ContentLength);
    }

    const body = toWebReadableStream(response.Body);
    return new Response(body, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const key = joinS3Key(this.keyPrefix, "uploads", objectId);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }

  async getObjectEntityFile(objectPath: string): Promise<S3StorageObject> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    if (!entityId) {
      throw new ObjectNotFoundError();
    }

    const objectFile = this.createObject(joinS3Key(this.keyPrefix, entityId));
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    try {
      const url = new URL(rawPath);
      let objectKey = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      const bucketPathPrefix = `${this.bucket}/`;
      if (objectKey.startsWith(bucketPathPrefix)) {
        objectKey = objectKey.slice(bucketPathPrefix.length);
      }
      const entityId = stripS3Prefix(objectKey, this.keyPrefix);
      return `/objects/${entityId}`;
    } catch {
      return rawPath;
    }
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }

  async deleteObject(objectPath: string): Promise<void> {
    const objectFile = await this.getObjectEntityFile(objectPath);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectFile.key,
      }),
    );
  }

  getObjectReadUrl(objectPath: string): string | null {
    if (!this.publicBaseUrl) {
      return null;
    }
    const entityId = objectPath.replace(/^\/objects\/?/, "");
    return `${this.publicBaseUrl}/${joinS3Key(this.keyPrefix, entityId)}`;
  }

  private createObject(key: string): S3StorageObject {
    return new S3StorageObject(this.client, this.bucket, key);
  }

  private asS3Object(objectFile: StoredObject): S3StorageObject {
    if (!(objectFile instanceof S3StorageObject)) {
      throw new Error("S3 storage adapter received a non-S3 storage object");
    }
    return objectFile;
  }
}

function createStorageAdapter(): StorageAdapter {
  const provider = normalizeStorageProvider(process.env.STORAGE_PROVIDER);
  if (provider === "s3") {
    return new S3StorageAdapter();
  }
  return new ReplitStorageAdapter();
}

function normalizeStorageProvider(value: string | undefined): StorageProvider {
  const provider = (value ?? "replit").trim().toLowerCase();
  if (provider === "" || provider === "replit") return "replit";
  if (provider === "s3") return "s3";
  throw new Error(`Unsupported STORAGE_PROVIDER: ${value}`);
}

function parseCsvEnv(value: string | undefined): string[] {
  return Array.from(
    new Set(
      (value ?? "")
        .split(",")
        .map((path) => path.trim())
        .filter((path) => path.length > 0),
    ),
  );
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signReplitObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit or set REPLIT_SIDECAR_ENDPOINT`,
    );
  }

  const { signed_url: signedURL } = (await response.json()) as {
    signed_url: string;
  };
  return signedURL;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requireEnv(name: string): string {
  const value = optionalEnv(name);
  if (!value) {
    throw new Error(`${name} must be set when STORAGE_PROVIDER=s3`);
  }
  return value;
}

function normalizeS3Prefix(value: string): string {
  let prefix = value.trim().replace(/^\/+|\/+$/g, "");
  const bucketPrefix = `${process.env.STORAGE_BUCKET ?? ""}/`;
  if (prefix.startsWith(bucketPrefix)) {
    prefix = prefix.slice(bucketPrefix.length);
  }
  return prefix;
}

function joinS3Key(...parts: Array<string | undefined>): string {
  return parts
    .flatMap((part) => (part ?? "").split("/"))
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

function stripS3Prefix(key: string, prefix: string): string {
  const normalizedKey = key.replace(/^\/+/, "");
  if (!prefix) {
    return normalizedKey;
  }
  const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "");
  return normalizedKey.startsWith(`${normalizedPrefix}/`)
    ? normalizedKey.slice(normalizedPrefix.length + 1)
    : normalizedKey;
}

function encodeS3CopySourceKey(key: string): string {
  return key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const maybeError = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return maybeError.name === "NotFound" || maybeError.$metadata?.httpStatusCode === 404;
}

function toWebReadableStream(body: unknown): BodyInit | null {
  if (!body) {
    return null;
  }
  if (body instanceof ReadableStream) {
    return body;
  }
  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream;
  }
  if (typeof body === "object" && "transformToWebStream" in body) {
    return (body as { transformToWebStream(): ReadableStream }).transformToWebStream();
  }
  return body as BodyInit;
}
