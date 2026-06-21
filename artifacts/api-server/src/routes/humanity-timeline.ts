import { Router } from "express";
import { db } from "@workspace/db";
import { timelineEventsTable, countriesTable } from "@workspace/db";
import { eq, and, gte, lte, sql, inArray, asc } from "drizzle-orm";

const router = Router();

const ERAS = {
  ancient: { label: "Ancient World", yearRange: "Before 500 BCE", min: -10000, max: -500 },
  classical: { label: "Classical Age", yearRange: "500 BCE – 500 CE", min: -500, max: 500 },
  medieval: { label: "Medieval Period", yearRange: "500 – 1500 CE", min: 500, max: 1500 },
  modern: { label: "Early Modern", yearRange: "1500 – 1900 CE", min: 1500, max: 1900 },
  contemporary: { label: "Contemporary", yearRange: "1900 CE – Present", min: 1900, max: 2100 },
};

// Maps an absolute year to its era key, matching the ERAS ranges above.
function eraForYear(year: number): keyof typeof ERAS {
  for (const key of Object.keys(ERAS) as (keyof typeof ERAS)[]) {
    if (year >= ERAS[key].min && year <= ERAS[key].max) return key;
  }
  return year < -500 ? "ancient" : "contemporary";
}

router.get("/humanity-timeline", async (req, res) => {
  const eraParam = req.query.era as string | undefined;

  const erasToFetch = eraParam && eraParam in ERAS
    ? [eraParam as keyof typeof ERAS]
    : (Object.keys(ERAS) as (keyof typeof ERAS)[]);

  const results = await Promise.all(
    erasToFetch.map(async (eraKey) => {
      const era = ERAS[eraKey];
      const events = await db
        .select({
          id: timelineEventsTable.id,
          countryCode: timelineEventsTable.countryCode,
          countryName: countriesTable.name,
          year: timelineEventsTable.year,
          title: timelineEventsTable.title,
          description: timelineEventsTable.description,
          category: timelineEventsTable.category,
          mediaUrl: timelineEventsTable.mediaUrl,
          mediaType: timelineEventsTable.mediaType,
        })
        .from(timelineEventsTable)
        .innerJoin(countriesTable, eq(timelineEventsTable.countryCode, countriesTable.code))
        .where(
          and(
            gte(timelineEventsTable.year, era.min),
            lte(timelineEventsTable.year, era.max)
          )
        )
        .orderBy(timelineEventsTable.year)
        .limit(50);

      return {
        era: eraKey,
        label: era.label,
        yearRange: era.yearRange,
        events,
      };
    })
  );

  res.json(results);
});

// GET /humanity-timeline/search — diacritic-insensitive search across nation
// names, event titles, and descriptions, with optional category/era filters.
router.get("/humanity-timeline/search", async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim() ?? "";
  const category = (req.query.category as string | undefined)?.trim();
  const eraParam = req.query.era as string | undefined;
  const limitRaw = parseInt(String(req.query.limit ?? ""), 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 100)
    : 60;

  const filters = [];
  if (q.length > 0) {
    const pattern = `%${q}%`;
    // If the query is a bare integer, also match it against the event year so
    // searches like "1969" find that year's events.
    const yearMatch = /^-?\d{1,5}$/.test(q) ? parseInt(q, 10) : null;
    filters.push(
      sql`(
        unaccent(${timelineEventsTable.title}) ILIKE unaccent(${pattern})
        OR unaccent(${timelineEventsTable.description}) ILIKE unaccent(${pattern})
        OR unaccent(${countriesTable.name}) ILIKE unaccent(${pattern})
        ${yearMatch != null ? sql`OR ${timelineEventsTable.year} = ${yearMatch}` : sql``}
      )`,
    );
  }
  if (category) {
    filters.push(eq(timelineEventsTable.category, category));
  }
  if (eraParam && eraParam in ERAS) {
    const era = ERAS[eraParam as keyof typeof ERAS];
    filters.push(gte(timelineEventsTable.year, era.min));
    filters.push(lte(timelineEventsTable.year, era.max));
  }

  const rows = await db
    .select({
      id: timelineEventsTable.id,
      countryCode: timelineEventsTable.countryCode,
      countryName: countriesTable.name,
      countryFlagUrl: countriesTable.flagUrl,
      year: timelineEventsTable.year,
      title: timelineEventsTable.title,
      description: timelineEventsTable.description,
      category: timelineEventsTable.category,
    })
    .from(timelineEventsTable)
    .innerJoin(
      countriesTable,
      eq(timelineEventsTable.countryCode, countriesTable.code),
    )
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(timelineEventsTable.year))
    .limit(limit);

  res.json(rows.map((r) => ({ ...r, era: eraForYear(r.year) })));
});

// GET /humanity-timeline/compare — per-nation timelines for 2-4 countries.
router.get("/humanity-timeline/compare", async (req, res) => {
  const rawCodes = String(req.query.countries ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  // Dedupe while preserving requested order.
  const codes = [...new Set(rawCodes)];

  if (codes.length < 2 || codes.length > 4) {
    res.status(400).json({ error: "Provide 2-4 unique country codes." });
    return;
  }

  const countries = await db
    .select({
      code: countriesTable.code,
      name: countriesTable.name,
      flagUrl: countriesTable.flagUrl,
    })
    .from(countriesTable)
    .where(inArray(countriesTable.code, codes));

  if (countries.length < 2) {
    res
      .status(404)
      .json({ error: "Could not find at least two of the requested nations." });
    return;
  }

  const events = await db
    .select({
      id: timelineEventsTable.id,
      countryCode: timelineEventsTable.countryCode,
      year: timelineEventsTable.year,
      title: timelineEventsTable.title,
      description: timelineEventsTable.description,
      category: timelineEventsTable.category,
      mediaUrl: timelineEventsTable.mediaUrl,
      mediaType: timelineEventsTable.mediaType,
    })
    .from(timelineEventsTable)
    .where(inArray(timelineEventsTable.countryCode, codes))
    .orderBy(asc(timelineEventsTable.year));

  // Preserve the caller's requested order so columns line up with selection.
  const byCode = new Map(countries.map((c) => [c.code, c]));
  const result = codes
    .map((code) => byCode.get(code))
    .filter((c): c is NonNullable<typeof c> => c != null)
    .map((c) => ({
      ...c,
      events: events.filter((e) => e.countryCode === c.code),
    }));

  res.json(result);
});

export default router;
