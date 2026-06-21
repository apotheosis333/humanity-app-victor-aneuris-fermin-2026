import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const countriesTable = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  continent: text("continent").notNull(),
  region: text("region"),
  capital: text("capital"),
  flagUrl: text("flag_url"),
  coverImageUrl: text("cover_image_url"),
  summary: text("summary"),
  population: integer("population"),
  areaKm2: integer("area_km2"),
  languages: text("languages"),
  currency: text("currency"),
  governmentType: text("government_type"),
  religion: text("religion"),
  featured: boolean("featured").notNull().default(false),
});

export const timelineEventsTable = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countriesTable.code),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  category: text("category"),
});

export const culturalMilestonesTable = pgTable("cultural_milestones", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countriesTable.code),
  title: text("title").notNull(),
  description: text("description").notNull(),
  year: integer("year"),
  category: text("category"),
  imageUrl: text("image_url"),
});

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countriesTable.code),
  title: text("title").notNull(),
  author: text("author"),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const countryPhrasesTable = pgTable("country_phrases", {
  id: serial("id").primaryKey(),
  countryCode: text("country_code").notNull().references(() => countriesTable.code),
  languageName: text("language_name").notNull(),
  hello: text("hello"),
  helloRomanized: text("hello_romanized"),
  thankYou: text("thank_you"),
  thankYouRomanized: text("thank_you_romanized"),
  peace: text("peace"),
  peaceRomanized: text("peace_romanized"),
  friendship: text("friendship"),
  friendshipRomanized: text("friendship_romanized"),
  love: text("love"),
  loveRomanized: text("love_romanized"),
  welcome: text("welcome"),
  welcomeRomanized: text("welcome_romanized"),
});

export const humanityPledgesTable = pgTable("humanity_pledges", {
  id: serial("id").primaryKey(),
  name: text("name"),
  country: text("country"),
  pledgedAt: timestamp("pledged_at").notNull().defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countriesTable).omit({ id: true });
export const insertTimelineEventSchema = createInsertSchema(timelineEventsTable).omit({ id: true });
export const insertMilestoneSchema = createInsertSchema(culturalMilestonesTable).omit({ id: true });
export const insertStorySchema = createInsertSchema(storiesTable).omit({ id: true, createdAt: true });
export const insertPledgeSchema = createInsertSchema(humanityPledgesTable).omit({ id: true, pledgedAt: true });

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countriesTable.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEventsTable.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type CulturalMilestone = typeof culturalMilestonesTable.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;
export type CountryPhrase = typeof countryPhrasesTable.$inferSelect;
export type HumanityPledge = typeof humanityPledgesTable.$inferSelect;
