import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const worldNewsTable = pgTable("world_news", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  region: text("region").notNull(),
  countryCode: text("country_code"),
  sourceName: text("source_name").notNull(),
  tone: text("tone").notNull().default("uplifting"),
  imageUrl: text("image_url"),
  batchId: text("batch_id").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsReactionsTable = pgTable(
  "news_reactions",
  {
    id: serial("id").primaryKey(),
    newsId: integer("news_id")
      .notNull()
      .references(() => worldNewsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    reaction: text("reaction").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueUserNews: unique().on(t.userId, t.newsId),
  }),
);

export const newsSavesTable = pgTable(
  "news_saves",
  {
    id: serial("id").primaryKey(),
    newsId: integer("news_id")
      .notNull()
      .references(() => worldNewsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueUserNews: unique().on(t.userId, t.newsId),
  }),
);

export const insertWorldNewsSchema = createInsertSchema(worldNewsTable).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
});
export const insertNewsReactionSchema = createInsertSchema(newsReactionsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export const insertNewsSaveSchema = createInsertSchema(newsSavesTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertWorldNews = z.infer<typeof insertWorldNewsSchema>;
export type WorldNews = typeof worldNewsTable.$inferSelect;
export type NewsReaction = typeof newsReactionsTable.$inferSelect;
export type NewsSave = typeof newsSavesTable.$inferSelect;
