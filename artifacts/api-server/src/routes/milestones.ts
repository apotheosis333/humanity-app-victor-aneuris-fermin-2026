import { Router } from "express";
import { db } from "@workspace/db";
import { culturalMilestonesTable, countriesTable } from "@workspace/db";
import { CreateMilestoneBody, CreateMilestoneParams, ListMilestonesParams } from "@workspace/api-zod";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/countries/:code/milestones", async (req, res) => {
  const params = ListMilestonesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const { code } = params.data;
  const rows = await db
    .select()
    .from(culturalMilestonesTable)
    .where(eq(culturalMilestonesTable.countryCode, code))
    .orderBy(asc(culturalMilestonesTable.year));

  res.json(rows.map(mapMilestone));
});

// TODO: Replace requireAuth with admin-role enforcement before production
// content management is exposed outside trusted operators.
router.post("/countries/:code/milestones", requireAuth, async (req, res) => {
  const params = CreateMilestoneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const body = CreateMilestoneBody.safeParse(req.body);
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
    .insert(culturalMilestonesTable)
    .values({ ...body.data, countryCode: code })
    .returning();
  res.status(201).json(mapMilestone(row));
});

function mapMilestone(row: typeof culturalMilestonesTable.$inferSelect) {
  return {
    id: row.id,
    countryCode: row.countryCode,
    title: row.title,
    description: row.description,
    year: row.year ?? null,
    category: row.category ?? null,
    imageUrl: row.imageUrl ?? null,
  };
}

export default router;
