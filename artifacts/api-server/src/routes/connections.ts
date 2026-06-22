import { Router } from "express";
import { db } from "@workspace/db";
import {
  profilesTable,
  countriesTable,
  connectionsTable,
  blocksTable,
  type Connection,
} from "@workspace/db";
import { SendConnectionRequestBody } from "@workspace/api-zod";
import { and, eq, or, ilike, ne, inArray, desc, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

type ConnectionStatus =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "connected";

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

function blockExistsSql(me: string, other: string) {
  return sql`EXISTS (
    SELECT 1 FROM ${blocksTable}
    WHERE (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${other})
       OR (${blocksTable.blockerId} = ${other} AND ${blocksTable.blockedUserId} = ${me})
  )`;
}

async function isBlockedPair(me: string, other: string): Promise<boolean> {
  const result = await db.execute<{ blocked: boolean }>(sql`
    SELECT ${blockExistsSql(me, other)} AS blocked
  `);
  return Boolean(result.rows[0]?.blocked);
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

  // Some signed-in users haven't completed onboarding yet, so they have no
  // profile row. Enrich them from Clerk so their connection requests still
  // render (otherwise the recipient silently never sees the request). The
  // requests badge polls every 30s, so cache Clerk results briefly to avoid
  // re-hitting Clerk on every poll for the same non-onboarded users.
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
        // Clerk lookup failed; fall through to the generic placeholder below.
      }
    }
  }

  // Guarantee an entry for every requested id so a request/connection is never
  // silently dropped, even if both the profile row and Clerk lookup are absent.
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

function statusFor(conn: Connection, me: string): ConnectionStatus {
  if (conn.status === "accepted") return "connected";
  return conn.requesterId === me ? "pending_outgoing" : "pending_incoming";
}

// GET /users/search?q= — find people by name, username, or email
router.get("/users/search", requireAuth, async (req, res) => {
  const me = req.userId!;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length === 0) {
    res.json([]);
    return;
  }
  const like = `%${q}%`;
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
    .where(
      and(
        ne(profilesTable.userId, me),
        or(
          ilike(profilesTable.displayName, like),
          ilike(profilesTable.username, like),
          ilike(profilesTable.email, q),
        ),
        sql`NOT EXISTS (
          SELECT 1 FROM ${blocksTable}
          WHERE (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${profilesTable.userId})
             OR (${blocksTable.blockerId} = ${profilesTable.userId} AND ${blocksTable.blockedUserId} = ${me})
        )`,
      ),
    )
    .limit(20);

  const ids = rows.map((r) => r.userId);
  const conns =
    ids.length === 0
      ? []
      : await db
          .select()
          .from(connectionsTable)
          .where(
            or(
              and(
                eq(connectionsTable.requesterId, me),
                inArray(connectionsTable.addresseeId, ids),
              ),
              and(
                eq(connectionsTable.addresseeId, me),
                inArray(connectionsTable.requesterId, ids),
              ),
            ),
          );

  const byUser = new Map<string, Connection>();
  for (const c of conns) {
    const other = c.requesterId === me ? c.addresseeId : c.requesterId;
    byUser.set(other, c);
  }

  res.json(
    rows.map((r) => {
      const c = byUser.get(r.userId);
      return {
        userId: r.userId,
        username: r.username,
        displayName: r.displayName,
        photoUrl: r.photoUrl,
        countryName: r.countryName ?? null,
        countryFlagUrl: r.countryFlagUrl ?? null,
        humanityScore: r.humanityScore,
        pledged: r.pledged,
        connectionStatus: c ? statusFor(c, me) : "none",
        connectionId: c ? c.id : null,
      };
    }),
  );
});

