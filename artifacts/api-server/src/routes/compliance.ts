import { Router } from "express";
import { db } from "@workspace/db";
import {
  accountDeletionRequestsTable,
  blocksTable,
  connectionsTable,
  profilesTable,
  reportsTable,
} from "@workspace/db";
import { and, eq, or, desc } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const TARGET_TYPES = new Set(["user", "profile", "message", "content", "dinner_answer", "world_news"]);
const REPORT_REASONS = new Set(["harassment", "hate", "sexual_content", "violence", "spam", "impersonation", "other"]);

function readString(value: unknown, maxLength: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength
    ? value.trim()
    : null;
}

function parseReportBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const targetType = readString(data.targetType, 80);
  const targetId = readString(data.targetId, 200);
  const reason = readString(data.reason, 80);
  if (!targetType || !targetId || !reason || !TARGET_TYPES.has(targetType) || !REPORT_REASONS.has(reason)) {
    return null;
  }
  const details = typeof data.details === "string" ? data.details.trim().slice(0, 2000) : "";
  return { targetType, targetId, reason, details: details || null };
}

function parseBlockBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  return readString((body as Record<string, unknown>).blockedUserId, 200);
}

function parseDeleteRequestBody(body: unknown) {
  if (!body || typeof body !== "object") return { reason: null };
  const reason = typeof (body as Record<string, unknown>).reason === "string"
    ? ((body as Record<string, unknown>).reason as string).trim().slice(0, 2000)
    : "";
  return { reason: reason || null };
}

router.post("/reports", requireAuth, authWriteLimiter, async (req, res) => {
  const body = parseReportBody(req.body);
  if (!body) {
    res.status(400).json({ error: "Invalid report" });
    return;
  }

  const [row] = await db
    .insert(reportsTable)
    .values({
      reporterId: req.userId!,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  });
});

router.get("/blocks", requireAuth, async (req, res) => {
  const rows = await db
    .select({
      blockedUserId: blocksTable.blockedUserId,
      createdAt: blocksTable.createdAt,
      displayName: profilesTable.displayName,
      username: profilesTable.username,
      photoUrl: profilesTable.photoUrl,
    })
    .from(blocksTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, blocksTable.blockedUserId))
    .where(eq(blocksTable.blockerId, req.userId!))
    .orderBy(desc(blocksTable.createdAt));

  res.json(
    rows.map((row) => ({
      blockedUserId: row.blockedUserId,
      createdAt: row.createdAt.toISOString(),
      profile: row.displayName
        ? {
            displayName: row.displayName,
            username: row.username,
            photoUrl: row.photoUrl,
          }
        : null,
    })),
  );
});

router.post("/blocks", requireAuth, authWriteLimiter, async (req, res) => {
  const blockedUserId = parseBlockBody(req.body);
  if (!blockedUserId) {
    res.status(400).json({ error: "Invalid block request" });
    return;
  }
  if (blockedUserId === req.userId) {
    res.status(400).json({ error: "You cannot block yourself." });
    return;
  }

  const [row] = await db
    .insert(blocksTable)
    .values({ blockerId: req.userId!, blockedUserId })
    .onConflictDoNothing({ target: [blocksTable.blockerId, blocksTable.blockedUserId] })
    .returning();

  await db
    .delete(connectionsTable)
    .where(
      or(
        and(eq(connectionsTable.requesterId, req.userId!), eq(connectionsTable.addresseeId, blockedUserId)),
        and(eq(connectionsTable.requesterId, blockedUserId), eq(connectionsTable.addresseeId, req.userId!)),
      ),
    );

  res.status(row ? 201 : 200).json({
    blockedUserId,
    status: "blocked",
    createdAt: row?.createdAt.toISOString() ?? null,
  });
});

router.delete("/blocks/:blockedUserId", requireAuth, authWriteLimiter, async (req, res) => {
  const blockedUserId = String(req.params.blockedUserId);
  await db
    .delete(blocksTable)
    .where(and(eq(blocksTable.blockerId, req.userId!), eq(blocksTable.blockedUserId, blockedUserId)));
  res.status(204).end();
});

router.post("/account/delete-request", requireAuth, authWriteLimiter, async (req, res) => {
  const body = parseDeleteRequestBody(req.body);
  if (!body) {
    res.status(400).json({ error: "Invalid deletion request" });
    return;
  }

  const [existing] = await db
    .select()
    .from(accountDeletionRequestsTable)
    .where(and(eq(accountDeletionRequestsTable.userId, req.userId!), eq(accountDeletionRequestsTable.status, "pending")))
    .limit(1);

  if (existing) {
    res.status(200).json({
      id: existing.id,
      status: existing.status,
      createdAt: existing.createdAt.toISOString(),
    });
    return;
  }

  const [row] = await db
    .insert(accountDeletionRequestsTable)
    .values({
      userId: req.userId!,
      reason: body.reason,
      status: "pending",
    })
    .returning();

  res.status(201).json({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
