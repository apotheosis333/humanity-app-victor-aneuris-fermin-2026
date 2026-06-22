import { Router } from "express";
import { db } from "@workspace/db";
import {
  worldNewsTable,
  newsReactionsTable,
  newsSavesTable,
  countriesTable,
} from "@workspace/db";
import { ReactToWorldNewsBody } from "@workspace/api-zod";
import { and, eq, desc, inArray, sql } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

const REACTIONS = ["inspired", "hopeful", "grateful", "love"] as const;
type ReactionKind = (typeof REACTIONS)[number];

interface WorldNewsDTO {
  id: number;
  category: string;
  title: string;
  summary: string;
  body: string;
  region: string;
  countryCode: string | null;
  countryName: string | null;
  countryFlagUrl: string | null;
  sourceName: string;
  tone: string;
  imageUrl: string | null;
  publishedAt: string;
  reactionCounts: { inspired: number; hopeful: number; grateful: number; love: number };
  totalReactions: number;
  viewerReaction: ReactionKind | null;
  saved: boolean;
}

type NewsRow = typeof worldNewsTable.$inferSelect & {
  countryName: string | null;
  countryFlagUrl: string | null;
};

const baseSelect = {
  id: worldNewsTable.id,
  category: worldNewsTable.category,
  title: worldNewsTable.title,
  summary: worldNewsTable.summary,
  body: worldNewsTable.body,
  region: worldNewsTable.region,
  countryCode: worldNewsTable.countryCode,
  sourceName: worldNewsTable.sourceName,
  tone: worldNewsTable.tone,
  imageUrl: worldNewsTable.imageUrl,
  batchId: worldNewsTable.batchId,
  publishedAt: worldNewsTable.publishedAt,
  createdAt: worldNewsTable.createdAt,
  countryName: countriesTable.name,
  countryFlagUrl: countriesTable.flagUrl,
};

// Enriches news rows with reaction tallies and the viewer's own reaction/saved
// state. Counts are aggregated on read so the news rows stay denormalization-free.
async function toDTOs(rows: NewsRow[], userId: string | null): Promise<WorldNewsDTO[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const countRows = await db
    .select({
      newsId: newsReactionsTable.newsId,
      reaction: newsReactionsTable.reaction,
      count: sql<number>`count(*)::int`,
    })
    .from(newsReactionsTable)
    .where(inArray(newsReactionsTable.newsId, ids))
    .groupBy(newsReactionsTable.newsId, newsReactionsTable.reaction);

  const countsByNews = new Map<
    number,
    { inspired: number; hopeful: number; grateful: number; love: number }
  >();
  for (const id of ids) {
    countsByNews.set(id, { inspired: 0, hopeful: 0, grateful: 0, love: 0 });
  }
  for (const c of countRows) {
    const bucket = countsByNews.get(c.newsId);
    if (bucket && (REACTIONS as readonly string[]).includes(c.reaction)) {
      bucket[c.reaction as ReactionKind] = c.count;
    }
  }

  const viewerReactions = new Map<number, ReactionKind>();
  const savedIds = new Set<number>();
  if (userId) {
    const mine = await db
      .select({ newsId: newsReactionsTable.newsId, reaction: newsReactionsTable.reaction })
      .from(newsReactionsTable)
      .where(and(eq(newsReactionsTable.userId, userId), inArray(newsReactionsTable.newsId, ids)));
    for (const r of mine) {
      if ((REACTIONS as readonly string[]).includes(r.reaction)) {
        viewerReactions.set(r.newsId, r.reaction as ReactionKind);
      }
    }
    const saves = await db
      .select({ newsId: newsSavesTable.newsId })
      .from(newsSavesTable)
      .where(and(eq(newsSavesTable.userId, userId), inArray(newsSavesTable.newsId, ids)));
    for (const s of saves) savedIds.add(s.newsId);
  }

  return rows.map((r) => {
    const counts = countsByNews.get(r.id) ?? {
      inspired: 0,
      hopeful: 0,
      grateful: 0,
      love: 0,
    };
    return {
      id: r.id,
      category: r.category,
      title: r.title,
      summary: r.summary,
      body: r.body,
      region: r.region,
      countryCode: r.countryCode,
      countryName: r.countryName,
      countryFlagUrl: r.countryFlagUrl,
      sourceName: r.sourceName,
      tone: r.tone,
      imageUrl: r.imageUrl,
      publishedAt: r.publishedAt.toISOString(),
      reactionCounts: counts,
      totalReactions: counts.inspired + counts.hopeful + counts.grateful + counts.love,
      viewerReaction: viewerReactions.get(r.id) ?? null,
      saved: savedIds.has(r.id),
    };
  });
}

