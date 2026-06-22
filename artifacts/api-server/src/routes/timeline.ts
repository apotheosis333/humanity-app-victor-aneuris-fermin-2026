import { Router } from "express";
import { db } from "@workspace/db";
import { timelineEventsTable, countriesTable } from "@workspace/db";
import { CreateTimelineEventBody, CreateTimelineEventParams, ListTimelineParams } from "@workspace/api-zod";
import { eq, asc } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/countries/:code/timeline", async (req, res) => {
  const params = ListTimelineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { code } = params.data;
  const rows = await db
    .select()
    .from(timelineEventsTable)
    .where(eq(timelineEventsTable.countryCode, code))
    .orderBy(asc(timelineEventsTable.year));

  res.json(rows.map(mapEvent));
});

// TODO: Replace requireAuth with admin-role enforcement before production
// content management is exposed outside trusted operators.
router.post("/countries/:code/timeline", requireAuth, authWriteLimiter, async (req, res) => {
  const params = CreateTimelineEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const body = CreateTimelineEventBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const { code } = params.data;
  const [country] = await db.select().from(countriesTable).where(eq(countriesTable.code, code));
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  const [row] = await db
    .insert(timelineEventsTable)
    .values({ ...body.data, countryCode: code })
    .returning();
  res.status(201).json(mapEvent(row));
});

function mapEvent(row: typeof timelineEventsTable.$inferSelect) {
  return {
    id: row.id,
    countryCode: row.countryCode,
    year: row.year,
    title: row.title,
    description: row.description,
    mediaUrl: row.mediaUrl ?? null,
    mediaType: row.mediaType ?? null,
    category: row.category ?? null,
  };
}

export default router;
