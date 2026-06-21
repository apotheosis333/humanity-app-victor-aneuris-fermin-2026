import type { CorsOptions } from "cors";

const LOCAL_DEVELOPMENT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5173",
  "capacitor://localhost",
  "ionic://localhost",
];

function parseOrigins(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );
}

function isReplitOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".replit.app") || hostname.endsWith(".replit.dev");
  } catch {
    return false;
  }
}

const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);
const developmentOrigins = new Set(LOCAL_DEVELOPMENT_ORIGINS);

export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (configuredOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      callback(null, developmentOrigins.has(normalizedOrigin) || isReplitOrigin(normalizedOrigin));
      return;
    }

    callback(null, false);
  },
};
