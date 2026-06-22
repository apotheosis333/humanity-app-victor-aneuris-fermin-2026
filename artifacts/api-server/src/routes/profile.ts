import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { profilesTable, countriesTable, type Profile } from "@workspace/db";
import { UpdateMyProfileBody, GetProfileParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { authWriteLimiter } from "../lib/rateLimit";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

function normalizeUsername(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

async function getClerkEmail(userId: string): Promise<string | null> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const primary =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
      user.emailAddresses[0];
    return primary?.emailAddress?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function serializeProfile(profile: Profile) {
  let countryName: string | null = null;
  let countryFlagUrl: string | null = null;
  if (profile.countryCode) {
    const [country] = await db
      .select({ name: countriesTable.name, flagUrl: countriesTable.flagUrl })
      .from(countriesTable)
      .where(eq(countriesTable.code, profile.countryCode));
    if (country) {
      countryName = country.name;
      countryFlagUrl = country.flagUrl ?? null;
    }
  }
  return {
    id: profile.id,
    userId: profile.userId,
    username: profile.username,
    displayName: profile.displayName,
    countryCode: profile.countryCode,
    countryName,
    countryFlagUrl,
    photoUrl: profile.photoUrl,
    bio: profile.bio,
    culturalBackground: profile.culturalBackground,
    languages: profile.languages,
    interests: profile.interests,
    favoriteBooks: profile.favoriteBooks,
    favoriteMusic: profile.favoriteMusic,
    profileSong: profile.profileSong,
    profileSongTitle: profile.profileSongTitle,
    profileSongArtist: profile.profileSongArtist,
    profileSongArtwork: profile.profileSongArtwork,
    profileSongPreviewUrl: profile.profileSongPreviewUrl,
    profileSongUrl: profile.profileSongUrl,
    countriesExplored: profile.countriesExplored,
    humanityScore: profile.humanityScore,
    pledged: profile.pledged,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

router.get("/me/profile", requireAuth, async (req, res) => {
  let [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, req.userId!));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  if (!profile.email) {
    const email = await getClerkEmail(req.userId!);
    if (email) {
      const [updated] = await db
        .update(profilesTable)
        .set({ email })
        .where(eq(profilesTable.userId, req.userId!))
        .returning();
      if (updated) profile = updated;
    }
  }
  res.json(await serializeProfile(profile));
});

router.put("/me/profile", requireAuth, authWriteLimiter, async (req, res) => {
  const body = UpdateMyProfileBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const username = normalizeUsername(body.data.username);
  if (username && !USERNAME_RE.test(username)) {
    res.status(400).json({
      error: "Username must be 3-20 characters: lowercase letters, numbers, or underscores.",
    });
    return;
  }
  const email = await getClerkEmail(req.userId!);
  const values = {
    username,
    ...(email ? { email } : {}),
    displayName: body.data.displayName,
    countryCode: body.data.countryCode ?? null,
    photoUrl: body.data.photoUrl ?? null,
    bio: body.data.bio ?? null,
    culturalBackground: body.data.culturalBackground ?? null,
    languages: body.data.languages ?? [],
    interests: body.data.interests ?? [],
    favoriteBooks: body.data.favoriteBooks ?? [],
    favoriteMusic: body.data.favoriteMusic ?? [],
    profileSong: body.data.profileSong ?? null,
    profileSongTitle: body.data.profileSongTitle ?? null,
    profileSongArtist: body.data.profileSongArtist ?? null,
    profileSongArtwork: body.data.profileSongArtwork ?? null,
    profileSongPreviewUrl: body.data.profileSongPreviewUrl ?? null,
    profileSongUrl: body.data.profileSongUrl ?? null,
  };
  try {
    const [profile] = await db
      .insert(profilesTable)
      .values({ userId: req.userId!, ...values })
      .onConflictDoUpdate({
        target: profilesTable.userId,
        set: values,
      })
      .returning();
    res.json(await serializeProfile(profile));
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "23505") {
      res.status(409).json({ error: "That username is already taken." });
      return;
    }
    throw err;
  }
});

router.post("/me/pledge", requireAuth, authWriteLimiter, async (req, res) => {
  const [profile] = await db
    .update(profilesTable)
    .set({ pledged: true })
    .where(eq(profilesTable.userId, req.userId!))
    .returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(await serializeProfile(profile));
});

router.get("/profile/:userId", async (req, res) => {
  const params = GetProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [profile] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.userId, params.data.userId));
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(await serializeProfile(profile));
});

export default router;
