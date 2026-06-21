import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, Clock, Check, UserCheck, Loader2, MessageCircle } from "lucide-react";
import {
  useGetConnectionStatus,
  useSendConnectionRequest,
  useAcceptConnectionRequest,
  useDeleteConnectionRequest,
  useRemoveConnection,
  getGetConnectionStatusQueryKey,
  getListConnectionsQueryKey,
  getListConnectionRequestsQueryKey,
} from "@workspace/api-client-react";

const baseClass =
  "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all disabled:opacity-50";

export function ConnectButton({ userId }: { userId: string }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const qc = useQueryClient();

  const isSelf = user?.id === userId;
  const enabled = isLoaded && isSignedIn === true && !isSelf;

  const { data: status, isLoading } = useGetConnectionStatus(userId, {
    query: {
      enabled,
      queryKey: getGetConnectionStatusQueryKey(userId),
    },
  });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: getGetConnectionStatusQueryKey(userId) }),
      qc.invalidateQueries({ queryKey: getListConnectionsQueryKey() }),
      qc.invalidateQueries({ queryKey: getListConnectionRequestsQueryKey() }),
    ]);
  };

  const send = useSendConnectionRequest({ mutation: { onSuccess: invalidate } });
  const accept = useAcceptConnectionRequest({ mutation: { onSuccess: invalidate } });
  const remove = useDeleteConnectionRequest({ mutation: { onSuccess: invalidate } });
  const disconnect = useRemoveConnection({ mutation: { onSuccess: invalidate } });

  if (!enabled) return null;

  const busy =
    send.isPending || accept.isPending || remove.isPending || disconnect.isPending;

  if (isLoading || !status) {
    return (
      <span className={`${baseClass} glass border border-white/10 text-white/60`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    );
  }

  if (status.status === "connected") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/messages/${userId}`}
          className={`${baseClass} bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue`}
        >
          <MessageCircle className="h-4 w-4" />
          Message
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => disconnect.mutate({ userId })}
          className={`${baseClass} group glass border border-emerald-400/40 text-emerald-300 hover:border-red-400/50 hover:text-red-300`}
        >
          <UserCheck className="h-4 w-4 group-hover:hidden" />
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Remove</span>
        </button>
      </div>
    );
  }

  if (status.status === "pending_incoming") {
    return (
      <button
        type="button"
        disabled={busy || status.connectionId == null}
        onClick={() => status.connectionId != null && accept.mutate({ id: status.connectionId })}
        className={`${baseClass} bg-[#FBBF24] text-[#0F172A] hover:glow-gold`}
      >
        <Check className="h-4 w-4" />
        Accept request
      </button>
    );
  }

  if (status.status === "pending_outgoing") {
    return (
      <button
        type="button"
        disabled={busy || status.connectionId == null}
        onClick={() => status.connectionId != null && remove.mutate({ id: status.connectionId })}
        className={`${baseClass} group glass border border-[#FBBF24]/40 text-[#FBBF24] hover:border-red-400/50 hover:text-red-300`}
      >
        <Clock className="h-4 w-4 group-hover:hidden" />
        <span className="group-hover:hidden">Requested</span>
        <span className="hidden group-hover:inline">Cancel request</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => send.mutate({ data: { userId } })}
      className={`${baseClass} bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue`}
    >
      {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Connect
    </button>
  );
}
