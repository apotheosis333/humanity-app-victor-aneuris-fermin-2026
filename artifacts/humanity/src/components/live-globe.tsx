import { Component, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Loader2, Globe2 } from "lucide-react";
import { feature } from "topojson-client";
import {
  ACTIVITY_META,
  type ActivityMarker,
  type ActivityType,
} from "@/lib/live-activity";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const EARTH_NIGHT = "https://cdn.jsdelivr.net/npm/three-globe@2/example/img/earth-night.jpg";
const NIGHT_SKY = "https://cdn.jsdelivr.net/npm/three-globe@2/example/img/night-sky.png";

class GlobeErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
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

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

type Enabled = Record<ActivityType, boolean>;

function LiveGlobeInner({ markers, enabled }: { markers: ActivityMarker[]; enabled: Enabled }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 520 });
  const [polygons, setPolygons] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo: any) => {
        if (!active) return;
        const fc: any = feature(topo, topo.objects.countries);
        setPolygons((fc.features || []).filter((f: any) => f.properties?.name !== "Antarctica"));
      })
      .catch((err) => console.warn("LiveGlobe: failed to load geometry", err));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const minHeight = window.innerWidth < 640 ? 320 : 380;
      const viewportCap = window.innerWidth < 640 ? window.innerHeight * 0.58 : window.innerHeight * 0.78;
      const h = Math.min(Math.max(w * 0.66, minHeight), viewportCap);
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

  // Point layer: active / cultural / dinner (glowing coloured dots).
  const pointMarkers = useMemo(
    () =>
      markers.filter(
        (m) =>
          enabled[m.type] &&
          (m.type === "active" || m.type === "cultural" || m.type === "dinner"),
      ),
    [markers, enabled],
  );

  // Ring layer: new members (warm gold pulse).
  const ringMarkers = useMemo(
    () => markers.filter((m) => enabled.new_member && m.type === "new_member"),
    [markers, enabled],
  );

  // HTML layer: humanity pledges (gold hearts).
  const heartMarkers = useMemo(
    () => markers.filter((m) => enabled.pledge && m.type === "pledge"),
    [markers, enabled],
  );

  const handleGlobeReady = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.38;
    controls.enableZoom = true;
    controls.minDistance = 200;
    controls.maxDistance = 620;
    g.pointOfView({ lat: 18, lng: 8, altitude: 2.5 }, 0);
    setReady(true);
  }, []);

  const stopRotate = useCallback(() => {
    const g = globeRef.current;
    if (g) g.controls().autoRotate = false;
  }, []);

  const heartEl = useCallback(() => {
    const el = document.createElement("div");
    el.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="${ACTIVITY_META.pledge.color}" style="filter:drop-shadow(0 0 5px rgba(245,158,11,0.95))"><path d="M12 21s-7.5-4.9-10-9.3C.6 8.4 2.2 5 5.5 5c2 0 3.4 1.2 4.5 2.6C11.1 6.2 12.5 5 14.5 5 17.8 5 19.4 8.4 22 11.7 19.5 16.1 12 21 12 21z"/></svg>`;
    el.style.pointerEvents = "none";
    el.style.transform = "translate(-50%, -50%)";
    return el;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full touch-pan-y rounded-2xl overflow-hidden bg-[#0F172A] select-none"
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
        polygonsData={polygons as any}
        polygonAltitude={0.006}
        polygonCapColor={() => "rgba(37,99,235,0.18)"}
        polygonSideColor={() => "rgba(37,99,235,0.06)"}
        polygonStrokeColor={() => "rgba(96,165,250,0.18)"}
        pointsData={pointMarkers as any}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => ACTIVITY_META[d.type as ActivityType].color}
        pointAltitude={0.012}
        pointRadius={0.28}
        pointResolution={6}
        pointsMerge={false}
        pointLabel={((d: any) => {
          const meta = ACTIVITY_META[d.type as ActivityType];
          return `
            <div style="background:#0F172A;color:#fff;padding:7px 11px;border-radius:8px;border:1px solid ${meta.color}66;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:'Space Grotesk',sans-serif;">
              <div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:12px;color:${meta.color};">
                <span style="width:8px;height:8px;border-radius:50%;background:${meta.color};display:inline-block;"></span>${meta.label}
              </div>
              <div style="color:rgba(255,255,255,0.85);font-size:12px;margin-top:3px;">${escapeHtml(d.region)} · ${escapeHtml(d.country)}</div>
              <div style="color:rgba(255,255,255,0.4);font-size:10px;margin-top:2px;">Approximate region · privacy-safe</div>
            </div>`;
        }) as any}
        ringsData={ringMarkers as any}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={() => (t: number) => `rgba(251,191,36,${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2.4}
        ringRepeatPeriod={700}
        htmlElementsData={heartMarkers as any}
        htmlLat={(d: any) => d.lat}
        htmlLng={(d: any) => d.lng}
        htmlAltitude={0.013}
        htmlElement={heartEl as any}
        onGlobeClick={stopRotate}
        onGlobeReady={handleGlobeReady}
        enablePointerInteraction
      />

      <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-1.5rem)] sm:top-4 sm:w-auto">
        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-center text-[10px] tracking-wide text-white/70 font-medium sm:px-4 sm:text-[11px]">
          Drag to spin · Scroll to zoom · Approximate regions only
        </div>
      </div>
    </div>
  );
}

export function LiveGlobe({ markers, enabled }: { markers: ActivityMarker[]; enabled: Enabled }) {
  return (
    <GlobeErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center w-full rounded-2xl bg-[#0F172A] text-center px-6 py-16 gap-3">
          <Globe2 className="h-12 w-12 text-[#FBBF24]/70" />
          <p className="text-white font-serif text-lg">The 3D globe needs WebGL</p>
          <p className="text-white/60 text-sm max-w-sm">
            Your browser or device couldn't start 3D graphics. Try a modern desktop browser with
            hardware acceleration enabled.
          </p>
        </div>
      }
    >
      <LiveGlobeInner markers={markers} enabled={enabled} />
    </GlobeErrorBoundary>
  );
}
