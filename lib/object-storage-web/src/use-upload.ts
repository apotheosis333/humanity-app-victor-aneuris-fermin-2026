import { useState, useCallback } from "react";
import type { UppyFile } from "@uppy/core";

interface UploadMetadata {
  name: string;
  size: number;
  contentType: string;
}

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
  metadata: UploadMetadata;
}

interface ProxyUploadResponse {
  objectPath: string;
  metadata: UploadMetadata;
}

interface UseUploadOptions {
  /** Base path where object storage routes are mounted (default: "/api/storage") */
  basePath?: string;
  /** Optional bearer-token getter for authenticated backend upload routes. */
  authTokenGetter?: () => Promise<string | null> | string | null;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

class UploadError extends Error {
  constructor(
    message: string,
    readonly stage: "request-url" | "direct-put",
    readonly status?: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

async function toUploadBlob(file: File): Promise<Blob> {
  const contentType = file.type || "application/octet-stream";
  const buffer = await file.arrayBuffer();
  return new Blob([buffer], { type: contentType });
}

function putWithXhr(uploadURL: string, body: Blob, contentType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadURL, true);
    request.withCredentials = false;
    request.setRequestHeader("Content-Type", contentType);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(new UploadError("Storage upload failed", "direct-put", request.status));
    };
    request.onerror = () => reject(new UploadError("Storage upload failed", "direct-put"));
    request.ontimeout = () => reject(new UploadError("Storage upload timed out", "direct-put"));
    request.timeout = 60_000;
    request.send(body);
  });
}

/**
 * React hook for handling file uploads with presigned URLs.
 *
 * This hook implements the two-step presigned URL upload flow:
 * 1. Request a presigned URL from your backend (sends JSON metadata, NOT the file)
 * 2. Upload the file directly to the presigned URL
 *
 * @example
 * ```tsx
 * function FileUploader() {
 *   const { uploadFile, isUploading, error } = useUpload({
 *     onSuccess: (response) => {
 *       console.log("Uploaded to:", response.objectPath);
 *     },
 *   });
 *
 *   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0];
 *     if (file) {
 *       await uploadFile(file);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileChange} disabled={isUploading} />
 *       {isUploading && <p>Uploading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpload(options: UseUploadOptions = {}) {
  const basePath = options.basePath ?? "/api/storage";
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const buildBackendHeaders = useCallback(async (): Promise<Headers> => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const token = await options.authTokenGetter?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }, [options.authTokenGetter]);

  const requestUploadUrl = useCallback(
    async (file: File): Promise<UploadResponse> => {
      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: await buildBackendHeaders(),
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new UploadError(errorData.error || "Failed to get upload URL", "request-url", response.status);
      }

      return response.json();
    },
    [basePath, buildBackendHeaders]
  );

  const uploadToPresignedUrl = useCallback(
    async (file: File, uploadURL: string): Promise<void> => {
      const contentType = file.type || "application/octet-stream";
      const body = await toUploadBlob(file);

      try {
        const response = await fetch(uploadURL, {
          method: "PUT",
          mode: "cors",
          credentials: "omit",
          body,
          headers: {
            "Content-Type": contentType,
          },
        });

        if (!response.ok) {
          throw new UploadError("Storage upload failed", "direct-put", response.status);
        }
      } catch (error) {
        if (error instanceof UploadError && error.status != null) {
          throw error;
        }

        await putWithXhr(uploadURL, body, contentType);
      }
    },
    []
  );

  const uploadThroughBackend = useCallback(
    async (file: File): Promise<ProxyUploadResponse> => {
      const contentType = file.type || "application/octet-stream";
      const headers = await buildBackendHeaders();
      headers.set("Content-Type", contentType);
      headers.set("X-Upload-Name", file.name);

      const response = await fetch(`${basePath}/uploads/proxy`, {
        method: "POST",
        headers,
        body: await toUploadBlob(file),
      });
      if (!response.ok) {
        throw new UploadError("Storage upload failed", "direct-put", response.status);
      }
      return response.json();
    },
    [basePath, buildBackendHeaders],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);
        const uploadResponse = await requestUploadUrl(file);

        setProgress(30);
        try {
          await uploadToPresignedUrl(file, uploadResponse.uploadURL);
        } catch {
          const proxyResponse = await uploadThroughBackend(file);
          uploadResponse.objectPath = proxyResponse.objectPath;
          uploadResponse.metadata = proxyResponse.metadata;
        }

        setProgress(100);
        options.onSuccess?.(uploadResponse);
        return uploadResponse;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        if (error instanceof UploadError) {
          console.warn("Object upload failed", {
            stage: error.stage,
            status: error.status ?? null,
            message: error.message,
          });
        } else {
          console.warn("Object upload failed", { message: error.message });
        }
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUploadUrl, uploadToPresignedUrl, uploadThroughBackend, options]
  );

  const getUploadParameters = useCallback(
    async (
      file: UppyFile<Record<string, unknown>, Record<string, unknown>>
    ): Promise<{
      method: "PUT";
      url: string;
      headers?: Record<string, string>;
    }> => {
      const response = await fetch(`${basePath}/uploads/request-url`, {
        method: "POST",
        headers: await buildBackendHeaders(),
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!response.ok) {
        throw new UploadError("Failed to get upload URL", "request-url", response.status);
      }

      const data = await response.json();
      return {
        method: "PUT",
        url: data.uploadURL,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      };
    },
    [basePath, buildBackendHeaders]
  );

  return {
    uploadFile,
    getUploadParameters,
    isUploading,
    error,
    progress,
  };
}
