import { db } from "@workspace/db";
import { worldNewsTable, countriesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export const NEWS_CATEGORIES = [
  "Science",
  "Health",
  "Environment",
  "Community",
  "Education",
  "Culture",
  "Technology",
  "Humanitarian",
] as const;

export const NEWS_REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Middle East",
  "Global",
] as const;

const SOURCE_NAME = "huMANity AI Desk";
const ARTICLES_PER_BATCH = 12;

// How old the most recent batch may be before we regenerate (6 hours).
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
// How often the scheduler wakes to re-check staleness (1 hour).
const SCHEDULER_TICK_MS = 60 * 60 * 1000;

interface RawArticle {
  category: string;
  title: string;
  summary: string;
  body: string;
  region: string;
  countryCode?: string | null;
  tone?: string;
}

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function parseArticles(raw: unknown): RawArticle[] | null {
  if (!raw || typeof raw !== "object") return null;
  const list = (raw as { articles?: unknown }).articles;
  if (!Array.isArray(list)) return null;
  const out: RawArticle[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    const title = str(a.title);
    const summary = str(a.summary);
    const body = str(a.body);
    if (title.length < 4 || summary.length < 10 || body.length < 40) continue;
    const codeRaw = a.countryCode;
    out.push({
      category: str(a.category),
      title,
      summary,
      body,
      region: str(a.region),
      countryCode: typeof codeRaw === "string" ? codeRaw : null,
      tone: typeof a.tone === "string" ? a.tone : undefined,
    });
  }
  return out;
}

// Module-level guard so overlapping ticks / a slow generation never run twice.
let generating = false;

async function latestBatchAgeMs(): Promise<number | null> {
  const [row] = await db
    .select({ latest: sql<string | null>`max(${worldNewsTable.publishedAt})` })
    .from(worldNewsTable);
  if (!row?.latest) return null;
  return Date.now() - new Date(row.latest).getTime();
}

function buildPrompt(validCategories: readonly string[], validRegions: readonly string[]): string {
  return [
    `Generate ${ARTICLES_PER_BATCH} short, uplifting, strictly POSITIVE world-news style stories that celebrate human progress, kindness, resilience, scientific breakthroughs, conservation wins, community generosity, education, and cross-cultural understanding.`,
    "",
    "Hard rules:",
    "- Every story MUST be positive and hopeful. Never include tragedy, conflict, crime, disaster, politics framed negatively, or anything cynical.",
    "- These are AI-curated, illustrative human-interest stories. Do NOT invent fake quotes attributed to real, named living people, and do NOT fabricate specific false statistics presented as verified breaking news. Keep them realistic, warm, and grounded in genuine ongoing global progress themes.",
    "- Spread the stories across many regions and categories of the world, not just wealthy nations.",
    "",
    `Each story is a JSON object with: "category" (one of: ${validCategories.join(", ")}), "title" (concise, no clickbait), "summary" (1-2 sentences), "body" (2-4 short paragraphs), "region" (one of: ${validRegions.join(", ")}), "countryCode" (an ISO 3166-1 alpha-2 uppercase code such as KE, JP, BR, or null if the story is multi-country/global), and "tone" (a single word like uplifting, hopeful, inspiring).`,
    "",
    'Return ONLY valid JSON in the exact shape: {"articles": [ ...story objects... ]}.',
  ].join("\n");
}

/**
 * Calls the model, validates the response, and inserts a fresh batch of
 * positive news. Returns the number of articles inserted (0 on failure).
 * New batches are appended (never wiped) so saved/reacted articles persist.
 */
export async function generateAndStoreNews(): Promise<number> {
  if (generating) {
    logger.info("news generation already in progress; skipping");
    return 0;
  }
  generating = true;
  try {
    const validCodes = new Set(
      (await db.select({ code: countriesTable.code }).from(countriesTable)).map((c) => c.code),
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are the editor of a global good-news desk for a humanity-focused platform. You only publish positive, hopeful, factual-in-spirit human-interest stories. You always respond with valid JSON.",
        },
        { role: "user", content: buildPrompt(NEWS_CATEGORIES, NEWS_REGIONS) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      logger.error("news generation returned empty content");
      return 0;
    }

    let articles: RawArticle[] | null;
    try {
      articles = parseArticles(JSON.parse(raw));
    } catch {
      logger.error("news generation returned invalid JSON");
      return 0;
    }
    if (!articles || articles.length === 0) {
      logger.error("news generation produced no valid articles");
      return 0;
    }

    const categorySet = new Set<string>(NEWS_CATEGORIES);
    const regionSet = new Set<string>(NEWS_REGIONS);
    const batchId = `batch_${Date.now()}`;

    const rows = articles
      .map((a) => {
        const category = categorySet.has(a.category) ? a.category : "Community";
        const region = regionSet.has(a.region) ? a.region : "Global";
        const code = a.countryCode?.toUpperCase() ?? null;
        const countryCode = code && validCodes.has(code) ? code : null;
        return {
          category,
          title: a.title.trim(),
          summary: a.summary.trim(),
          body: a.body.trim(),
          region,
          countryCode,
          sourceName: SOURCE_NAME,
          tone: (a.tone ?? "uplifting").trim().toLowerCase().slice(0, 40),
          imageUrl: null,
          batchId,
        };
      })
      .filter((r) => r.title && r.summary && r.body);

    if (rows.length === 0) {
      logger.error("news generation produced no valid rows");
      return 0;
    }

    await db.insert(worldNewsTable).values(rows);
    logger.info({ count: rows.length, batchId }, "world news batch generated");
    return rows.length;
  } catch (err) {
    logger.error({ err }, "world news generation failed");
    return 0;
  } finally {
    generating = false;
  }
}

async function refreshIfStale(): Promise<void> {
  const age = await latestBatchAgeMs();
  if (age === null || age > STALE_AFTER_MS) {
    logger.info({ ageMs: age }, "world news is stale or empty; generating");
    await generateAndStoreNews();
  }
}

/**
 * Starts the self-contained news scheduler: generates immediately if the feed
 * is empty/stale, then re-checks on an interval. Errors are swallowed and
 * logged so a generation failure never crashes the server.
 */
export function startNewsScheduler(): void {
  void refreshIfStale().catch((err) => logger.error({ err }, "initial news refresh failed"));
  const timer = setInterval(() => {
    void refreshIfStale().catch((err) => logger.error({ err }, "scheduled news refresh failed"));
  }, SCHEDULER_TICK_MS);
  // Don't keep the event loop alive solely for the scheduler.
  timer.unref?.();
}
