import { pgTable, text, serial, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reporterId: text("reporter_id").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    reporterIdx: index("reports_reporter_idx").on(t.reporterId),
    targetIdx: index("reports_target_idx").on(t.targetType, t.targetId),
    statusIdx: index("reports_status_idx").on(t.status),
  }),
);

export const blocksTable = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    blockerId: text("blocker_id").notNull(),
    blockedUserId: text("blocked_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueBlock: uniqueIndex("blocks_unique_pair_idx").on(t.blockerId, t.blockedUserId),
    blockerIdx: index("blocks_blocker_idx").on(t.blockerId),
    blockedIdx: index("blocks_blocked_idx").on(t.blockedUserId),
  }),
);

export const accountDeletionRequestsTable = pgTable(
  "account_deletion_requests",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    reason: text("reason"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    userIdx: index("account_deletion_requests_user_idx").on(t.userId),
    statusIdx: index("account_deletion_requests_status_idx").on(t.status),
  }),
);

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  reporterId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
export type Block = typeof blocksTable.$inferSelect;
export type AccountDeletionRequest = typeof accountDeletionRequestsTable.$inferSelect;