// GET /connections/recommendations — interest-based suggestions
// Scores non-connected members by overlap with the viewer's profile.
router.get("/connections/recommendations", requireAuth, async (req, res) => {
  const me = req.userId!;

  const [myProfile] = await db
    .select({
      countryCode: profilesTable.countryCode,
      culturalBackground: profilesTable.culturalBackground,
      languages: profilesTable.languages,
      interests: profilesTable.interests,
      favoriteBooks: profilesTable.favoriteBooks,
      favoriteMusic: profilesTable.favoriteMusic,
    })
    .from(profilesTable)
    .where(eq(profilesTable.userId, me));

  // No profile yet (not onboarded) -> nothing to match on.
  if (!myProfile) {
    res.json([]);
    return;
  }

  // Everyone the viewer already has a connection row with (any status) is
  // excluded so recommendations never resurface existing/pending people.
  const existing = await db
    .select({
      requesterId: connectionsTable.requesterId,
      addresseeId: connectionsTable.addresseeId,
    })
    .from(connectionsTable)
    .where(
      or(
        eq(connectionsTable.requesterId, me),
        eq(connectionsTable.addresseeId, me),
      ),
    );
  const excluded = new Set<string>([me]);
  for (const c of existing) {
    excluded.add(c.requesterId === me ? c.addresseeId : c.requesterId);
  }
  const blocks = await db
    .select({ blockerId: blocksTable.blockerId, blockedUserId: blocksTable.blockedUserId })
    .from(blocksTable)
    .where(or(eq(blocksTable.blockerId, me), eq(blocksTable.blockedUserId, me)));
  for (const block of blocks) {
    excluded.add(block.blockerId === me ? block.blockedUserId : block.blockerId);
  }

  // Lowercase + trim the viewer's array attributes so prefilter and scoring
  // are both case-insensitive.
  const lc = (arr: string[] | null) =>
    [...new Set((arr ?? []).map((x) => x.trim().toLowerCase()).filter(Boolean))];
  const myInterests = lc(myProfile.interests);
  const myLanguages = lc(myProfile.languages);
  const myBooks = lc(myProfile.favoriteBooks);
  const myMusic = lc(myProfile.favoriteMusic);
  const myCulture = myProfile.culturalBackground?.trim().toLowerCase() || null;

  // Prefilter candidates to anyone sharing at least one attribute, BEFORE any
  // ranking cap, so a high-overlap but low-humanity-score person is never
  // silently dropped. The cap below then only bounds within actual matches.
  const overlapConds = [];
  if (myProfile.countryCode) {
    overlapConds.push(eq(profilesTable.countryCode, myProfile.countryCode));
  }
  if (myCulture) {
    overlapConds.push(sql`lower(${profilesTable.culturalBackground}) = ${myCulture}`);
  }
  if (myInterests.length) {
    overlapConds.push(
      sql`EXISTS (SELECT 1 FROM unnest(${profilesTable.interests}) AS v WHERE lower(v) = ANY(${myInterests}))`,
    );
  }
  if (myLanguages.length) {
    overlapConds.push(
      sql`EXISTS (SELECT 1 FROM unnest(${profilesTable.languages}) AS v WHERE lower(v) = ANY(${myLanguages}))`,
    );
  }
  if (myBooks.length) {
    overlapConds.push(
      sql`EXISTS (SELECT 1 FROM unnest(${profilesTable.favoriteBooks}) AS v WHERE lower(v) = ANY(${myBooks}))`,
    );
  }
  if (myMusic.length) {
    overlapConds.push(
      sql`EXISTS (SELECT 1 FROM unnest(${profilesTable.favoriteMusic}) AS v WHERE lower(v) = ANY(${myMusic}))`,
    );
  }

  // The viewer has no shareable attributes -> nothing to match on.
  if (overlapConds.length === 0) {
    res.json([]);
    return;
  }

  const candidates = await db
    .select({
      userId: profilesTable.userId,
      username: profilesTable.username,
      displayName: profilesTable.displayName,
      photoUrl: profilesTable.photoUrl,
      humanityScore: profilesTable.humanityScore,
      pledged: profilesTable.pledged,
      countryCode: profilesTable.countryCode,
      culturalBackground: profilesTable.culturalBackground,
      languages: profilesTable.languages,
      interests: profilesTable.interests,
      favoriteBooks: profilesTable.favoriteBooks,
      favoriteMusic: profilesTable.favoriteMusic,
      countryName: countriesTable.name,
      countryFlagUrl: countriesTable.flagUrl,
    })
    .from(profilesTable)
    .leftJoin(countriesTable, eq(profilesTable.countryCode, countriesTable.code))
    .where(and(ne(profilesTable.userId, me), or(...overlapConds)))
    .orderBy(desc(profilesTable.humanityScore))
    .limit(500);

  // Case-insensitive overlap of two string arrays; returns the candidate's
  // original casing for the values that match the viewer's.
  const overlap = (mine: string[] | null, theirs: string[] | null): string[] => {
    if (!mine?.length || !theirs?.length) return [];
    const set = new Set(mine.map((x) => x.trim().toLowerCase()));
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of theirs) {
      const key = t.trim().toLowerCase();
      if (set.has(key) && !seen.has(key)) {
        seen.add(key);
        out.push(t);
      }
    }
    return out;
  };

  const scored = candidates
    .filter((c) => !excluded.has(c.userId))
    .map((c) => {
      const sharedInterests = overlap(myProfile.interests, c.interests);
      const sharedLanguages = overlap(myProfile.languages, c.languages);
      const sharedBooks = overlap(myProfile.favoriteBooks, c.favoriteBooks);
      const sharedMusic = overlap(myProfile.favoriteMusic, c.favoriteMusic);
      const sharedCountry =
        !!myProfile.countryCode && myProfile.countryCode === c.countryCode;
      const sharedCulture =
        !!myProfile.culturalBackground &&
        myProfile.culturalBackground.trim().toLowerCase() ===
          c.culturalBackground?.trim().toLowerCase();

      const matchScore =
        sharedInterests.length * 3 +
        sharedLanguages.length * 2 +
        sharedBooks.length * 2 +
        sharedMusic.length * 2 +
        (sharedCountry ? 2 : 0) +
        (sharedCulture ? 2 : 0);

      const reasons: string[] = [];
      if (sharedInterests.length > 0) {
        reasons.push(
          `${sharedInterests.length} shared ${sharedInterests.length === 1 ? "interest" : "interests"}`,
        );
      }
      if (sharedLanguages.length > 0) {
        reasons.push(`Speaks ${sharedLanguages.join(", ")}`);
      }
      if (sharedCountry && c.countryName) {
        reasons.push(`Both from ${c.countryName}`);
      }
      if (sharedCulture && c.culturalBackground) {
        reasons.push(`Shared heritage: ${c.culturalBackground}`);
      }
      if (sharedBooks.length > 0) {
        reasons.push(
          `Enjoys ${sharedBooks.length === 1 ? "a book" : "books"} you love`,
        );
      }
      if (sharedMusic.length > 0) {
        reasons.push(`Listens to music you love`);
      }

      return {
        userId: c.userId,
        username: c.username,
        displayName: c.displayName,
        photoUrl: c.photoUrl,
        countryName: c.countryName ?? null,
        countryFlagUrl: c.countryFlagUrl ?? null,
        humanityScore: c.humanityScore,
        pledged: c.pledged,
        matchScore,
        sharedInterests,
        sharedLanguages,
        sharedCountry,
        reasons,
      };
    })
    .filter((c) => c.matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore || b.humanityScore - a.humanityScore,
    )
    .slice(0, 12);

  res.json(scored);
});

