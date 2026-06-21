import { Component, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { useLocation } from "wouter";
import { feature } from "topojson-client";
import { Shuffle, RotateCcw, Plus, Minus, Loader2, Globe2 } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const EARTH_NIGHT = "https://cdn.jsdelivr.net/npm/three-globe@2/example/img/earth-night.jpg";
const NIGHT_SKY = "https://cdn.jsdelivr.net/npm/three-globe@2/example/img/night-sky.png";

class GlobeErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

type Feat = {
  properties: Record<string, any>;
  __country?: any;
};

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function normalize(s: string) {
  return s
    ? s
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .replace(/^the/, "")
    : "";
}

// Natural Earth (world-atlas) names → our DB names, normalized on both sides.
const NAME_ALIASES: Record<string, string> = Object.fromEntries(
  [
    ["Bosnia and Herz.", "Bosnia and Herzegovina"],
    ["Central African Rep.", "Central African Republic"],
    ["Czechia", "Czech Republic"],
    ["Côte d'Ivoire", "Ivory Coast"],
    ["Dem. Rep. Congo", "DR Congo"],
    ["Dominican Rep.", "Dominican Republic"],
    ["Eq. Guinea", "Equatorial Guinea"],
    ["Macedonia", "North Macedonia"],
    ["S. Sudan", "South Sudan"],
    ["Solomon Is.", "Solomon Islands"],
    ["United States of America", "United States"],
  ].map(([atlas, db]) => [normalize(atlas), normalize(db)]),
);

function WorldGlobeInner({ countries = [] }: { countries: any[] }) {
  const [, setLocation] = useLocation();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const [features, setFeatures] = useState<Feat[]>([]);
  const [hoverD, setHoverD] = useState<Feat | null>(null);
  const [ready, setReady] = useState(false);
  const interacting = useRef(false);

  const byCode = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of countries) {
      if (c.code) m.set(String(c.code).toUpperCase(), c);
    }
    return m;
  }, [countries]);

  const byName = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of countries) {
      if (c.name) m.set(normalize(c.name), c);
    }
    return m;
  }, [countries]);

  const matchCountry = useCallback(
    (props: Record<string, any>) => {
      const iso = (props.ISO_A2 || props.iso_a2 || "").toUpperCase();
      if (iso && iso !== "-99" && byCode.has(iso)) return byCode.get(iso);
      const candidates = [props.name, props.ADMIN, props.NAME, props.NAME_LONG, props.BRK_NAME];
      for (const cand of candidates) {
        if (cand) {
          const key = normalize(cand);
          const hit = byName.get(key) || byName.get(NAME_ALIASES[key]);
          if (hit) return hit;
        }
      }
      return undefined;
    },
    [byCode, byName],
  );

  useEffect(() => {
    let active = true;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo: any) => {
        if (!active) return;
        const fc: any = feature(topo, topo.objects.countries);
        const feats: Feat[] = (fc.features || []).filter(
          (f: any) => f.properties?.name !== "Antarctica",
        );
        setFeatures(feats);
      })
      .catch((err) => {
        console.warn("WorldGlobe: failed to load country geometry", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const enrichedFeatures = useMemo(() => {
    return features.map((f) => ({ ...f, __country: matchCountry(f.properties) }));
  }, [features, matchCountry]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = Math.min(Math.max(w * 0.62, 360), window.innerHeight * 0.7);
      setSize({ width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleGlobeReady = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableZoom = true;
    controls.minDistance = 180;
    controls.maxDistance = 600;
    controls.rotateSpeed = 0.7;
    g.pointOfView({ lat: 20, lng: 10, altitude: 2.4 }, 0);
    setReady(true);
  }, []);

  const stopRotate = useCallback(() => {
    const g = globeRef.current;
    if (g) g.controls().autoRotate = false;
    interacting.current = true;
  }, []);

  const capColor = useCallback(
    (f: any) => {
      const c = f.__country;
      const isHover = hoverD === f;
      if (!c) return isHover ? "rgba(37,99,235,0.25)" : "rgba(30,58,95,0.35)";
      if (c.featured) return isHover ? "rgba(251,191,36,0.95)" : "rgba(251,191,36,0.7)";
      return isHover ? "rgba(96,165,250,0.95)" : "rgba(37,99,235,0.55)";
    },
    [hoverD],
  );

  const handleClick = useCallback(
    (f: any) => {
      const c = f?.__country;
      if (c?.code) setLocation(`/country/${c.code}`);
    },
    [setLocation],
  );

  const flyTo = useCallback((f: Feat, altitude = 1.6) => {
    const g = globeRef.current;
    if (!g) return;
    const c = f.__country;
    let lat = c?.latitude;
    let lng = c?.longitude;
    if (typeof lat !== "number" || typeof lng !== "number") {
      const ll = centroid(f);
      lat = ll[1];
      lng = ll[0];
    }
    g.controls().autoRotate = false;
    g.pointOfView({ lat, lng, altitude }, 1200);
  }, []);

  const surprise = useCallback(() => {
    const available = enrichedFeatures.filter((f) => f.__country);
    if (!available.length) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    setHoverD(pick);
    flyTo(pick, 1.4);
  }, [enrichedFeatures, flyTo]);

  const resetView = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    setHoverD(null);
    g.pointOfView({ lat: 20, lng: 10, altitude: 2.4 }, 1000);
    g.controls().autoRotate = true;
  }, []);

  const zoom = useCallback((factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    g.pointOfView({ ...pov, altitude: Math.min(Math.max(pov.altitude * factor, 0.4), 4) }, 400);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-[#0F172A] select-none"
      style={{ height: size.height }}
    >
      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0F172A]">
          <Loader2 className="h-8 w-8 text-[#FBBF24] animate-spin" />
        </div>
      )}

      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={EARTH_NIGHT}
        backgroundImageUrl={NIGHT_SKY}
        atmosphereColor="#2563EB"
        atmosphereAltitude={0.22}
        polygonsData={enrichedFeatures as any}
        polygonAltitude={(d: any) => (hoverD === d ? 0.08 : 0.012)}
        polygonCapColor={capColor as any}
        polygonSideColor={() => "rgba(37,99,235,0.15)"}
        polygonStrokeColor={() => "rgba(251,191,36,0.35)"}
        polygonLabel={((d: any) => {
          const c = d.__country;
          const name = escapeHtml(c?.name || d.properties?.name || d.properties?.ADMIN || d.properties?.NAME || "");
          return `
            <div style="background:#1F2937;color:#fff;padding:8px 12px;border-radius:8px;border:1px solid rgba(251,191,36,0.4);box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:Georgia,serif;">
              <div style="color:#FBBF24;font-weight:700;font-size:14px;">${name}</div>
              ${c ? '<div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:2px;">Click to explore →</div>' : '<div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:2px;">Coming soon</div>'}
            </div>`;
        }) as any}
        onPolygonHover={((d: any) => setHoverD(d || null)) as any}
        onPolygonClick={handleClick as any}
        onGlobeReady={handleGlobeReady}
        onGlobeClick={stopRotate}
        polygonsTransitionDuration={300}
        enablePointerInteraction
      />

      {/* Hint bar */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] tracking-wide text-white/70 font-medium">
          Drag to spin · Scroll to zoom · Click a country
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={surprise}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBBF24] text-[#0F172A] text-sm font-bold shadow-lg hover:bg-[#F59E0B] transition-colors"
        >
          <Shuffle className="h-4 w-4" /> Surprise me
        </button>
        <button
          onClick={resetView}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 hover:bg-white/20 transition-colors"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => zoom(0.7)}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 hover:bg-white/20 transition-colors"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoom(1.4)}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 hover:bg-white/20 transition-colors"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function WorldGlobe({ countries = [] }: { countries: any[] }) {
  return (
    <GlobeErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center w-full rounded-2xl bg-[#0F172A] text-center px-6 py-16 gap-3">
          <Globe2 className="h-12 w-12 text-[#FBBF24]/70" />
          <p className="text-white font-serif text-lg">The 3D globe needs WebGL</p>
          <p className="text-white/60 text-sm max-w-sm">
            Your browser or device couldn't start 3D graphics. Try a modern desktop browser
            (Chrome, Edge, Firefox, Safari) with hardware acceleration enabled.
          </p>
        </div>
      }
    >
      <WorldGlobeInner countries={countries} />
    </GlobeErrorBoundary>
  );
}

function centroid(f: Feat): [number, number] {
  try {
    const geom = (f as any).geometry;
    let coords: any[] = [];
    if (geom.type === "Polygon") coords = geom.coordinates[0];
    else if (geom.type === "MultiPolygon") {
      let best = geom.coordinates[0][0];
      let bestLen = 0;
      for (const poly of geom.coordinates) {
        if (poly[0].length > bestLen) {
          bestLen = poly[0].length;
          best = poly[0];
        }
      }
      coords = best;
    }
    let x = 0;
    let y = 0;
    for (const [lng, lat] of coords) {
      x += lng;
      y += lat;
    }
    return [x / coords.length, y / coords.length];
  } catch {
    return [0, 0];
  }
}
