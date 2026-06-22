import { Link } from "wouter";
import { Heart, Globe2, Music2, BookOpen, Languages, Sparkles, Pencil } from "lucide-react";
import type { Profile } from "@workspace/api-client-react";
import { PlayPreviewButton } from "./song-preview";

function Initial({ name }: { name: string }) {
  return (
    <span className="text-4xl font-bold text-[#FBBF24]">
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function ChipGroup({
  icon: Icon,
  label,
  items,
}: {
  icon: React.ElementType;
  label: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 label-eyebrow text-[#60A5FA]">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="glass rounded-full px-3 py-1 text-sm text-white/85 border border-white/10"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProfileCard({
  profile,
  isOwn,
  action,
}: {
  profile: Profile;
  isOwn?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div className="glass-panel rounded-3xl p-5 sm:p-6 md:p-10 glow-blue/30">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          <div className="relative shrink-0">
            <div className="h-28 w-28 rounded-full glass border border-[#60A5FA]/40 overflow-hidden flex items-center justify-center glow-blue">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <Initial name={profile.displayName} />
              )}
            </div>
            {profile.pledged && (
              <span
                title="Humanity Pledge taken"
                className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-[#FBBF24] text-[#0F172A] flex items-center justify-center glow-gold"
              >
                <Heart className="h-4 w-4 fill-current" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-serif text-white">{profile.displayName}</h1>
                {profile.username && (
                  <p className="text-[#60A5FA] text-sm font-medium">@{profile.username}</p>
                )}
              </div>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 self-center md:w-auto md:justify-end md:self-auto">
                {action}
                {isOwn && (
                  <Link
                    href="/profile/edit"
                    className="inline-flex min-h-11 items-center justify-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/80 hover:text-white border border-white/10 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-white/70">
              {profile.countryName && (
                <span className="inline-flex items-center gap-2">
                  {profile.countryFlagUrl ? (
                    <img src={profile.countryFlagUrl} alt="" className="h-4 w-6 rounded-sm object-cover" />
                  ) : (
                    <Globe2 className="h-4 w-4 text-[#60A5FA]" />
                  )}
                  {profile.countryName}
                </span>
              )}
              <span className="inline-flex items-center gap-2 text-[#FBBF24]">
                <Sparkles className="h-4 w-4" />
                Humanity Score {profile.humanityScore}
              </span>
            </div>

            {profile.bio && <p className="text-white/80 leading-relaxed max-w-2xl">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {(profile.profileSongTitle || profile.profileSong) && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 md:p-7">
          <div className="flex items-center gap-2 label-eyebrow text-[#FBBF24] mb-4">
            <Music2 className="h-3.5 w-3.5" />
            <span>Profile song</span>
          </div>
          {profile.profileSongTitle ? (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-[#FBBF24]/30">
                {profile.profileSongArtwork ? (
                  <img src={profile.profileSongArtwork} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music2 className="h-6 w-6 text-[#FBBF24]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{profile.profileSongTitle}</p>
                <p className="text-white/60 text-sm truncate">{profile.profileSongArtist}</p>
              </div>
              {profile.profileSongPreviewUrl && (
                <PlayPreviewButton url={profile.profileSongPreviewUrl} />
              )}
            </div>
          ) : (
            <p className="text-white/80">{profile.profileSong}</p>
          )}
        </div>
      )}

      {(profile.culturalBackground ||
        profile.languages.length > 0 ||
        profile.interests.length > 0 ||
        profile.favoriteBooks.length > 0 ||
        profile.favoriteMusic.length > 0) && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 md:p-10 space-y-8">
          {profile.culturalBackground && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 label-eyebrow text-[#60A5FA]">
                <Globe2 className="h-3.5 w-3.5" />
                <span>Cultural background</span>
              </div>
              <p className="text-white/80 leading-relaxed">{profile.culturalBackground}</p>
            </div>
          )}

          <ChipGroup icon={Languages} label="Languages" items={profile.languages} />
          <ChipGroup icon={Sparkles} label="Interests" items={profile.interests} />
          <ChipGroup icon={BookOpen} label="Favorite books" items={profile.favoriteBooks} />
          <ChipGroup icon={Music2} label="Favorite music" items={profile.favoriteMusic} />
        </div>
      )}
    </div>
  );
}
