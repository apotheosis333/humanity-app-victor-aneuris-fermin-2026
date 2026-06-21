import React, { useState } from "react";
import {
  useListCountries,
  useCompareCountries,
  useCompareTimelines,
} from "@workspace/api-client-react";
import { CountryCombobox } from "@/components/country-combobox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Globe,
  ArrowRightLeft,
  Loader2,
  Plus,
  X,
  History,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_NATIONS = 4;

function getFlagUrl(code: string) {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}
function formatPop(num: number) {
  return num?.toLocaleString();
}
function formatArea(num: number) {
  return num != null ? `${num.toLocaleString()} km²` : "—";
}
function formatYear(year: number) {
  return year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`;
}

const STAT_ROWS: {
  label: string;
  key: string;
  format?: (v: any) => string;
  numeric?: boolean;
}[] = [
  { label: "Capital", key: "capital" },
  { label: "Population", key: "population", format: formatPop, numeric: true },
  { label: "Area", key: "areaKm2", format: formatArea, numeric: true },
  { label: "Languages", key: "languages" },
  { label: "Religion", key: "religion" },
  { label: "Currency", key: "currency" },
  { label: "Government", key: "governmentType" },
  { label: "History Events", key: "timelineCount", numeric: true },
  { label: "Cultural Milestones", key: "milestoneCount", numeric: true },
];

export default function Compare() {
  const { data: countries } = useListCountries();
  const [codes, setCodes] = useState<string[]>(["", ""]);
  const [picker, setPicker] = useState(""); // value for the "add nation" slot

  const selected = codes.filter(Boolean);
  const canCompare = selected.length >= 2;

  // Stats comparison (winner-highlight) only when exactly 2 nations chosen.
  const { data: pairComparison, isLoading: pairLoading } = useCompareCountries(
    { a: selected[0] ?? "", b: selected[1] ?? "" },
    {
      query: {
        enabled: selected.length === 2,
        queryKey: ["compare-pair", selected[0], selected[1]],
      },
    },
  );

  // Timeline comparison for all selected nations (2-4).
  const { data: timelines, isLoading: tlLoading } = useCompareTimelines(
    { countries: selected.join(",") },
    {
      query: {
        enabled: canCompare,
        queryKey: ["compare-timelines", selected.join(",")],
      },
    },
  );

  const setAt = (idx: number, value: string) =>
    setCodes((prev) => prev.map((c, i) => (i === idx ? value : c)));

  const removeAt = (idx: number) =>
    setCodes((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length < 2 ? [...next, ""] : next;
    });

  const addNation = (value: string) => {
    if (!value || codes.includes(value)) return;
    setCodes((prev) => [...prev, value]);
    setPicker("");
  };

  const stats = pairComparison as any;

  return (
    <div className="w-full flex flex-col items-center pb-28 space-y-16">
      <section className="w-full text-center pt-24 px-6 animate-fade-up">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="label-eyebrow text-[#FBBF24]/80">Analytics</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-white">
          Compare <span className="text-[#FBBF24]">Nations</span>
        </h1>
        <div className="accent-rule mt-4 mx-auto" />
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mt-6">
          Set 2–4 nations side by side — their stats and their histories,
          century by century.
        </p>
      </section>

      <div className="w-full max-w-6xl px-6 space-y-12">
        {/* Selectors */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl animate-fade-up delay-100 space-y-5">
          <div
            className={cn(
              "grid gap-4",
              "grid-cols-1 sm:grid-cols-2",
              codes.length >= 3 && "lg:grid-cols-3",
              codes.length >= 4 && "xl:grid-cols-4",
            )}
          >
            {codes.map((code, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="label-eyebrow text-[#60A5FA]">
                    Nation {idx + 1}
                  </span>
                  {codes.length > 2 && (
                    <button
                      onClick={() => removeAt(idx)}
                      aria-label={`Remove nation ${idx + 1}`}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-[#f87171] hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <CountryCombobox
                  countries={countries?.filter(
                    (c: any) => !codes.includes(c.code) || c.code === code,
                  )}
                  value={code}
                  onChange={(v) => setAt(idx, v)}
                  placeholder="Select Country"
                  triggerClassName="h-14 text-lg font-serif bg-white/5 border-white/10 text-white hover:bg-white/10 w-full"
                />
              </div>
            ))}
          </div>

          {codes.length < MAX_NATIONS && (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 text-white/50">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add a nation</span>
              </div>
              <div className="flex-1 max-w-xs">
                <CountryCombobox
                  countries={countries?.filter(
                    (c: any) => !codes.includes(c.code),
                  )}
                  value={picker}
                  onChange={addNation}
                  placeholder="Add nation…"
                  triggerClassName="h-11 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 w-full"
                />
              </div>
            </div>
          )}
        </div>

        {!canCompare ? (
          <div className="py-32 text-center space-y-8 animate-fade-up delay-200">
            <div className="w-32 h-32 glass-panel rounded-full flex items-center justify-center mx-auto border border-white/10">
              <ArrowRightLeft className="w-12 h-12 text-[#60A5FA]/40" />
            </div>
            <p className="text-2xl font-serif text-white/40 italic">
              Select at least two nations to compare
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Stats — only for exactly 2 nations */}
            {selected.length === 2 && (
              <section className="space-y-6 animate-fade-up delay-200">
                <SectionHeading icon={BarChart3} title="By the Numbers" />
                {pairLoading ? (
                  <LoadingBlock />
                ) : stats?.a && stats?.b ? (
                  <div className="glass-panel rounded-3xl overflow-hidden max-w-5xl mx-auto">
                    <Table>
                      <TableBody>
                        <TableRow className="border-b border-white/10 hover:bg-transparent">
                          <TableCell className="w-1/4"></TableCell>
                          {[stats.a, stats.b].map((c: any, i: number) => (
                            <TableCell
                              key={i}
                              className={cn(
                                "text-center p-8",
                                i === 1 && "border-l border-white/10",
                              )}
                            >
                              <div className="space-y-4">
                                <img
                                  src={c.flagUrl ?? getFlagUrl(c.code)}
                                  className="w-32 h-20 object-cover mx-auto rounded shadow-lg border border-white/20"
                                  alt={c.name}
                                />
                                <h2 className="text-2xl font-serif font-bold text-white">
                                  {c.name}
                                </h2>
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>

                        {STAT_ROWS.map((row, idx) => {
                          const valA = stats.a[row.key];
                          const valB = stats.b[row.key];
                          let winner: "A" | "B" | null = null;
                          if (
                            row.numeric &&
                            typeof valA === "number" &&
                            typeof valB === "number" &&
                            valA !== valB
                          ) {
                            winner = valA > valB ? "A" : "B";
                          }
                          return (
                            <TableRow
                              key={idx}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <TableCell className="label-eyebrow text-[#60A5FA] bg-white/5 px-8 py-6">
                                {row.label}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "text-center font-serif text-lg p-6",
                                  winner === "A"
                                    ? "bg-[#FBBF24]/10 text-[#FBBF24] font-bold"
                                    : "text-white/80",
                                )}
                              >
                                {row.format ? row.format(valA) : valA || "—"}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "text-center font-serif text-lg p-6 border-l border-white/10",
                                  winner === "B"
                                    ? "bg-[#FBBF24]/10 text-[#FBBF24] font-bold"
                                    : "text-white/80",
                                )}
                              >
                                {row.format ? row.format(valB) : valB || "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </section>
            )}

            {/* Timeline comparison — for all selected nations */}
            <section className="space-y-6 animate-fade-up delay-200">
              <SectionHeading icon={History} title="Histories Side by Side" />
              {tlLoading ? (
                <LoadingBlock />
              ) : (
                <TimelineColumns timelines={(timelines as any[]) ?? []} />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="w-10 h-10 glass rounded-full flex items-center justify-center text-[#FBBF24] border border-[#FBBF24]/30">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-2xl md:text-3xl font-serif text-white">{title}</h2>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 className="w-10 h-10 text-[#60A5FA] animate-spin" />
      <p className="text-white/60 font-serif text-lg italic">
        Analyzing global data…
      </p>
    </div>
  );
}

function TimelineColumns({ timelines }: { timelines: any[] }) {
  // Overlapping window = years covered by ALL selected nations, used to
  // highlight events that fall in their shared historical period.
  const ranges = timelines
    .filter((t) => t.events.length > 0)
    .map((t) => ({
      min: t.events[0].year,
      max: t.events[t.events.length - 1].year,
    }));
  const overlapStart =
    ranges.length === timelines.length && ranges.length > 0
      ? Math.max(...ranges.map((r) => r.min))
      : null;
  const overlapEnd =
    ranges.length === timelines.length && ranges.length > 0
      ? Math.min(...ranges.map((r) => r.max))
      : null;
  const hasOverlap =
    overlapStart != null && overlapEnd != null && overlapStart <= overlapEnd;

  if (timelines.every((t) => t.events.length === 0)) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/50 text-lg font-serif italic">
          No timeline events recorded for these nations yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasOverlap && (
        <p className="text-center text-sm text-white/55">
          Shared era highlighted in gold:{" "}
          <span className="text-[#FBBF24] font-semibold">
            {formatYear(overlapStart!)} – {formatYear(overlapEnd!)}
          </span>
        </p>
      )}
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
        {timelines.map((nation) => (
          <div
            key={nation.code}
            className="min-w-[280px] md:min-w-[340px] flex-shrink-0 snap-start space-y-5"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 sticky top-0">
              <img
                src={nation.flagUrl ?? getFlagUrl(nation.code)}
                className="w-10 h-7 object-cover rounded shadow-md border border-white/20"
                alt={nation.name}
              />
              <h3 className="text-2xl font-serif text-white">{nation.name}</h3>
            </div>
            <div className="space-y-4">
              {nation.events.length === 0 ? (
                <p className="text-white/40 text-sm italic py-6">
                  No events recorded.
                </p>
              ) : (
                nation.events.map((event: any) => {
                  const inOverlap =
                    hasOverlap &&
                    event.year >= overlapStart! &&
                    event.year <= overlapEnd!;
                  return (
                    <Card
                      key={event.id}
                      className={cn(
                        "border rounded-2xl overflow-hidden transition-all duration-300",
                        inOverlap
                          ? "glass-panel border-[#FBBF24]/40 glow-gold/30"
                          : "glass-panel border-white/5 hover:border-white/15",
                      )}
                    >
                      <CardContent className="p-5 space-y-2">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border",
                            inOverlap
                              ? "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30"
                              : "bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/30",
                          )}
                        >
                          {formatYear(event.year)}
                        </span>
                        <h4 className="text-lg font-serif text-white leading-snug">
                          {event.title}
                        </h4>
                        <p className="text-sm text-white/65 leading-relaxed">
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