// GET /connections — accepted connections
router.get("/connections", requireAuth, async (req, res) => {
  const me = req.userId!;
  const conns = await db
    .select()
    .from(connectionsTable)
    .where(
      and(
        eq(connectionsTable.status, "accepted"),
        or(
          eq(connectionsTable.requesterId, me),
          eq(connectionsTable.addresseeId, me),
        ),
        sql`NOT EXISTS (
          SELECT 1 FROM ${blocksTable}
          WHERE (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${connectionsTable.requesterId})
             OR (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${connectionsTable.addresseeId})
             OR (${blocksTable.blockedUserId} = ${me} AND ${blocksTable.blockerId} = ${connectionsTable.requesterId})
             OR (${blocksTable.blockedUserId} = ${me} AND ${blocksTable.blockerId} = ${connectionsTable.addresseeId})
        )`,
      ),
    );
  const otherIds = conns.map((c) => (c.requesterId === me ? c.addresseeId : c.requesterId));
  const users = await fetchConnectionUsers(otherIds);
  res.json(otherIds.map((id) => users.get(id)).filter((u): u is ConnectionUserDTO => !!u));
});

// GET /connections/requests — pending incoming + outgoing
router.get("/connections/requests", requireAuth, async (req, res) => {
  const me = req.userId!;
  const conns = await db
    .select()
    .from(connectionsTable)
    .where(
      and(
        eq(connectionsTable.status, "pending"),
        or(
          eq(connectionsTable.requesterId, me),
          eq(connectionsTable.addresseeId, me),
        ),
        sql`NOT EXISTS (
          SELECT 1 FROM ${blocksTable}
          WHERE (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${connectionsTable.requesterId})
             OR (${blocksTable.blockerId} = ${me} AND ${blocksTable.blockedUserId} = ${connectionsTable.addresseeId})
             OR (${blocksTable.blockedUserId} = ${me} AND ${blocksTable.blockerId} = ${connectionsTable.requesterId})
             OR (${blocksTable.blockedUserId} = ${me} AND ${blocksTable.blockerId} = ${connectionsTable.addresseeId})
        )`,
      ),
    );
  const incoming = conns.filter((c) => c.addresseeId === me);
  const outgoing = conns.filter((c) => c.requesterId === me);
  const users = await fetchConnectionUsers([
    ...incoming.map((c) => c.requesterId),
    ...outgoing.map((c) => c.addresseeId),
  ]);
  const toItem = (c: Connection, otherId: string) => {
    const user = users.get(otherId);
    if (!user) return null;
    return { id: c.id, createdAt: c.createdAt.toISOString(), user };
  };
  res.json({
    incoming: incoming
      .map((c) => toItem(c, c.requesterId))
      .filter((x): x is NonNullable<typeof x> => !!x),
    outgoing: outgoing
      .map((c) => toItem(c, c.addresseeId))
      .filter((x): x is NonNullable<typeof x> => !!x),
  });
});

