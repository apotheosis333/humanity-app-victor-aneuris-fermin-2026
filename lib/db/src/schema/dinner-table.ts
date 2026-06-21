import { pgTable, text, serial, integer, timestamp, date, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dinnerQuestionsTable = pgTable("dinner_questions", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  theme: text("theme"),
  weekStart: date("week_start", { mode: "string" }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dinnerAnswersTable = pgTable(
  "dinner_answers",
  {
    id: serial("id").primaryKey(),
    questionId: integer("question_id")
      .notNull()
      .references(() => dinnerQuestionsTable.id),
    userId: text("user_id").notNull(),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueUserQuestion: unique().on(t.userId, t.questionId),
  }),
);

export const insertDinnerQuestionSchema = createInsertSchema(dinnerQuestionsTable).omit({
  id: true,
  createdAt: true,
});
export const insertDinnerAnswerSchema = createInsertSchema(dinnerAnswersTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertDinnerQuestion = z.infer<typeof insertDinnerQuestionSchema>;
export type DinnerQuestion = typeof dinnerQuestionsTable.$inferSelect;
export type InsertDinnerAnswer = z.infer<typeof insertDinnerAnswerSchema>;
export type DinnerAnswer = typeof dinnerAnswersTable.$inferSelect;
