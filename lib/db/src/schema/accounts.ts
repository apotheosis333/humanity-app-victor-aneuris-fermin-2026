import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Canonical registry of every account that has ever existed in Clerk.
// Independent of `profiles` (which is only created after onboarding), so every
// account is "accounted for" the moment it authenticates or is synced from
// Clerk — enabling future updates/migrations to reach all accounts.
export const accountsTable = pgTable("accounts", {
  userId: text("user_id").primaryKey(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Account = typeof accountsTable.$inferSelect;
