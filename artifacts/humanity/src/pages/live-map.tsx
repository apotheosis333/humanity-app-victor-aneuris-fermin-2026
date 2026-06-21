import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LiveGlobe } from "@/components/live-globe";
import {
  ACTIVITY_META,
  getActivitySource,
  type ActivitySnapshot,
  type ActivityType,
} from "@/lib/live-activity";
import { Users, Globe2, Languages, Heart, Sparkles } from "lucide-react";

const LAYER_ORDER: ActivityType[] = ["active", "new_member", "pledge", "cultural", "dinner"];

function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = performance.now();
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;
    const step = (now: number) => {
      const t = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + delta * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent: string;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="font-sans text-xl font-bold text-white tabular-nums leading-tight">
          {animated.toLocaleString()}
        </div>
        <div className="text-[11px] text-white/55 leading-tight">{label}</div>
      </div>
    </div>
  );
}

export default function LiveMap() {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<ActivitySnapshot>(() =>
    getActivitySource().getSnapshot(),
  );
  const [enabled, setEnabled] = useState<Record<ActivityType, boolean>>({
    active: true,
    new_member: true,
    pledge: true,
    cultural: true,
    dinner: true,
  });

  useEffect(() => {
    const unsub = getActivitySource().subscribe(setSnapshot);
    return unsub;
  }, []);

  const counts = useMemo(() => {
    const c: Record<ActivityType, number> = {
      active: 0,
      new_member: 0,
      pledge: 0,
      cultural: 0,
      dinner: 0,
    };
    for (const m of snapshot.markers) c[m.type]++;
    return c;
  }, [snapshot.markers]);

  const stats = snapshot.stats;

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto animate-fade-up">
        <div className="label-eyebrow text-[#FBBF24] inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
          </span>
          {t("liveMap.badge")}
        </div>
        <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold text-white">
          {t("liveMap.title")}
        </h1>
        <div className="accent-rule mt-4 mx-auto" />
        <p className="mt-5 text-white/65 text-lg leading-relaxed">
          {t("liveMap.subtitle")}
        </p>
      </div>

      {/* Globe + side panels */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="glass-panel rounded-3xl p-3 md:p-4 overflow-hidden glow-blue/30 animate-fade-up">
          <LiveGlobe markers={snapshot.markers} enabled={enabled} />
        </div>

        {/* Layer toggles */}
        <div className="glass-panel rounded-3xl p-5 animate-fade-up delay-100">
          <h2 className="font-sans text-sm font-bold text-white tracking-wide">{t("liveMap.layersTitle")}</h2>
          <p className="text-[11px] text-white/45 mt-1 mb-4">{t("liveMap.layersSubtitle")}</p>
          <div className="flex flex-col gap-2">
            {LAYER_ORDER.map((type) => {
              const meta = ACTIVITY_META[type];
              const on = enabled[type];
              return (
                <button
                  key={type}
                  onClick={() => setEnabled((e) => ({ ...e, [type]: !e[type] }))}
                  aria-pressed={on}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all border ${
                    on
                      ? "bg-white/[0.06] border-white/10"
                      : "bg-transparent border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${meta.color}22` }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: meta.color,
                        boxShadow: on ? `0 0 8px ${meta.color}` : "none",
                      }}
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-white leading-tight">
                      {t(`liveMap.layer.${type}`)}
                    </span>
                    <span className="block text-[10px] text-white/45 leading-tight truncate">
                      {t(`liveMap.layerDesc.${type}`)}
                    </span>
                  </span>
                  <span className="text-[11px] tabular-nums text-white/55">{counts[type]}</span>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      on ? "bg-[#2563EB]" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                        on ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-white/35">
            {t("liveMap.privacy")}
          </p>
        </div>
      </div>

      {/* Global stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-up delay-200">
        <StatTile icon={Users} label={t("liveMap.stat.active")} value={stats.activeOnline} accent="#3B82F6" />
        <StatTile icon={Globe2} label={t("liveMap.stat.countries")} value={stats.countriesRepresented} accent="#60A5FA" />
        <StatTile icon={Languages} label={t("liveMap.stat.languages")} value={stats.languagesSpoken} accent="#A855F7" />
        <StatTile icon={Heart} label={t("liveMap.stat.pledges")} value={stats.pledgesSigned} accent="#F59E0B" />
        <StatTile icon={Sparkles} label={t("liveMap.stat.exchanges")} value={stats.culturalExchanges} accent="#34D399" />
      </div>
    </div>
  );
}
