import { Router } from "express";
import { db } from "@workspace/db";
import {
  countriesTable,
  timelineEventsTable,
  culturalMilestonesTable,
  storiesTable,
  countryPhrasesTable,
} from "@workspace/db";
import {
  ListCountriesQueryParams,
  CreateCountryBody,
  GetCountryParams,
  GetCountryStatsParams,
} from "@workspace/api-zod";
import { eq, ilike, or, sql } from "drizzle-orm";

const router = Router();

router.get("/countries", async (req, res) => {
  const query = ListCountriesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  const { continent } = query.data as { continent?: string };
  const language = req.query.language as string | undefined;
  const religion = req.query.religion as string | undefined;
  const region = req.query.region as string | undefined;

  let rows = await db.select().from(countriesTable).orderBy(countriesTable.name);

  if (continent) rows = rows.filter((r) => r.continent === continent);
  if (region) rows = rows.filter((r) => r.region?.toLowerCase().includes(region.toLowerCase()));
  if (language) rows = rows.filter((r) => r.languages?.toLowerCase().includes(language.toLowerCase()));
  if (religion) rows = rows.filter((r) => r.religion?.toLowerCase().includes(religion.toLowerCase()));

  res.json(rows.map(mapCountry));
});

router.post("/countries", async (req, res) => {
  const body = CreateCountryBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const [row] = await db.insert(countriesTable).values(body.data).returning();
  res.status(201).json(mapCountry(row));
});

router.get("/countries/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(countriesTable)
    .where(eq(countriesTable.featured, true))
    .orderBy(countriesTable.name);
  res.json(rows.map(mapCountry));
});

router.get("/countries/random", async (_req, res) => {
  const [row] = await db
    .select()
    .from(countriesTable)
    .orderBy(sql`random()`)
    .limit(1);
  res.json(mapCountry(row));
});

router.get("/countries/daily", async (_req, res) => {
  const rows = await db.select().from(countriesTable).orderBy(countriesTable.name);
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % rows.length;
  res.json(mapCountry(rows[index]));
});

router.get("/countries/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim().length === 0) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }
  const pattern = `%${q}%`;
  const rows = await db
    .select()
    .from(countriesTable)
    .where(or(ilike(countriesTable.name, pattern), ilike(countriesTable.continent, pattern)))
    .orderBy(countriesTable.name);
  res.json(rows.map(mapCountry));
});

router.get("/countries/continents", async (_req, res) => {
  const rows = await db.select().from(countriesTable).orderBy(countriesTable.continent, countriesTable.name);
  const grouped: Record<string, ReturnType<typeof mapCountry>[]> = {};
  for (const row of rows) {
    if (!grouped[row.continent]) grouped[row.continent] = [];
    grouped[row.continent].push(mapCountry(row));
  }
  const result = Object.entries(grouped).map(([continent, countries]) => ({
    continent,
    countries,
  }));
  res.json(result);
});

router.get("/countries/compare", async (req, res) => {
  const a = (req.query.a as string)?.toUpperCase();
  const b = (req.query.b as string)?.toUpperCase();
  if (!a || !b) {
    res.status(400).json({ error: "Both 'a' and 'b' country codes required" });
    return;
  }

  const [countryA] = await db.select().from(countriesTable).where(eq(countriesTable.code, a)).limit(1);
  const [countryB] = await db.select().from(countriesTable).where(eq(countriesTable.code, b)).limit(1);

  if (!countryA || !countryB) {
    res.status(404).json({ error: "One or both countries not found" });
    return;
  }

  const getStats = async (code: string) => {
    const [tc] = await db.select({ count: sql<number>`count(*)::int` }).from(timelineEventsTable).where(eq(timelineEventsTable.countryCode, code));
    const [mc] = await db.select({ count: sql<number>`count(*)::int` }).from(culturalMilestonesTable).where(eq(culturalMilestonesTable.countryCode, code));
    const [sc] = await db.select({ count: sql<number>`count(*)::int` }).from(storiesTable).where(eq(storiesTable.countryCode, code));
    return { timelineCount: tc?.count ?? 0, milestoneCount: mc?.count ?? 0, storyCount: sc?.count ?? 0 };
  };

  const [statsA, statsB] = await Promise.all([getStats(a), getStats(b)]);

  res.json({
    a: { ...mapCountry(countryA), ...statsA },
    b: { ...mapCountry(countryB), ...statsB },
  });
});

router.get("/countries/:code", async (req, res) => {
  const code = (req.params.code as string).toUpperCase();
  const [country] = await db.select().from(countriesTable).where(eq(countriesTable.code, code)).limit(1);

  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }

  const [timelineCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(timelineEventsTable)
    .where(eq(timelineEventsTable.countryCode, code));
  const [milestoneCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(culturalMilestonesTable)
    .where(eq(culturalMilestonesTable.countryCode, code));
  const [storyCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storiesTable)
    .where(eq(storiesTable.countryCode, code));

  res.json({
    ...mapCountry(country),
    timelineCount: timelineCount?.count ?? 0,
    milestoneCount: milestoneCount?.count ?? 0,
    storyCount: storyCount?.count ?? 0,
  });
});

router.get("/countries/:code/phrases", async (req, res) => {
  const code = (req.params.code as string).toUpperCase();
  const phrases = await db
    .select()
    .from(countryPhrasesTable)
    .where(eq(countryPhrasesTable.countryCode, code));
  res.json(phrases);
});

router.get("/countries/:code/stats", async (req, res) => {
  const params = GetCountryStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { code } = params.data;

  const [timelineCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(timelineEventsTable)
    .where(eq(timelineEventsTable.countryCode, code));
  const [milestoneCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(culturalMilestonesTable)
    .where(eq(culturalMilestonesTable.countryCode, code));
  const [storyCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storiesTable)
    .where(eq(storiesTable.countryCode, code));
  const [minYear] = await db
    .select({ year: sql<number | null>`min(year)` })
    .from(timelineEventsTable)
    .where(eq(timelineEventsTable.countryCode, code));
  const [maxYear] = await db
    .select({ year: sql<number | null>`max(year)` })
    .from(timelineEventsTable)
    .where(eq(timelineEventsTable.countryCode, code));

  res.json({
    code,
    timelineCount: timelineCount?.count ?? 0,
    milestoneCount: milestoneCount?.count ?? 0,
    storyCount: storyCount?.count ?? 0,
    earliestEvent: minYear?.year ?? null,
    latestEvent: maxYear?.year ?? null,
  });
});

function mapCountry(row: typeof countriesTable.$inferSelect) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    continent: row.continent,
    region: row.region ?? null,
    capital: row.capital ?? null,
    flagUrl: row.flagUrl ?? null,
    coverImageUrl: row.coverImageUrl ?? null,
    summary: row.summary ?? null,
    population: row.population ?? null,
    areaKm2: row.areaKm2 ?? null,
    languages: row.languages ?? null,
    currency: row.currency ?? null,
    governmentType: row.governmentType ?? null,
    religion: row.religion ?? null,
    featured: row.featured,
  };
}

export default router;
