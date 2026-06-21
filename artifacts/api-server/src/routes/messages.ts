import { Router } from "express";
import { db } from "@workspace/db";
import {
  profilesTable,
  countriesTable,
  connectionsTable,
  messagesTable,
  type Message,
} from "@workspace/db";
import { SendMessageBody } from "@workspace/api-zod";
import { and, eq, or, asc, desc, sql, inArray, isNull } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

interface ConnectionUserDTO {
  userId: string;
  username: string | null;
  displayName: string;
  photoUrl: string | null;
  countryName: string | null;
  countryFlagUrl: string | null;
  humanityScore: number;
  pledged: boolean;
}

const CLERK_CACHE_TTL_MS = 5 * 60 * 1000;
const clerkUserCache = new Map<
  string,
  { value: ConnectionUserDTO; expires: number }
>();

function displayNameFromClerk(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (user.username) return user.username;
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress;
  if (email) return email.split("@")[0];
  return "huMANity member";
}

// Hydrate display info for a set of user ids, falling back to Clerk (and then a
// generic placeholder) for users who haven't completed onboarding, so a
// conversation is never silently dropped.
async function fetchConnectionUsers(
  userIds: string[],
): Promise<Map<string, ConnectionUserDTO>> {
  const map = new Map<string, ConnectionUserDTO>();
  if (userIds.length === 0) return map;
  const rows = await db
    .select({
      userId: profilesTable.userId,
      username: profilesTable.username,
      displayName: profilesTable.displayName,
      photoUrl: profilesTable.photoUrl,
      humanityScore: profilesTable.humanityScore,
      pledged: profilesTable.pledged,
      countryName: countriesTable.name,
      countryFlagUrl: countriesTable.flagUrl,
    })
    .from(profilesTable)
    .leftJoin(countriesTable, eq(profilesTable.countryCode, countriesTable.code))
    .where(inArray(profilesTable.userId, userIds));
  for (const row of rows) {
    map.set(row.userId, {
      userId: row.userId,
      username: row.username,
      displayName: row.displayName,
      photoUrl: row.photoUrl,
      countryName: row.countryName ?? null,
      countryFlagUrl: row.countryFlagUrl ?? null,
      humanityScore: row.humanityScore,
      pledged: row.pledged,
    });
  }

  const missing = [...new Set(userIds)].filter((id) => !map.has(id));
  if (missing.length > 0) {
    const now = Date.now();
    const uncached: string[] = [];
    for (const id of missing) {
      const cached = clerkUserCache.get(id);
      if (cached && cached.expires > now) {
        map.set(id, cached.value);
      } else {
        uncached.push(id);
      }
    }
    if (uncached.length > 0) {
      try {
        const { data } = await clerkClient.users.getUserList({
          userId: uncached,
          limit: uncached.length,
        });
        for (const u of data) {
          const dto: ConnectionUserDTO = {
            userId: u.id,
            username: u.username ?? null,
            displayName: displayNameFromClerk(u),
            photoUrl: u.imageUrl ?? null,
            countryName: null,
            countryFlagUrl: null,
            humanityScore: 0,
            pledged: false,
          };
          map.set(u.id, dto);
          clerkUserCache.set(u.id, { value: dto, expires: now + CLERK_CACHE_TTL_MS });
        }
      } catch {
        // ignore; placeholder below
      }
    }
  }

  for (const id of userIds) {
    if (!map.has(id)) {
      map.set(id, {
        userId: id,
        username: null,
        displayName: "huMANity member",
        photoUrl: null,
        countryName: null,
        countryFlagUrl: null,
        humanityScore: 0,
        pledged: false,
      });
    }
  }
  return map;
}

function serializeMessage(m: Message, me: string) {
  return {
    id: m.id,
    senderId: m.senderId,
    recipientId: m.recipientId,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    mine: m.senderId === me,
    read: m.readAt != null,
  };
}

// GET /messages — conversation list (one entry per accepted connection that has
// at least one message), ordered by most recent message, with unread counts.
router.get("/messages", requireAuth, async (req, res) => {
  const me = req.userId!;
  // Single statement: only fetch messages whose counterpart is still an
  // accepted connection. Folding the gate into the query (vs. a separate
  // prefetch) keeps list scoping consistent with one snapshot.
  const counterpart = sql`CASE WHEN ${messagesTable.senderId} = ${me} THEN ${messagesTable.recipientId} ELSE ${messagesTable.senderId} END`;
  const rows = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        or(eq(messagesTable.senderId, me), eq(messagesTable.recipientId, me)),
        sql`EXISTS (
          SELECT 1 FROM ${connectionsTable}
          WHERE ${connectionsTable.status} = 'accepted'
            AND (
              (${connectionsTable.requesterId} = ${me} AND ${connectionsTable.addresseeId} = ${counterpart})
              OR (${connectionsTable.addresseeId} = ${me} AND ${connectionsTable.requesterId} = ${counterpart})
            )
        )`,
      ),
    )
    .orderBy(desc(messagesTable.createdAt));

  const lastByOther = new Map<string, Message>();
  const unreadByOther = new Map<string, number>();
  for (const m of rows) {
    const other = m.senderId === me ? m.recipientId : m.senderId;
    if (!lastByOther.has(other)) lastByOther.set(other, m);
    if (m.recipientId === me && m.readAt == null) {
      unreadByOther.set(other, (unreadByOther.get(other) ?? 0) + 1);
    }
  }

  const otherIds = [...lastByOther.keys()];
  const users = await fetchConnectionUsers(otherIds);
  res.json(
    otherIds.map((id) => {
      const last = lastByOther.get(id)!;
      return {
        user: users.get(id)!,
        lastMessage: serializeMessage(last, me),
        unreadCount: unreadByOther.get(id) ?? 0,
      };
    }),
  );
});

