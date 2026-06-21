import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Loader2,
  LogIn,
  Send,
  ArrowLeft,
  Globe2,
  Sparkles,
} from "lucide-react";
import {
  useListConversations,
  useGetMessageThread,
  useSendMessage,
  getListConversationsQueryKey,
  getGetMessageThreadQueryKey,
  getGetUnreadMessageCountQueryKey,
  ApiError,
} from "@workspace/api-client-react";
import type { ConnectionUser } from "@workspace/api-client-react";

function Avatar({ user, size = "md" }: { user: ConnectionUser; size?: "md" | "sm" }) {
  const dim = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  return (
    <div className={`${dim} shrink-0 rounded-full glass border border-[#60A5FA]/40 overflow-hidden flex items-center justify-center`}>
      {user.photoUrl ? (
        <img src={user.photoUrl} alt={user.displayName} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-[#FBBF24]">
          {user.displayName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SignInGate() {
  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
      <h1 className="text-3xl font-serif text-white">Sign in to message your connections</h1>
      <p className="text-white/60 max-w-md">
        Direct messages let you talk privately with the people you've connected with across the world.
      </p>
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

function ConversationList({ activeUserId }: { activeUserId?: string }) {
  const { data: conversations, isLoading } = useListConversations({
    query: { queryKey: getListConversationsQueryKey(), refetchInterval: 15000 },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="glass-panel rounded-2xl py-14 px-6 flex flex-col items-center text-center gap-3">
        <span className="h-14 w-14 rounded-full glass border border-white/10 flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-[#60A5FA]" />
        </span>
        <h3 className="text-white font-serif text-xl">No messages yet</h3>
        <p className="text-white/55 max-w-sm">
          You can message anyone in your Connections. Visit a connection's profile and tap Message to start a conversation.
        </p>
        <Link
          href="/connections"
          className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          Go to Connections
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((c) => {
        const active = c.user.userId === activeUserId;
        return (
          <Link
            key={c.user.userId}
            href={`/messages/${c.user.userId}`}
            className={`flex items-center gap-3 rounded-2xl p-3 transition-all ${
              active ? "bg-white/10" : "glass-panel hover:bg-white/5"
            }`}
          >
            <Avatar user={c.user} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white font-semibold truncate">{c.user.displayName}</span>
                {c.lastMessage && (
                  <span className="text-[10px] text-white/40 shrink-0">{formatTime(c.lastMessage.createdAt)}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className={`text-sm truncate ${c.unreadCount > 0 ? "text-white/90 font-medium" : "text-white/50"}`}>
                  {c.lastMessage
                    ? `${c.lastMessage.mine ? "You: " : ""}${c.lastMessage.body}`
                    : "Say hello"}
                </p>
                {c.unreadCount > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold flex items-center justify-center leading-none">
                    {c.unreadCount > 9 ? "9+" : c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function Thread({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useGetMessageThread(userId, {
    query: { queryKey: getGetMessageThreadQueryKey(userId), refetchInterval: 10000 },
  });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: getGetMessageThreadQueryKey(userId) }),
      qc.invalidateQueries({ queryKey: getListConversationsQueryKey() }),
      qc.invalidateQueries({ queryKey: getGetUnreadMessageCountQueryKey() }),
    ]);
  };

  const send = useSendMessage({ mutation: { onSuccess: invalidate } });

  const messageCount = data?.messages.length ?? 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messageCount]);

  const forbidden = error instanceof ApiError && error.status === 403;
  const otherError = error != null && !forbidden;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (body.length === 0 || send.isPending) return;
    send.mutate({ userId, data: { body } });
    setDraft("");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
      </div>
    );
  }

  if (otherError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
        <span className="h-14 w-14 rounded-full glass border border-white/10 flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-[#60A5FA]" />
        </span>
        <h3 className="text-white font-serif text-xl">Something went wrong</h3>
        <p className="text-white/55 max-w-sm">
          We couldn't load this conversation. Please try again in a moment.
        </p>
      </div>
    );
  }

  if (forbidden || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
        <span className="h-14 w-14 rounded-full glass border border-white/10 flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-[#60A5FA]" />
        </span>
        <h3 className="text-white font-serif text-xl">You can only message your connections</h3>
        <p className="text-white/55 max-w-sm">
          Connect with this person first, then you'll be able to start a conversation.
        </p>
        <Link
          href={`/profile/${userId}`}
          className="mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          View profile
        </Link>
      </div>
    );
  }

  const { user, messages } = data;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Link
          href="/messages"
          className="md:hidden h-9 w-9 rounded-full glass border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Link href={`/profile/${user.userId}`} className="flex items-center gap-3 min-w-0 group">
          <Avatar user={user} size="sm" />
          <div className="min-w-0">
            <p className="text-white font-semibold truncate group-hover:text-[#FBBF24] transition-colors">
              {user.displayName}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/50">
              {user.countryName && (
                <span className="inline-flex items-center gap-1.5">
                  {user.countryFlagUrl ? (
                    <img src={user.countryFlagUrl} alt="" className="h-3 w-4.5 rounded-sm object-cover" />
                  ) : (
                    <Globe2 className="h-3 w-3 text-[#60A5FA]" />
                  )}
                  {user.countryName}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[#FBBF24]/80">
                <Sparkles className="h-3 w-3" />
                {user.humanityScore}
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-white/50">
            <MessageCircle className="h-8 w-8 text-[#60A5FA]" />
            <p>No messages yet. Say hello to {user.displayName.split(" ")[0]}.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const prev = messages[i - 1];
            const grouped = prev && prev.mine === m.mine;
            return (
              <div
                key={m.id}
                className={`flex ${m.mine ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-3"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                    m.mine
                      ? "bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white rounded-br-md"
                      : "glass border border-white/10 text-white/90 rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <span className={`block mt-1 text-[10px] ${m.mine ? "text-white/60" : "text-white/40"}`}>
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="p-3 border-t border-white/10 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          rows={1}
          maxLength={4000}
          placeholder={`Message ${user.displayName.split(" ")[0]}...`}
          className="flex-1 resize-none glass rounded-2xl px-4 py-3 text-white placeholder:text-white/30 border border-white/10 focus:border-[#60A5FA]/60 focus:outline-none transition-colors max-h-32"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0 || send.isPending}
          className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white flex items-center justify-center hover:glow-blue transition-all disabled:opacity-40"
          aria-label="Send message"
        >
          {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

export default function Messages({ userId }: { userId?: string }) {
  const { isLoaded, isSignedIn } = useUser();
  const [, setLocation] = useLocation();
  const signedIn = isLoaded && isSignedIn === true;
  const activeUserId = useMemo(() => userId, [userId]);

  if (!isLoaded) {
    return (
      <section className="w-full max-w-5xl mx-auto px-6 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin" />
      </section>
    );
  }

  if (!signedIn) {
    return <SignInGate />;
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-3 md:px-6 py-6 md:py-10">
      <div className="hidden md:block text-center mb-8 animate-fade-up">
        <span className="label-eyebrow text-[#FBBF24]/80">One Humanity</span>
        <h1 className="text-3xl md:text-4xl font-serif text-white mt-2">Messages</h1>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden animate-fade-up h-[calc(100dvh-220px)] min-h-[480px] grid grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside
          className={`border-r border-white/10 overflow-y-auto p-3 ${
            activeUserId ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList activeUserId={activeUserId} />
        </aside>

        <div className={`min-h-0 flex flex-col ${activeUserId ? "flex" : "hidden md:flex"}`}>
          {activeUserId ? (
            <Thread key={activeUserId} userId={activeUserId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
              <span className="h-16 w-16 rounded-full glass border border-white/10 flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-[#60A5FA]" />
              </span>
              <h3 className="text-white font-serif text-xl">Your messages</h3>
              <p className="text-white/55 max-w-sm">
                Select a conversation to read and reply, or start one from a connection's profile.
              </p>
              <button
                type="button"
                onClick={() => setLocation("/connections")}
                className="mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold glass border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-all"
              >
                Go to Connections
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