// POST /connections/requests — send a request
router.post("/connections/requests", requireAuth, authWriteLimiter, async (req, res) => {
  const me = req.userId!;
  const body = SendConnectionRequestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const target = body.data.userId;
  if (target === me) {
    res.status(400).json({ error: "You cannot connect with yourself." });
    return;
  }
  if (await isBlockedPair(me, target)) {
    res.status(403).json({ error: "Connection unavailable." });
    return;
  }
  const [targetProfile] = await db
    .select({ userId: profilesTable.userId })
    .from(profilesTable)
    .where(eq(profilesTable.userId, target));
  if (!targetProfile) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const pairFilter = or(
    and(
      eq(connectionsTable.requesterId, me),
      eq(connectionsTable.addresseeId, target),
    ),
    and(
      eq(connectionsTable.requesterId, target),
      eq(connectionsTable.addresseeId, me),
    ),
  );

  // Resolve the existing pair row (if any) into a final state. The unordered
  // unique index guarantees at most one row per pair, so reads are deterministic.
  const resolveExisting = async (
    existing: Connection,
  ): Promise<{ status: ConnectionStatus; connectionId: number }> => {
    if (existing.status === "accepted") {
      return { status: "connected", connectionId: existing.id };
    }
    // They already requested me -> accept it (mutual intent).
    if (existing.addresseeId === me) {
      const [updated] = await db
        .update(connectionsTable)
        .set({ status: "accepted", respondedAt: new Date() })
        .where(eq(connectionsTable.id, existing.id))
        .returning();
      return { status: "connected", connectionId: updated.id };
    }
    // I already have an outgoing pending request.
    return { status: "pending_outgoing", connectionId: existing.id };
  };

  const [existing] = await db.select().from(connectionsTable).where(pairFilter);
  if (existing) {
    const result = await resolveExisting(existing);
    res.status(201).json(result);
    return;
  }

  try {
    const [created] = await db
      .insert(connectionsTable)
      .values({ requesterId: me, addresseeId: target, status: "pending" })
      .returning();
    res.status(201).json({ status: "pending_outgoing", connectionId: created.id });
  } catch (err) {
    // A concurrent request (in either direction) won the unique-pair index.
    // Re-read the now-existing row and resolve it (auto-accepts a reverse request).
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      const [again] = await db.select().from(connectionsTable).where(pairFilter);
      if (again) {
        const result = await resolveExisting(again);
        res.status(201).json(result);
        return;
      }
    }
    throw err;
  }
});

// POST /connections/requests/:id/accept
router.post("/connections/requests/:id/accept", requireAuth, async (req, res) => {
  const me = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  const [conn] = await db
    .select()
    .from(connectionsTable)
    .where(
      and(
        eq(connectionsTable.id, id),
        eq(connectionsTable.addresseeId, me),
        eq(connectionsTable.status, "pending"),
      ),
    );
  if (!conn) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  const [updated] = await db
    .update(connectionsTable)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(eq(connectionsTable.id, id))
    .returning();
  res.json({ status: "connected", connectionId: updated.id });
});

// DELETE /connections/requests/:id — decline incoming or cancel outgoing
router.delete("/connections/requests/:id", requireAuth, async (req, res) => {
  const me = req.userId!;
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  const deleted = await db
    .delete(connectionsTable)
    .where(
      and(
        eq(connectionsTable.id, id),
        eq(connectionsTable.status, "pending"),
        or(
          eq(connectionsTable.requesterId, me),
          eq(connectionsTable.addresseeId, me),
        ),
      ),
    )
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.status(204).end();
});

// GET /connections/status/:userId
router.get("/connections/status/:userId", requireAuth, async (req, res) => {
  const me = req.userId!;
  const other = String(req.params.userId);
  if (other === me) {
    res.json({ status: "none", connectionId: null });
    return;
  }
  if (await isBlockedPair(me, other)) {
    res.json({ status: "none", connectionId: null });
    return;
  }
  const [conn] = await db
    .select()
    .from(connectionsTable)
    .where(
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
    );
  res.json({
    status: conn ? statusFor(conn, me) : "none",
    connectionId: conn ? conn.id : null,
  });
});

// DELETE /connections/:userId — remove an accepted connection
router.delete("/connections/:userId", requireAuth, async (req, res) => {
  const me = req.userId!;
  const other = String(req.params.userId);
  const deleted = await db
    .delete(connectionsTable)
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
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Connection not found" });
    return;
  }
  res.status(204).end();
});

export default router;
