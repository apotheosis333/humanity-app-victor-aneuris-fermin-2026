import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  username: text("username").unique(),
  email: text("email"),
  displayName: text("display_name").notNull(),
  countryCode: text("country_code"),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  culturalBackground: text("cultural_background"),
  languages: text("languages").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  favoriteBooks: text("favorite_books").array().notNull().default([]),
  favoriteMusic: text("favorite_music").array().notNull().default([]),
  profileSong: text("profile_song"),
  profileSongTitle: text("profile_song_title"),
  profileSongArtist: text("profile_song_artist"),
  profileSongArtwork: text("profile_song_artwork"),
  profileSongPreviewUrl: text("profile_song_preview_url"),
  profileSongUrl: text("profile_song_url"),
  countriesExplored: text("countries_explored").array().notNull().default([]),
  humanityScore: integer("humanity_score").notNull().default(0),
  pledged: boolean("pledged").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  userId: true,
  email: true,
  humanityScore: true,
  pledged: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
