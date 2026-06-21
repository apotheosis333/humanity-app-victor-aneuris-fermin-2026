import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { recordAccount } from "../lib/accounts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function resolveUserId(req: Request): string | undefined {
  const auth = getAuth(req);
  return (auth?.sessionClaims?.userId as string | undefined) || auth?.userId || undefined;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  recordAccount(userId);
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = resolveUserId(req);
  req.userId = userId;
  if (userId) recordAccount(userId);
  next();
}
