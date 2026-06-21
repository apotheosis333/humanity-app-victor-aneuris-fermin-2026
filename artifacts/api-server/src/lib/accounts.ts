import { clerkClient } from "@clerk/express";
import { db, accountsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

function emailFromClerk(user: {
  primaryEmailAddressId?: string | null;
  emailAddresses?: { id: string; emailAddress: string }[];
}): string | null {
  const list = user.emailAddresses ?? [];
  const primary = list.find((e) => e.id === user.primaryEmailAddressId) ?? list[0];
  return primary?.emailAddress?.toLowerCase() ?? null;
}

/**
 * Ensure an account row exists for the given Clerk userId. Idempotent and cheap
 * (no-op when the row already exists). Fire-and-forget from auth middleware so
 * it never blocks or fails a request.
 */
export function recordAccount(userId: string): void {
  db.insert(accountsTable)
    .values({ userId })
    .onConflictDoNothing()
    .catch((err) => logger.error({ err, userId }, "recordAccount failed"));
}

/**
 * Mirror every Clerk account into the local `accounts` registry (insert missing,
 * refresh email). Clerk is the source of truth; this guarantees every account is
 * accounted for so future updates/migrations can reach all of them. Paginated,
 * failure-safe.
 */
export async function syncAccountsFromClerk(): Promise<number> {
  let offset = 0;
  const limit = 100;
  let synced = 0;
  try {
    for (;;) {
      const { data } = await clerkClient.users.getUserList({ limit, offset });
      if (data.length === 0) break;
      const rows = data.map((u) => ({ userId: u.id, email: emailFromClerk(u) }));
      await db
        .insert(accountsTable)
        .values(rows)
        .onConflictDoUpdate({
          target: accountsTable.userId,
          set: { email: sql`excluded.email`, updatedAt: new Date() },
        });
      synced += rows.length;
      if (data.length < limit) break;
      offset += limit;
    }
    logger.info({ synced }, "accounts synced from Clerk");
  } catch (err) {
    logger.error({ err }, "syncAccountsFromClerk failed");
  }
  return synced;
}
