import { useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Flag, ShieldOff, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/70 border border-white/10 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50";

async function authedJson(
  getToken: () => Promise<string | null>,
  path: string,
  init: RequestInit,
) {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Request failed with ${response.status}`);
  return response;
}

export function ReportBlockControls({ userId }: { userId: string }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState<"report" | "block" | null>(null);
  const [blocked, setBlocked] = useState(false);

  if (!isLoaded || !isSignedIn || user?.id === userId || blocked) return null;

  const report = async () => {
    const details = window.prompt("Briefly describe what should be reviewed.");
    if (details == null) return;
    setBusy("report");
    try {
      await authedJson(getToken, "/api/reports", {
        method: "POST",
        body: JSON.stringify({
          targetType: "user",
          targetId: userId,
          reason: "other",
          details,
        }),
      });
      toast({ title: "Report submitted" });
    } catch {
      toast({ title: "Report failed", description: "Please try again." });
    } finally {
      setBusy(null);
    }
  };

  const block = async () => {
    if (!window.confirm("Block this member? Existing connections will be removed.")) return;
    setBusy("block");
    try {
      await authedJson(getToken, "/api/blocks", {
        method: "POST",
        body: JSON.stringify({ blockedUserId: userId }),
      });
      setBlocked(true);
      toast({ title: "Member blocked" });
    } catch {
      toast({ title: "Block failed", description: "Please try again." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={report} disabled={busy != null} className={buttonClass}>
        {busy === "report" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
        Report
      </button>
      <button type="button" onClick={block} disabled={busy != null} className={buttonClass}>
        {busy === "block" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
        Block
      </button>
    </div>
  );
}
