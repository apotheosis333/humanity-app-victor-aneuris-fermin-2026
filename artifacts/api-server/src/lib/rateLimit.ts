import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import type { Request } from "express";

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

function envInt(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clientIpKey(req: Request): string {
  const ip = req.ip ?? req.socket.remoteAddress;
  return ip ? `ip:${ipKeyGenerator(ip)}` : "ip:unknown";
}

function authAwareKey(req: Request): string {
  return req.userId ? `user:${req.userId}` : clientIpKey(req);
}

function message(routeType: string) {
  return {
    error: "Too many requests. Please wait and try again.",
    routeType,
  };
}

const windowMs = envInt("RATE_LIMIT_WINDOW_MS", DEFAULT_WINDOW_MS);

export const publicWriteLimiter = rateLimit({
  windowMs,
  limit: envInt("RATE_LIMIT_PUBLIC_MAX", 10),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: message("public_write"),
});

export const authWriteLimiter = rateLimit({
  windowMs,
  limit: envInt("RATE_LIMIT_AUTH_MAX", 60),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: authAwareKey,
  message: message("auth_write"),
});

export const aiGenerationLimiter = rateLimit({
  windowMs,
  limit: envInt("RATE_LIMIT_AI_MAX", 5),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: authAwareKey,
  message: message("ai_generation"),
});

export const uploadLimiter = rateLimit({
  windowMs,
  limit: envInt("RATE_LIMIT_UPLOAD_MAX", 20),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: authAwareKey,
  message: message("upload"),
});
