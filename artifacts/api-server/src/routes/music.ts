import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface ITunesResult {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl?: string;
}

router.get("/music/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    res.status(400).json({ error: "Missing query" });
    return;
  }

  try {
    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", q);
    url.searchParams.set("media", "music");
    url.searchParams.set("entity", "song");
    url.searchParams.set("limit", "20");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      req.log.error({ status: response.status }, "iTunes search failed");
      res.status(502).json({ error: "Music search is unavailable" });
      return;
    }

    const data = (await response.json()) as { results?: ITunesResult[] };
    const tracks = (data.results ?? [])
      .filter((r) => r.trackId && r.trackName && r.artistName)
      .map((r) => ({
        id: String(r.trackId),
        title: r.trackName!,
        artist: r.artistName!,
        artwork: r.artworkUrl100
          ? r.artworkUrl100.replace("100x100bb", "300x300bb")
          : null,
        previewUrl: r.previewUrl ?? null,
        trackUrl: r.trackViewUrl ?? null,
      }));

    res.json(tracks);
  } catch (error) {
    req.log.error({ err: error }, "Error searching music");
    res.status(502).json({ error: "Music search is unavailable" });
  }
});

export default router;
