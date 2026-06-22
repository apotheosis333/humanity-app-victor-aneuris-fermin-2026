import { Router } from "express";
import { db } from "@workspace/db";
import { humanityPledgesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { publicWriteLimiter } from "../lib/rateLimit";

const router = Router();

router.post("/pledge", publicWriteLimiter, async (req, res) => {
  const { name, country } = req.body as { name?: string; country?: string };

  const [pledge] = await db
    .insert(humanityPledgesTable)
    .values({ name: name ?? null, country: country ?? null })
    .returning();

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(humanityPledgesTable);

  res.status(201).json({
    id: pledge.id,
    pledgedAt: pledge.pledgedAt.toISOString(),
    totalCount: count,
  });
});

router.get("/pledge/count", async (_req, res) => {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(humanityPledgesTable);
  res.json({ count });
});

export default router;
