import { Router } from "express";
import { db } from "@workspace/db";
import {
  dinnerQuestionsTable,
  dinnerAnswersTable,
  profilesTable,
  countriesTable,
  type DinnerQuestion,
} from "@workspace/db";
import { SubmitDinnerAnswerBody, SubmitDinnerAnswerParams, GetDinnerQuestionParams } from "@workspace/api-zod";
import { eq, desc, sql, lte } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

function summarizeQuestion(q: DinnerQuestion, answerCount: number) {
  return {
    id: q.id,
    question: q.question,
    theme: q.theme,
    weekStart: q.weekStart,
    answerCount,
  };
}

async function getAnswersForQuestion(questionId: number) {
  const rows = await db
    .select({
      id: dinnerAnswersTable.id,
      questionId: dinnerAnswersTable.questionId,
      answer: dinnerAnswersTable.answer,
      createdAt: dinnerAnswersTable.createdAt,
      userId: dinnerAnswersTable.userId,
      displayName: profilesTable.displayName,
      photoUrl: profilesTable.photoUrl,
      countryCode: profilesTable.countryCode,
      countryName: countriesTable.name,
      countryFlagUrl: countriesTable.flagUrl,
    })
    .from(dinnerAnswersTable)
    .leftJoin(profilesTable, eq(profilesTable.userId, dinnerAnswersTable.userId))
    .leftJoin(countriesTable, eq(countriesTable.code, profilesTable.countryCode))
    .where(eq(dinnerAnswersTable.questionId, questionId))
    .orderBy(desc(dinnerAnswersTable.createdAt));

  return rows.map((r) => ({
    id: r.id,
    questionId: r.questionId,
    answer: r.answer,
    createdAt: r.createdAt.toISOString(),
    author: {
      userId: r.userId,
      displayName: r.displayName ?? "A fellow human",
      photoUrl: r.photoUrl ?? null,
      countryCode: r.countryCode ?? null,
      countryName: r.countryName ?? null,
      countryFlagUrl: r.countryFlagUrl ?? null,
    },
  }));
}

async function buildDetail(question: DinnerQuestion, userId?: string) {
  const answers = await getAnswersForQuestion(question.id);
  const hasAnswered = userId ? answers.some((a) => a.author.userId === userId) : false;
  return {
    question: summarizeQuestion(question, answers.length),
    answers,
    totalAnswers: answers.length,
    hasAnswered,
  };
}

router.get("/dinner-table/current", optionalAuth, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const [current] = await db
    .select()
    .from(dinnerQuestionsTable)
    .where(lte(dinnerQuestionsTable.weekStart, today))
    .orderBy(desc(dinnerQuestionsTable.weekStart))
    .limit(1);

  const question =
    current ??
    (
      await db
        .select()
        .from(dinnerQuestionsTable)
        .orderBy(desc(dinnerQuestionsTable.weekStart))
        .limit(1)
    )[0];

  if (!question) {
    res.json({ question: null, answers: [], totalAnswers: 0, hasAnswered: false });
    return;
  }
  res.json(await buildDetail(question, req.userId));
});

router.get("/dinner-table/questions", async (_req, res) => {
  const rows = await db
    .select({
      id: dinnerQuestionsTable.id,
      question: dinnerQuestionsTable.question,
      theme: dinnerQuestionsTable.theme,
      weekStart: dinnerQuestionsTable.weekStart,
      answerCount: sql<number>`count(${dinnerAnswersTable.id})::int`,
    })
    .from(dinnerQuestionsTable)
    .leftJoin(dinnerAnswersTable, eq(dinnerAnswersTable.questionId, dinnerQuestionsTable.id))
    .groupBy(dinnerQuestionsTable.id)
    .orderBy(desc(dinnerQuestionsTable.weekStart));
  res.json(rows);
});

router.get("/dinner-table/questions/:id", optionalAuth, async (req, res) => {
  const params = GetDinnerQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [question] = await db
    .select()
    .from(dinnerQuestionsTable)
    .where(eq(dinnerQuestionsTable.id, params.data.id));
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(await buildDetail(question, req.userId));
});

router.post("/dinner-table/questions/:id/answers", requireAuth, authWriteLimiter, async (req, res) => {
  const params = SubmitDinnerAnswerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const body = SubmitDinnerAnswerBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const [question] = await db
    .select()
    .from(dinnerQuestionsTable)
    .where(eq(dinnerQuestionsTable.id, params.data.id));
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  let inserted: typeof dinnerAnswersTable.$inferSelect;
  try {
    inserted = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(dinnerAnswersTable)
        .values({ questionId: params.data.id, userId: req.userId!, answer: body.data.answer })
        .returning();

      await tx
        .update(profilesTable)
        .set({ humanityScore: sql`${profilesTable.humanityScore} + 10` })
        .where(eq(profilesTable.userId, req.userId!));

      return row;
    });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "23505") {
      res.status(409).json({ error: "You have already answered this question" });
      return;
    }
    throw err;
  }

  const [profile] = await db
    .select({
      displayName: profilesTable.displayName,
      photoUrl: profilesTable.photoUrl,
      countryCode: profilesTable.countryCode,
    })
    .from(profilesTable)
    .where(eq(profilesTable.userId, req.userId!));

  let countryName: string | null = null;
  let countryFlagUrl: string | null = null;
  if (profile?.countryCode) {
    const [country] = await db
      .select({ name: countriesTable.name, flagUrl: countriesTable.flagUrl })
      .from(countriesTable)
      .where(eq(countriesTable.code, profile.countryCode));
    countryName = country?.name ?? null;
    countryFlagUrl = country?.flagUrl ?? null;
  }

  res.status(201).json({
    id: inserted.id,
    questionId: inserted.questionId,
    answer: inserted.answer,
    createdAt: inserted.createdAt.toISOString(),
    author: {
      userId: req.userId!,
      displayName: profile?.displayName ?? "A fellow human",
      photoUrl: profile?.photoUrl ?? null,
      countryCode: profile?.countryCode ?? null,
      countryName,
      countryFlagUrl,
    },
  });
});

export default router;
