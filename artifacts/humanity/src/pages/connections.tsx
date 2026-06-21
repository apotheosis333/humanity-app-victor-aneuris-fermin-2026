import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Loader2,
  LogIn,
  UserPlus,
  Clock,
  Check,
  X,
  UserCheck,
  Sparkles,
  Globe2,
  Inbox,
  MessageCircle,
} from "lucide-react";
import {
  useSearchUsers,
  useListConnections,
  useListConnectionRequests,
  useGetConnectionRecommendations,
  useSendConnectionRequest,
  useAcceptConnectionRequest,
  useDeleteConnectionRequest,
  useRemoveConnection,
  getSearchUsersQueryKey,
  getListConnectionsQueryKey,
  getListConnectionRequestsQueryKey,
  getGetConnectionRecommendationsQueryKey,
} from "@workspace/api-client-react";
import type {
  ConnectionUser,
  UserSearchResult,
  RecommendedUser,
} from "@workspace/api-client-react";

type Tab = "foryou" | "connections" | "requests" | "find";

function Avatar({ user, size = "md" }: { user: ConnectionUser | UserSearchResult | RecommendedUser; size?: "md" | "sm" }) {
  const dim = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  return (
    <div className={`${dim} shrink-0 rounded-full glass border border-[#60A5FA]/40 overflow-hidden flex items-center justify-center`}>
      {user.photoUrl ? (
        <img src={user.photoUrl} alt={user.displayName} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl font-bold text-[#FBBF24]">
          {user.displayName.trim().charAt(0).toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

function UserMeta({ user }: { user: ConnectionUser | UserSearchResult | RecommendedUser }) {
  return (
    <div className="flex-1 min-w-0">
      <Link
        href={`/profile/${user.userId}`}
        className="text-white font-semibold truncate hover:text-[#FBBF24] transition-colors block w-fit max-w-full"
      >
        {user.displayName}
      </Link>
      {user.username && <p className="text-[#60A5FA] text-xs truncate">@{user.username}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/55">
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
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">{children}</div>
  );
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

const tabClass = (active: boolean) =>
  `relative px-4 py-2 text-sm font-medium rounded-full transition-all ${
    active ? "bg-white/10 text-[#FBBF24]" : "text-white/60 hover:text-white hover:bg-white/5"
  }`;

export default function Connections() {
  const { isLoaded, isSignedIn } = useUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("foryou");

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const signedIn = isLoaded && isSignedIn === true;

  const { data: connections, isLoading: loadingConnections } = useListConnections({
    query: { enabled: signedIn, queryKey: getListConnectionsQueryKey() },
  });
  const { data: requests, isLoading: loadingRequests } = useListConnectionRequests({
    query: { enabled: signedIn, queryKey: getListConnectionRequestsQueryKey() },
  });
  const { data: results, isFetching: searching } = useSearchUsers(
    { q: search },
    { query: { enabled: signedIn && search.length > 0, queryKey: getSearchUsersQueryKey({ q: search }) } },
  );
  const { data: recommendations, isLoading: loadingRecs } =
    useGetConnectionRecommendations({
      query: {
        enabled: signedIn,
        queryKey: getGetConnectionRecommendationsQueryKey(),
      },
    });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: getListConnectionsQueryKey() }),
      qc.invalidateQueries({ queryKey: getListConnectionRequestsQueryKey() }),
      qc.invalidateQueries({
        queryKey: getGetConnectionRecommendationsQueryKey(),
      }),
      search.length > 0
        ? qc.invalidateQueries({ queryKey: getSearchUsersQueryKey({ q: search }) })
        : Promise.resolve(),
    ]);
  };

  const send = useSendConnectionRequest({ mutation: { onSuccess: invalidate } });
  const accept = useAcceptConnectionRequest({ mutation: { onSuccess: invalidate } });
  const removeReq = useDeleteConnectionRequest({ mutation: { onSuccess: invalidate } });
  const disconnect = useRemoveConnection({ mutation: { onSuccess: invalidate } });

  if (!isLoaded) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin" />
      </section>
    );
  }

  if (!signedIn) {
    return (
      <section className="w-full max-w-3xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
        <h1 className="text-3xl font-serif text-white">Sign in to find your people</h1>
        <p className="text-white/60 max-w-md">
          Human Connections let you find and connect with people from every corner of the world.
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

  const incoming = requests?.incoming ?? [];
  const outgoing = requests?.outgoing ?? [];
  const requestCount = incoming.length;

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-12 md:py-16">
      <div className="text-center mb-10 animate-fade-up">
        <span className="label-eyebrow text-[#FBBF24]/80">One Humanity</span>
        <h1 className="text-3xl md:text-5xl font-serif text-white mt-3">Human Connections</h1>
        <p className="text-white/60 mt-3 max-w-xl mx-auto">
          Find people across the world, send a connection request, and build a circle that spans nations.
        </p>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-2 mb-8 glass rounded-full p-1.5 w-fit mx-auto animate-fade-up delay-100">
        <button type="button" className={tabClass(tab === "foryou")} onClick={() => setTab("foryou")}>
          For You
        </button>
        <button type="button" className={tabClass(tab === "connections")} onClick={() => setTab("connections")}>
          Connections
        </button>
        <button type="button" className={tabClass(tab === "requests")} onClick={() => setTab("requests")}>
          Requests
          {requestCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#FBBF24] text-[#0F172A] text-[10px] font-bold">
              {requestCount}
            </span>
          )}
        </button>
        <button type="button" className={tabClass(tab === "find")} onClick={() => setTab("find")}>
          Find people
        </button>
      </div>

      <div className="space-y-3 animate-fade-up delay-200">
        {tab === "foryou" && (
          <>
            {loadingRecs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <>
                <p className="text-center text-white/50 text-sm pb-1">
                  People who share your interests, languages, and roots.
                </p>
                {recommendations.map((u) => (
                  <div key={u.userId} className="glass-panel rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <Avatar user={u} size="sm" />
                      <UserMeta user={u} />
                      <button
                        type="button"
                        disabled={send.isPending}
                        onClick={() => send.mutate({ data: { userId: u.userId } })}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue transition-all disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">Connect</span>
                      </button>
                    </div>
                    {u.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {u.reasons.map((reason, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/25 px-2.5 py-1 text-[11px] font-medium text-[#FBBF24]"
                          >
                            <Sparkles className="h-3 w-3" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No matches yet"
                body="Add interests, languages, and favorites to your profile so we can introduce you to kindred spirits across the world."
              />
            )}
          </>
        )}

        {tab === "connections" && (
          <>
            {loadingConnections ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
              </div>
            ) : connections && connections.length > 0 ? (
              connections.map((u) => (
                <Card key={u.userId}>
                  <Avatar user={u} />
                  <UserMeta user={u} />
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/messages/${u.userId}`}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue transition-all"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Message</span>
                    </Link>
                    <button
                      type="button"
                      disabled={disconnect.isPending}
                      onClick={() => disconnect.mutate({ userId: u.userId })}
                      className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold glass border border-emerald-400/40 text-emerald-300 hover:border-red-400/50 hover:text-red-300 transition-all disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4 group-hover:hidden" />
                      <X className="h-4 w-4 hidden group-hover:block" />
                      <span className="group-hover:hidden">Connected</span>
                      <span className="hidden group-hover:inline">Remove</span>
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="No connections yet"
                body="Head to Find people to search by name, username, or email and send your first request."
              />
            )}
          </>
        )}

        {tab === "requests" && (
          <>
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
              </div>
            ) : incoming.length === 0 && outgoing.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No pending requests"
                body="When someone sends you a connection request, or you send one, it will appear here."
              />
            ) : (
              <div className="space-y-6">
                {incoming.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="label-eyebrow text-[#60A5FA] px-1">Incoming</h2>
                    {incoming.map((r) => (
                      <Card key={r.id}>
                        <Avatar user={r.user} size="sm" />
                        <UserMeta user={r.user} />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={accept.isPending}
                            onClick={() => accept.mutate({ id: r.id })}
                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-[#FBBF24] text-[#0F172A] hover:glow-gold transition-all disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={removeReq.isPending}
                            onClick={() => removeReq.mutate({ id: r.id })}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-full glass border border-white/10 text-white/60 hover:text-red-300 hover:border-red-400/50 transition-all disabled:opacity-50"
                            aria-label="Decline request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                {outgoing.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="label-eyebrow text-[#60A5FA] px-1">Sent</h2>
                    {outgoing.map((r) => (
                      <Card key={r.id}>
                        <Avatar user={r.user} size="sm" />
                        <UserMeta user={r.user} />
                        <button
                          type="button"
                          disabled={removeReq.isPending}
                          onClick={() => removeReq.mutate({ id: r.id })}
                          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold glass border border-[#FBBF24]/40 text-[#FBBF24] hover:border-red-400/50 hover:text-red-300 transition-all disabled:opacity-50"
                        >
                          <Clock className="h-4 w-4 group-hover:hidden" />
                          <X className="h-4 w-4 hidden group-hover:block" />
                          <span className="group-hover:hidden">Requested</span>
                          <span className="hidden group-hover:inline">Cancel</span>
                        </button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === "find" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/30 border border-white/10 focus:border-[#60A5FA]/60 focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, @username, or email..."
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            {search.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Find people across the world"
                body="Type a name, username, or full email address to discover others and connect."
              />
            ) : searching ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 text-[#60A5FA] animate-spin" />
              </div>
            ) : results && results.length > 0 ? (
              results.map((u) => (
                <Card key={u.userId}>
                  <Avatar user={u} size="sm" />
                  <UserMeta user={u} />
                  <SearchAction
                    user={u}
                    onSend={() => send.mutate({ data: { userId: u.userId } })}
                    onAccept={() => u.connectionId != null && accept.mutate({ id: u.connectionId })}
                    onCancel={() => u.connectionId != null && removeReq.mutate({ id: u.connectionId })}
                    onRemove={() => disconnect.mutate({ userId: u.userId })}
                    busy={send.isPending || accept.isPending || removeReq.isPending || disconnect.isPending}
                  />
                </Card>
              ))
            ) : (
              <EmptyState
                icon={Search}
                title="No one found"
                body="Try a different name, username, or the exact email address."
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SearchAction({
  user,
  onSend,
  onAccept,
  onCancel,
  onRemove,
  busy,
}: {
  user: UserSearchResult;
  onSend: () => void;
  onAccept: () => void;
  onCancel: () => void;
  onRemove: () => void;
  busy: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50";

  if (user.connectionStatus === "connected") {
    return (
      <button type="button" disabled={busy} onClick={onRemove} className={`${base} group glass border border-emerald-400/40 text-emerald-300 hover:border-red-400/50 hover:text-red-300`}>
        <UserCheck className="h-4 w-4 group-hover:hidden" />
        <X className="h-4 w-4 hidden group-hover:block" />
        <span className="group-hover:hidden">Connected</span>
        <span className="hidden group-hover:inline">Remove</span>
      </button>
    );
  }
  if (user.connectionStatus === "pending_incoming") {
    return (
      <button type="button" disabled={busy} onClick={onAccept} className={`${base} bg-[#FBBF24] text-[#0F172A] hover:glow-gold`}>
        <Check className="h-4 w-4" />
        Accept
      </button>
    );
  }
  if (user.connectionStatus === "pending_outgoing") {
    return (
      <button type="button" disabled={busy} onClick={onCancel} className={`${base} group glass border border-[#FBBF24]/40 text-[#FBBF24] hover:border-red-400/50 hover:text-red-300`}>
        <Clock className="h-4 w-4 group-hover:hidden" />
        <X className="h-4 w-4 hidden group-hover:block" />
        <span className="group-hover:hidden">Requested</span>
        <span className="hidden group-hover:inline">Cancel</span>
      </button>
    );
  }
  return (
    <button type="button" disabled={busy} onClick={onSend} className={`${base} bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue`}>
      <UserPlus className="h-4 w-4" />
      Connect
    </button>
  );
}