async function fetchOneDTO(id: number, userId: string | null): Promise<WorldNewsDTO | null> {
  const rows = await db
    .select(baseSelect)
    .from(worldNewsTable)
    .leftJoin(countriesTable, eq(worldNewsTable.countryCode, countriesTable.code))
    .where(eq(worldNewsTable.id, id))
    .limit(1);
  const dtos = await toDTOs(rows, userId);
  return dtos[0] ?? null;
}

// GET /world-news — public feed, newest first, optional category/region filters.
router.get("/world-news", optionalAuth, async (req, res) => {
  const userId = req.userId ?? null;
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const region = typeof req.query.region === "string" ? req.query.region.trim() : "";
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 60) : 30;

  const conds = [];
  if (category) conds.push(eq(worldNewsTable.category, category));
  if (region) conds.push(eq(worldNewsTable.region, region));

  const rows = await db
    .select(baseSelect)
    .from(worldNewsTable)
    .leftJoin(countriesTable, eq(worldNewsTable.countryCode, countriesTable.code))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(worldNewsTable.publishedAt), desc(worldNewsTable.id))
    .limit(limit);

  res.json(await toDTOs(rows, userId));
});

// GET /world-news/saved — the signed-in user's saved items, most recent first.
router.get("/world-news/saved", requireAuth, async (req, res) => {
  const userId = req.userId!;
  const rows = await db
    .select({ ...baseSelect, savedAt: newsSavesTable.createdAt })
    .from(newsSavesTable)
    .innerJoin(worldNewsTable, eq(newsSavesTable.newsId, worldNewsTable.id))
    .leftJoin(countriesTable, eq(worldNewsTable.countryCode, countriesTable.code))
    .where(eq(newsSavesTable.userId, userId))
    .orderBy(desc(newsSavesTable.createdAt));

  res.json(await toDTOs(rows, userId));
});

// POST /world-news/:id/react — set or change the viewer's reaction.
router.post("/world-news/:id/react", requireAuth, authWriteLimiter, async (req, res) => {
  const userId = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const parsed = ReactToWorldNewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid reaction" });
    return;
  }

  const [exists] = await db
    .select({ id: worldNewsTable.id })
    .from(worldNewsTable)
    .where(eq(worldNewsTable.id, id))
    .limit(1);
  if (!exists) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db
    .insert(newsReactionsTable)
    .values({ newsId: id, userId, reaction: parsed.data.reaction })
    .onConflictDoUpdate({
      target: [newsReactionsTable.userId, newsReactionsTable.newsId],
      set: { reaction: parsed.data.reaction },
    });

  res.json(await fetchOneDTO(id, userId));
});

// DELETE /world-news/:id/react — clear the viewer's reaction.
router.delete("/world-news/:id/react", requireAuth, authWriteLimiter, async (req, res) => {
  const userId = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db
    .delete(newsReactionsTable)
    .where(and(eq(newsReactionsTable.userId, userId), eq(newsReactionsTable.newsId, id)));

  const dto = await fetchOneDTO(id, userId);
  if (!dto) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(dto);
});

// POST /world-news/:id/save — save an item (idempotent).
router.post("/world-news/:id/save", requireAuth, authWriteLimiter, async (req, res) => {
  const userId = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [exists] = await db
    .select({ id: worldNewsTable.id })
    .from(worldNewsTable)
    .where(eq(worldNewsTable.id, id))
    .limit(1);
  if (!exists) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db
    .insert(newsSavesTable)
    .values({ newsId: id, userId })
    .onConflictDoNothing({ target: [newsSavesTable.userId, newsSavesTable.newsId] });

  res.json(await fetchOneDTO(id, userId));
});

// DELETE /world-news/:id/save — remove a saved item.
router.delete("/world-news/:id/save", requireAuth, authWriteLimiter, async (req, res) => {
  const userId = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db
    .delete(newsSavesTable)
    .where(and(eq(newsSavesTable.userId, userId), eq(newsSavesTable.newsId, id)));

  const dto = await fetchOneDTO(id, userId);
  if (!dto) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(dto);
});

export default router;
