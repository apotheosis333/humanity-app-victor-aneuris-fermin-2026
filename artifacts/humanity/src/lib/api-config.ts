import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

export function configureApiClient(): void {
  setBaseUrl(API_BASE_URL || null);
}

export function configureApiAuthTokenGetter(
  getter: (() => Promise<string | null> | string | null) | null,
): void {
  setAuthTokenGetter(getter);
}
