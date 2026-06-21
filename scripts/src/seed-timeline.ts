import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { db, pool, countriesTable, timelineEventsTable } from "@workspace/db";
import type { InsertTimelineEvent } from "@workspace/db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data", "timeline");

const VALID_CATEGORIES = new Set([
  "political",
  "cultural",
  "scientific",
  "religious",
  "economic",
  "military",
  "social",
  "exploration",
]);

type RawEvent = {
  countryCode: string;
  year: number;
  title: string;
  description: string;
  category?: string | null;
};

async function main() {
  const countries = await db.select({ code: countriesTable.code }).from(countriesTable);
  const validCodes = new Set(countries.map((c) => c.code));

  const files = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (files.length === 0) {
    throw new Error(`No JSON data files found in ${DATA_DIR}`);
  }

  const events: InsertTimelineEvent[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const full = join(DATA_DIR, file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(full, "utf8"));
    } catch (err) {
      problems.push(`${file}: invalid JSON (${(err as Error).message})`);
      continue;
    }
    if (!Array.isArray(parsed)) {
      problems.push(`${file}: top-level value is not an array`);
      continue;
    }
    for (const [i, item] of (parsed as RawEvent[]).entries()) {
      const where = `${file}[${i}]`;
      if (!item || typeof item !== "object") {
        problems.push(`${where}: not an object`);
        continue;
      }
      const { countryCode, year, title, description } = item;
      let { category } = item;
      if (!countryCode || !validCodes.has(countryCode)) {
        problems.push(`${where}: unknown countryCode "${countryCode}"`);
        continue;
      }
      if (typeof year !== "number" || !Number.isInteger(year) || year < -10000 || year > 2100) {
        problems.push(`${where}: invalid year "${year}" for ${countryCode}`);
        continue;
      }
      if (typeof title !== "string" || title.trim().length === 0) {
        problems.push(`${where}: missing title for ${countryCode}`);
        continue;
      }
      if (typeof description !== "string" || description.trim().length < 10) {
        problems.push(`${where}: missing/short description for ${countryCode} (${title})`);
        continue;
      }
      if (category != null && !VALID_CATEGORIES.has(category)) {
        category = null;
      }
      const key = `${countryCode}|${year}|${title.trim().toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push({
        countryCode,
        year,
        title: title.trim(),
        description: description.trim(),
        category: category ?? null,
      });
    }
  }

  if (problems.length > 0) {
    console.error(`Found ${problems.length} problem(s):`);
    for (const p of problems.slice(0, 50)) console.error("  - " + p);
    if (problems.length > 50) console.error(`  ...and ${problems.length - 50} more`);
  }

  if (events.length === 0) {
    throw new Error("No valid events to insert. Aborting.");
  }

  console.log(`Prepared ${events.length} valid events from ${files.length} file(s).`);

  const BATCH = 500;
  await db.transaction(async (tx) => {
    await tx.delete(timelineEventsTable);
    for (let i = 0; i < events.length; i += BATCH) {
      await tx.insert(timelineEventsTable).values(events.slice(i, i + BATCH));
    }
  });

  const byCountry = new Map<string, number>();
  for (const e of events) byCountry.set(e.countryCode, (byCountry.get(e.countryCode) ?? 0) + 1);
  const covered = byCountry.size;
  const missing = [...validCodes].filter((c) => !byCountry.has(c));

  console.log(`Inserted ${events.length} events across ${covered}/${validCodes.size} countries.`);
  if (missing.length > 0) {
    console.log(`Countries with NO events (${missing.length}): ${missing.sort().join(", ")}`);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