// GET /messages/unread-count — total unread messages from accepted connections.
router.get("/messages/unread-count", requireAuth, async (req, res) => {
  const me = req.userId!;
  // Single statement: count only unread messages whose sender is still an
  // accepted connection, gated via EXISTS so the count is snapshot-consistent.
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.recipientId, me),
        isNull(messagesTable.readAt),
        sql`EXISTS (
          SELECT 1 FROM ${connectionsTable}
          WHERE ${connectionsTable.status} = 'accepted'
            AND (
              (${connectionsTable.requesterId} = ${me} AND ${connectionsTable.addresseeId} = ${messagesTable.senderId})
              OR (${connectionsTable.addresseeId} = ${me} AND ${connectionsTable.requesterId} = ${messagesTable.senderId})
            )
        )`,
      ),
    );
  res.json({ count: row?.count ?? 0 });
});

// GET /messages/:userId — full thread with a connection; marks their messages read.
router.get("/messages/:userId", requireAuth, async (req, res) => {
  const me = req.userId!;
  const other = String(req.params.userId);

  // Atomic: lock the accepted-connection row (FOR SHARE) for the duration of
  // the transaction so a concurrent disconnect cannot race between the gate
  // check and reading/marking the thread. If no accepted row exists, 403.
  const rows = await db.transaction(async (tx) => {
    const [conn] = await tx
      .select({ id: connectionsTable.id })
      .from(connectionsTable)
      .where(
        and(
          eq(connectionsTable.status, "accepted"),
          or(
            and(
              eq(connectionsTable.requesterId, me),
              eq(connectionsTable.addresseeId, other),
            ),
            and(
              eq(connectionsTable.requesterId, other),
              eq(connectionsTable.addresseeId, me),
            ),
          ),
        ),
      )
      .for("share");
    if (!conn) return null;

    const thread = await tx
      .select()
      .from(messagesTable)
      .where(
        or(
          and(
            eq(messagesTable.senderId, me),
            eq(messagesTable.recipientId, other),
          ),
          and(
            eq(messagesTable.senderId, other),
            eq(messagesTable.recipientId, me),
          ),
        ),
      )
      .orderBy(asc(messagesTable.createdAt));

    await tx
      .update(messagesTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messagesTable.senderId, other),
          eq(messagesTable.recipientId, me),
          isNull(messagesTable.readAt),
        ),
      );

    return thread;
  });

  if (rows === null) {
    res.status(403).json({ error: "You can only message your connections." });
    return;
  }

  const users = await fetchConnectionUsers([other]);
  res.json({
    user: users.get(other)!,
    messages: rows.map((m) => serializeMessage(m, me)),
  });
});

// POST /messages/:userId — send a message to a connection.
router.post("/messages/:userId", requireAuth, async (req, res) => {
  const me = req.userId!;
  const other = String(req.params.userId);
  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }
  const text = body.data.body.trim();
  if (text.length === 0) {
    res.status(400).json({ error: "Message cannot be empty." });
    return;
  }
  // Atomic insert guarded by the accepted-connection check, so a concurrent
  // disconnect can never let a post-removal message slip through (no TOCTOU).
  const result = await db.execute<{
    id: number;
    sender_id: string;
    recipient_id: string;
    body: string;
    created_at: Date;
    read_at: Date | null;
  }>(sql`
    INSERT INTO ${messagesTable} (sender_id, recipient_id, body)
    SELECT ${me}, ${other}, ${text}
    WHERE EXISTS (
      SELECT 1 FROM ${connectionsTable}
      WHERE ${connectionsTable.status} = 'accepted'
        AND (
          (${connectionsTable.requesterId} = ${me} AND ${connectionsTable.addresseeId} = ${other})
          OR (${connectionsTable.requesterId} = ${other} AND ${connectionsTable.addresseeId} = ${me})
        )
    )
    RETURNING id, sender_id, recipient_id, body, created_at, read_at
  `);
  const row = result.rows[0];
  if (!row) {
    res.status(403).json({ error: "You can only message your connections." });
    return;
  }
  res.status(201).json(
    serializeMessage(
      {
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        body: row.body,
        createdAt: row.created_at,
        readAt: row.read_at,
      },
      me,
    ),
  );
});

// POST /messages/:userId/read — mark a connection's messages as read.
router.post("/messages/:userId/read", requireAuth, async (req, res) => {
  const me = req.userId!;
  const other = String(req.params.userId);
  // Atomic: a single statement gates the read-mark on an accepted connection
  // and reports whether the pair is connected, so a concurrent disconnect
  // cannot slip a mark-read through after removal (no TOCTOU). 403 if not.
  const result = await db.execute<{ connected: boolean }>(sql`
    WITH conn AS (
      SELECT 1 FROM ${connectionsTable}
      WHERE ${connectionsTable.status} = 'accepted'
        AND (
          (${connectionsTable.requesterId} = ${me} AND ${connectionsTable.addresseeId} = ${other})
          OR (${connectionsTable.requesterId} = ${other} AND ${connectionsTable.addresseeId} = ${me})
        )
    ),
    upd AS (
      UPDATE ${messagesTable}
      SET read_at = now()
      WHERE sender_id = ${other}
        AND recipient_id = ${me}
        AND read_at IS NULL
        AND EXISTS (SELECT 1 FROM conn)
      RETURNING 1
    )
    SELECT EXISTS (SELECT 1 FROM conn) AS connected
  `);
  if (!result.rows[0]?.connected) {
    res.status(403).json({ error: "You can only message your connections." });
    return;
  }
  res.status(204).end();
});

export default router;
