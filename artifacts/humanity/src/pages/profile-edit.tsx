import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, Check, X, Search, Globe2, Upload, Trash2, Music2 } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import {
  useGetMyProfile,
  useUpdateMyProfile,
  useSearchCountries,
  useSearchMusic,
  getGetMyProfileQueryKey,
  getSearchCountriesQueryKey,
  getSearchMusicQueryKey,
  ApiError,
} from "@workspace/api-client-react";
import { PlayPreviewButton } from "../components/song-preview";
import { apiUrl } from "@/lib/api-config";

const toArray = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface SelectedSong {
  title: string;
  artist: string;
  artwork: string | null;
  previewUrl: string | null;
  trackUrl: string | null;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="label-eyebrow text-[#60A5FA] block">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/30 border border-white/10 focus:border-[#60A5FA]/60 focus:outline-none transition-colors";

export default function ProfileEdit() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useGetMyProfile({
    query: { enabled: isLoaded && isSignedIn === true, retry: false, queryKey: getGetMyProfileQueryKey() },
  });

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryLabel, setCountryLabel] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [culturalBackground, setCulturalBackground] = useState("");
  const [languages, setLanguages] = useState("");
  const [interests, setInterests] = useState("");
  const [favoriteBooks, setFavoriteBooks] = useState("");
  const [favoriteMusic, setFavoriteMusic] = useState("");
  const [song, setSong] = useState<SelectedSong | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    basePath: apiUrl("/api/storage"),
    onSuccess: async (res) => {
      try {
        const finalizeRes = await fetch(apiUrl("/api/storage/uploads/finalize"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectPath: res.objectPath }),
        });
        if (!finalizeRes.ok) throw new Error("finalize failed");
        const data: { objectPath: string } = await finalizeRes.json();
        setPhotoUrl(apiUrl(`/api/storage${data.objectPath}`));
        setPhotoError(null);
      } catch {
        setPhotoError("Upload failed. Please try again.");
      }
    },
    onError: () => setPhotoError("Upload failed. Please try again."),
  });

  const [countryQuery, setCountryQuery] = useState("");
  const { data: countryResults } = useSearchCountries(
    { q: countryQuery },
    { query: { enabled: countryQuery.trim().length > 0, queryKey: getSearchCountriesQueryKey({ q: countryQuery }) } },
  );

  const [songQuery, setSongQuery] = useState("");
  const [songSearch, setSongSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSongSearch(songQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [songQuery]);
  const { data: songResults, isFetching: songSearching } = useSearchMusic(
    { q: songSearch },
    { query: { enabled: songSearch.length > 0, queryKey: getSearchMusicQueryKey({ q: songSearch }) } },
  );

  const update = useUpdateMyProfile();

  useEffect(() => {
    if (prefilled) return;
    if (profile) {
      setDisplayName(profile.displayName);
      setUsername(profile.username ?? "");
      setCountryCode(profile.countryCode ?? null);
      setCountryLabel(profile.countryName ?? "");
      setPhotoUrl(profile.photoUrl ?? null);
      setBio(profile.bio ?? "");
      setCulturalBackground(profile.culturalBackground ?? "");
      setLanguages(profile.languages.join(", "));
      setInterests(profile.interests.join(", "));
      setFavoriteBooks(profile.favoriteBooks.join(", "));
      setFavoriteMusic(profile.favoriteMusic.join(", "));
      if (profile.profileSongTitle && profile.profileSongArtist) {
        setSong({
          title: profile.profileSongTitle,
          artist: profile.profileSongArtist,
          artwork: profile.profileSongArtwork ?? null,
          previewUrl: profile.profileSongPreviewUrl ?? null,
          trackUrl: profile.profileSongUrl ?? null,
        });
      }
      setPrefilled(true);
    } else if (isLoaded && user && !displayName) {
      setDisplayName(user.fullName ?? user.firstName ?? "");
    }
  }, [profile, isLoaded, user, prefilled, displayName]);

  if (!isLoaded || (isSignedIn && isLoading)) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin" />
      </section>
    );
  }

  if (!isSignedIn) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-3xl font-serif text-white">Sign in to build your profile</h1>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white rounded-full px-6 py-3 font-semibold hover:glow-blue transition-all"
        >
          <LogIn className="h-4 w-4" />
          Sign in
        </Link>
      </section>
    );
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPhotoError("Image must be 5 MB or smaller.");
      return;
    }
    setPhotoError(null);
    void uploadFile(file);
  };

  const selectSong = (track: {
    title: string;
    artist: string;
    artwork?: string | null;
    previewUrl?: string | null;
    trackUrl?: string | null;
  }) => {
    setSong({
      title: track.title,
      artist: track.artist,
      artwork: track.artwork ?? null,
      previewUrl: track.previewUrl ?? null,
      trackUrl: track.trackUrl ?? null,
    });
    setSongQuery("");
    setSongSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await update.mutateAsync({
      data: {
        displayName: displayName.trim(),
        username: username.trim() ? username.trim().toLowerCase() : null,
        countryCode,
        photoUrl: photoUrl || null,
        bio: bio.trim() || null,
        culturalBackground: culturalBackground.trim() || null,
        languages: toArray(languages),
        interests: toArray(interests),
        favoriteBooks: toArray(favoriteBooks),
        favoriteMusic: toArray(favoriteMusic),
        profileSong: song ? `${song.title} — ${song.artist}` : null,
        profileSongTitle: song?.title ?? null,
        profileSongArtist: song?.artist ?? null,
        profileSongArtwork: song?.artwork ?? null,
        profileSongPreviewUrl: song?.previewUrl ?? null,
        profileSongUrl: song?.trackUrl ?? null,
      },
    });
    await qc.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
    setLocation("/profile");
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="text-center mb-10 animate-fade-up">
        <span className="label-eyebrow text-[#FBBF24]/80">Your story</span>
        <h1 className="text-3xl md:text-5xl font-serif text-white mt-3">
          {profile ? "Edit your profile" : "Create your profile"}
        </h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          Share what makes your world unique. Everything here helps others meet the human behind the nation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 md:p-10 space-y-7 animate-fade-up delay-100">
        <Field label="Profile picture" hint="JPG, PNG, or WEBP. Up to 5 MB.">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full glass border border-[#60A5FA]/40 overflow-hidden flex items-center justify-center glow-blue/40">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[#FBBF24]">
                    {displayName.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-[#0F172A]/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-[#60A5FA] animate-spin" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/85 border border-white/10 hover:border-[#60A5FA]/60 transition-colors disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {photoUrl ? "Replace photo" : "Upload photo"}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-red-400 transition-colors px-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
          {photoError && <p className="text-xs text-red-400 mt-2">{photoError}</p>}
        </Field>

        <Field label="Display name">
          <input
            className={inputClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should the world know you?"
            required
          />
        </Field>

        <Field
          label="Username"
          hint="3-20 characters: lowercase letters, numbers, or underscores. Lets others find and connect with you."
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">@</span>
            <input
              className={`${inputClass} pl-9`}
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              placeholder="your_handle"
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          {username.length > 0 && username.length < 3 && (
            <p className="text-xs text-amber-400 mt-1">Username must be at least 3 characters.</p>
          )}
        </Field>

        <Field label="Country" hint="Search and select your country.">
          {countryCode ? (
            <div className="flex items-center justify-between glass rounded-xl px-4 py-3 border border-[#60A5FA]/40">
              <span className="inline-flex items-center gap-2 text-white">
                <Globe2 className="h-4 w-4 text-[#60A5FA]" />
                {countryLabel}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCountryCode(null);
                  setCountryLabel("");
                }}
                className="text-white/50 hover:text-white"
                aria-label="Clear country"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                className={`${inputClass} pl-11`}
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Start typing a country name..."
              />
              {countryQuery.trim().length > 0 && countryResults && countryResults.length > 0 && (
                <div className="absolute z-20 mt-2 w-full glass-strong rounded-xl border border-white/10 max-h-64 overflow-auto shadow-2xl">
                  {countryResults.slice(0, 30).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountryCode(c.code);
                        setCountryLabel(c.name);
                        setCountryQuery("");
                      }}
                      className="w-full text-left px-4 py-2.5 text-white/85 hover:bg-white/10 flex items-center gap-3"
                    >
                      {c.flagUrl && <img src={c.flagUrl} alt="" className="h-4 w-6 rounded-sm object-cover" />}
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Field>

        <Field label="Profile song" hint="Search a song that represents you. Powered by Apple Music.">
          {song ? (
            <div className="flex items-center gap-4 glass rounded-2xl p-4 border border-[#FBBF24]/40 glow-gold/30">
              <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                {song.artwork ? (
                  <img src={song.artwork} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music2 className="h-6 w-6 text-[#FBBF24]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{song.title}</p>
                <p className="text-white/60 text-sm truncate">{song.artist}</p>
              </div>
              {song.previewUrl && <PlayPreviewButton url={song.previewUrl} size="sm" />}
              <button
                type="button"
                onClick={() => setSong(null)}
                className="text-white/50 hover:text-red-400 transition-colors"
                aria-label="Remove song"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                className={`${inputClass} pl-11`}
                value={songQuery}
                onChange={(e) => setSongQuery(e.target.value)}
                placeholder="Search for a song or artist..."
              />
              {songSearch.length > 0 && (
                <div className="absolute z-20 mt-2 w-full glass-strong rounded-xl border border-white/10 max-h-80 overflow-auto shadow-2xl">
                  {songSearching && (
                    <div className="px-4 py-4 flex items-center gap-2 text-white/50 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                    </div>
                  )}
                  {!songSearching && songResults && songResults.length === 0 && (
                    <div className="px-4 py-4 text-white/50 text-sm">No songs found.</div>
                  )}
                  {songResults?.map((track) => (
                    <div
                      key={track.id}
                      className="w-full px-3 py-2.5 hover:bg-white/10 flex items-center gap-3"
                    >
                      <div className="h-11 w-11 shrink-0 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
                        {track.artwork ? (
                          <img src={track.artwork} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Music2 className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => selectSong(track)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-white/90 text-sm truncate">{track.title}</p>
                        <p className="text-white/50 text-xs truncate">{track.artist}</p>
                      </button>
                      {track.previewUrl && <PlayPreviewButton url={track.previewUrl} size="sm" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Field>

        <Field label="Bio">
          <textarea
            className={`${inputClass} min-h-[110px] resize-y`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A few sentences about who you are."
          />
        </Field>

        <Field label="Cultural background">
          <textarea
            className={`${inputClass} min-h-[90px] resize-y`}
            value={culturalBackground}
            onChange={(e) => setCulturalBackground(e.target.value)}
            placeholder="Your heritage, traditions, the cultures that shaped you."
          />
        </Field>

        <Field label="Languages" hint="Separate with commas.">
          <input
            className={inputClass}
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="English, Yoruba, French"
          />
        </Field>

        <Field label="Interests" hint="Separate with commas.">
          <input
            className={inputClass}
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Cooking, astronomy, football"
          />
        </Field>

        <Field label="Favorite books" hint="Separate with commas.">
          <input
            className={inputClass}
            value={favoriteBooks}
            onChange={(e) => setFavoriteBooks(e.target.value)}
            placeholder="Things Fall Apart, The Alchemist"
          />
        </Field>

        <Field label="Favorite music" hint="Separate with commas.">
          <input
            className={inputClass}
            value={favoriteMusic}
            onChange={(e) => setFavoriteMusic(e.target.value)}
            placeholder="Fela Kuti, Bach, Tinariwen"
          />
        </Field>

        {update.isError && (
          <p className="text-sm text-red-400">
            {update.error instanceof ApiError && update.error.status === 409
              ? "That username is already taken. Please choose another."
              : update.error instanceof ApiError && update.error.status === 400
                ? "Username must be 3-20 characters: lowercase letters, numbers, or underscores."
                : "Something went wrong saving your profile. Please try again."}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={update.isPending || isUploading || !displayName.trim()}
            className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#0F172A] rounded-full px-6 py-3 font-semibold hover:glow-gold transition-all disabled:opacity-50"
          >
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save profile
          </button>
          <Link href="/profile" className="text-white/60 hover:text-white px-4 py-3 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
