import { Router } from "express";
import { db } from "@workspace/db";
import { storiesTable, countriesTable } from "@workspace/db";
import { CreateStoryBody, CreateStoryParams, ListStoriesParams } from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/countries/:code/stories", async (req, res) => {
  const params = ListStoriesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { code } = params.data;
  const rows = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.countryCode, code))
    .orderBy(desc(storiesTable.createdAt));

  res.json(rows.map(mapStory));
});

// TODO: Replace requireAuth with admin-role enforcement before production
// content management is exposed outside trusted operators.
router.post("/countries/:code/stories", requireAuth, authWriteLimiter, async (req, res) => {
  const params = CreateStoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const body = CreateStoryBody.safeParse(req.body);
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
    .insert(storiesTable)
    .values({ ...body.data, countryCode: code })
    .returning();
  res.status(201).json(mapStory(row));
});

function mapStory(row: typeof storiesTable.$inferSelect) {
  return {
    id: row.id,
    countryCode: row.countryCode,
    title: row.title,
    author: row.author ?? null,
    content: row.content,
    audioUrl: row.audioUrl ?? null,
    videoUrl: row.videoUrl ?? null,
    imageUrl: row.imageUrl ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
