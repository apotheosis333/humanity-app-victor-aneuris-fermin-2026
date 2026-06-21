import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Direct messages between two users. A "conversation" is the unordered pair
// (senderId, recipientId) — mirroring the connections model — so no separate
// conversations table is needed. Messaging is only permitted between users with
// an accepted connection (enforced in the route layer).
export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    senderId: text("sender_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => ({
    senderIdx: index("messages_sender_idx").on(t.senderId),
    recipientIdx: index("messages_recipient_idx").on(t.recipientId),
    pairCreatedIdx: index("messages_pair_created_idx").on(
      t.senderId,
      t.recipientId,
      t.createdAt,
    ),
  }),
);

export const insertMessageSchema = createInsertSchema(messagesTable).omit({
  id: true,
  createdAt: true,
  readAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
