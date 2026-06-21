import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  Loader2,
  LogIn,
  Globe2,
  Sparkles,
  Sunrise,
  HeartHandshake,
  Heart,
  Bookmark,
  BookmarkCheck,
  Inbox,
} from "lucide-react";
import {
  useListWorldNews,
  useListSavedWorldNews,
  useReactToWorldNews,
  useRemoveWorldNewsReaction,
  useSaveWorldNews,
  useUnsaveWorldNews,
  getListWorldNewsQueryKey,
  getListSavedWorldNewsQueryKey,
} from "@workspace/api-client-react";
import type {
  WorldNewsItem,
  NewsReactionInputReaction,
} from "@workspace/api-client-react";

type Tab = "feed" | "saved";

const CATEGORIES = [
  "Science",
  "Health",
  "Environment",
  "Community",
  "Education",
  "Culture",
  "Technology",
  "Humanitarian",
] as const;

const REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Middle East",
  "Global",
] as const;

const REACTIONS: { kind: NewsReactionInputReaction; label: string; icon: React.ElementType }[] = [
  { kind: "inspired", label: "Inspired", icon: Sparkles },
  { kind: "hopeful", label: "Hopeful", icon: Sunrise },
  { kind: "grateful", label: "Grateful", icon: HeartHandshake },
  { kind: "love", label: "Love", icon: Heart },
];

const tabClass = (active: boolean) =>
  `relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
    active ? "bg-white/10 text-[#FBBF24]" : "text-white/60 hover:text-white hover:bg-white/5"
  }`;

const pillClass = (active: boolean) =>
  `px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
    active
      ? "bg-[#FBBF24]/15 border-[#FBBF24]/50 text-[#FBBF24]"
      : "glass border-white/10 text-white/60 hover:text-white hover:border-white/25"
  }`;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="glass-panel rounded-2xl py-14 px-6 flex flex-col items-center text-center gap-3">
      <span className="h-14 w-14 rounded-full glass border border-white/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-[#60A5FA]" />
      </span>
      <h3 className="text-white font-serif text-xl">{title}</h3>
      <p className="text-white/55 max-w-sm">{body}</p>
    </div>
  );
}

function NewsCard({ item, canInteract }: { item: WorldNewsItem; canInteract: boolean }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const invalidate = () =>
    qc.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && typeof q.queryKey[0] === "string" && q.queryKey[0].startsWith("/api/world-news"),
    });

  const react = useReactToWorldNews({ mutation: { onSuccess: invalidate } });
  const removeReaction = useRemoveWorldNewsReaction({ mutation: { onSuccess: invalidate } });
  const save = useSaveWorldNews({ mutation: { onSuccess: invalidate } });
  const unsave = useUnsaveWorldNews({ mutation: { onSuccess: invalidate } });

  const busy = react.isPending || removeReaction.isPending || save.isPending || unsave.isPending;

  const onReact = (kind: NewsReactionInputReaction) => {
    if (!canInteract || busy) return;
    if (item.viewerReaction === kind) {
      removeReaction.mutate({ id: item.id });
    } else {
      react.mutate({ id: item.id, data: { reaction: kind } });
    }
  };

  const onSave = () => {
    if (!canInteract || busy) return;
    if (item.saved) unsave.mutate({ id: item.id });
    else save.mutate({ id: item.id });
  };

  return (
    <article className="glass-panel rounded-2xl overflow-hidden animate-fade-up">
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" className="w-full h-44 object-cover" />
      )}
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#60A5FA]/15 border border-[#60A5FA]/30 text-[#60A5FA] font-medium">
            {item.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-white/55">
            {item.countryFlagUrl ? (
              <img src={item.countryFlagUrl} alt="" className="h-3 w-4.5 rounded-sm object-cover" />
            ) : (
              <Globe2 className="h-3.5 w-3.5 text-[#60A5FA]" />
            )}
            {item.countryName || item.region}
          </span>
          <span className="text-white/35">·</span>
          <span className="text-white/45">{formatDate(item.publishedAt)}</span>
        </div>

        <div>
          <h2 className="text-white font-serif text-xl md:text-2xl leading-snug">{item.title}</h2>
          <p className="text-white/65 mt-2 leading-relaxed">{item.summary}</p>
          {expanded && (
            <div className="text-white/70 mt-3 space-y-3 leading-relaxed">
              {item.body
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>
          )}
          {item.body.trim() && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 text-sm font-medium text-[#FBBF24] hover:text-[#FBBF24]/80 transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            {REACTIONS.map(({ kind, label, icon: Icon }) => {
              const count = item.reactionCounts[kind];
              const active = item.viewerReaction === kind;
              return (
                <button
                  key={kind}
                  onClick={() => onReact(kind)}
                  disabled={!canInteract || busy}
                  aria-label={label}
                  title={canInteract ? label : "Sign in to react"}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    active
                      ? "bg-[#FBBF24]/15 border-[#FBBF24]/50 text-[#FBBF24]"
                      : "glass border-white/10 text-white/60 hover:text-white hover:border-white/25"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} />
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={onSave}
            disabled={!canInteract || busy}
            aria-label={item.saved ? "Unsave" : "Save"}
            title={canInteract ? (item.saved ? "Saved" : "Save") : "Sign in to save"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-full text-xs font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              item.saved
                ? "bg-[#60A5FA]/15 border-[#60A5FA]/50 text-[#60A5FA]"
                : "glass border-white/10 text-white/60 hover:text-white hover:border-white/25"
            }`}
          >
            {item.saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{item.saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WorldNews() {
  const { isLoaded, isSignedIn } = useUser();
  const [tab, setTab] = useState<Tab>("feed");
  const [category, setCategory] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  const feedParams = {
    ...(category ? { category } : {}),
    ...(region ? { region } : {}),
    limit: 60,
  };
  const feed = useListWorldNews(feedParams, {
    query: { enabled: tab === "feed", queryKey: getListWorldNewsQueryKey(feedParams) },
  });

  const saved = useListSavedWorldNews({
    query: {
      enabled: tab === "saved" && isLoaded && !!isSignedIn,
      queryKey: getListSavedWorldNewsQueryKey(),
    },
  });

  const canInteract = isLoaded && !!isSignedIn;

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="text-center mb-10 animate-fade-up">
        <span className="label-eyebrow text-[#FBBF24]/80">One Earth, Many Stories</span>
        <h1 className="font-serif text-4xl md:text-5xl text-white mt-2">World News, with Hope</h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          AI-curated positive stories of progress, kindness, and human achievement from every corner of the planet.
        </p>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 mb-6 glass rounded-full p-1.5 w-fit mx-auto animate-fade-up delay-100">
        <button className={tabClass(tab === "feed")} onClick={() => setTab("feed")}>
          Feed
        </button>
        <button className={tabClass(tab === "saved")} onClick={() => setTab("saved")}>
          Saved
        </button>
      </div>

      {tab === "feed" && (
        <div className="space-y-3 mb-8 animate-fade-up delay-100">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button className={pillClass(category === null)} onClick={() => setCategory(null)}>
              All topics
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} className={pillClass(category === c)} onClick={() => setCategory(category === c ? null : c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button className={pillClass(region === null)} onClick={() => setRegion(null)}>
              All regions
            </button>
            {REGIONS.map((r) => (
              <button key={r} className={pillClass(region === r)} onClick={() => setRegion(region === r ? null : r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "feed" ? (
        feed.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
          </div>
        ) : feed.data && feed.data.length > 0 ? (
          <div className="space-y-5">
            {feed.data.map((item) => (
              <NewsCard key={item.id} item={item} canInteract={canInteract} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Newspaper}
            title="No stories yet"
            body="Fresh uplifting stories are being gathered. Check back in a little while."
          />
        )
      ) : !canInteract ? (
        <div className="glass-panel rounded-2xl py-14 px-6 flex flex-col items-center text-center gap-5">
          <span className="h-14 w-14 rounded-full glass border border-white/10 flex items-center justify-center">
            <Bookmark className="h-6 w-6 text-[#60A5FA]" />
          </span>
          <div>
            <h3 className="text-white font-serif text-xl">Sign in to save stories</h3>
            <p className="text-white/55 max-w-sm mt-1">
              Keep the stories that move you and revisit them anytime.
            </p>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FBBF24] text-[#0B1120] font-semibold hover:bg-[#FBBF24]/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      ) : saved.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
        </div>
      ) : saved.data && saved.data.length > 0 ? (
        <div className="space-y-5">
          {saved.data.map((item) => (
            <NewsCard key={item.id} item={item} canInteract={canInteract} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No saved stories"
          body="Tap Save on any story to keep it here for later."
        />
      )}
    </section>
  );
}
