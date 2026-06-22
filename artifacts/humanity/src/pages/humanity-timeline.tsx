import React, { useState, useEffect, useMemo } from "react";
import {
  useGetHumanityTimeline,
  useListCountries,
  useSearchTimeline,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { History, Globe, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ERAS = [
  { id: "ancient", label: "Ancient", period: "Prehistory - 500 CE" },
  { id: "classical", label: "Classical", period: "500 BCE - 500 CE" },
  { id: "medieval", label: "Medieval", period: "500 CE - 1450 CE" },
  { id: "modern", label: "Modern", period: "1450 CE - 1945 CE" },
  { id: "contemporary", label: "Contemporary", period: "1945 CE - Present" },
];

const CATEGORIES = [
  "cultural",
  "scientific",
  "political",
  "military",
  "religious",
  "economic",
  "social",
  "exploration",
];

const CATEGORY_STYLES: Record<string, string> = {
  cultural: "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30",
  scientific: "bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30",
  political: "bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/30",
  military: "bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30",
  religious: "bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30",
  economic: "bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30",
  social: "bg-[#f472b6]/15 text-[#f472b6] border-[#f472b6]/30",
  exploration: "bg-[#22d3ee]/15 text-[#22d3ee] border-[#22d3ee]/30",
};

function formatYear(year: number) {
  return year > 0 ? `${year} CE` : `${Math.abs(year)} BCE`;
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HumanityTimeline() {
  const [selectedEra, setSelectedEra] = useState<string>("modern");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const debouncedQuery = useDebounced(query.trim(), 300);
  const searchActive = debouncedQuery.length > 0 || category != null;

  const { data: timelineData, isLoading } = useGetHumanityTimeline({
    era: selectedEra as any,
  });
  const { data: countries } = useListCountries();

  const { data: searchResults, isLoading: searchLoading } = useSearchTimeline(
    {
      q: debouncedQuery || undefined,
      category: category || undefined,
      limit: 60,
    },
    {
      query: {
        enabled: searchActive,
        queryKey: ["timeline-search", debouncedQuery, category],
      },
    },
  );

  const eraArray = Array.isArray(timelineData) ? (timelineData as any[]) : [];
  const currentEraData =
    eraArray.find((e: any) => e.era === selectedEra) ?? eraArray[0];
  const events: any[] = currentEraData?.events ?? [];
  const groupedEvents = useMemo(
    () =>
      events.reduce((acc: any, event: any) => {
        const country = countries?.find((c: any) => c.code === event.countryCode);
        const key = event.countryName || country?.name || event.countryCode;
        if (!acc[key])
          acc[key] = {
            country,
            flagUrl:
              country?.flagUrl ??
              `https://flagcdn.com/w320/${event.countryCode?.toLowerCase()}.png`,
            events: [],
          };
        acc[key].events.push(event);
        return acc;
      }, {}),
    [events, countries],
  );

  const clearSearch = () => {
    setQuery("");
    setCategory(null);
  };

  return (
    <div className="w-full flex flex-col items-center pb-28 space-y-12 pt-24 px-4">
      <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10 animate-fade-up">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white tracking-tight">
          Hu<span className="text-[#FBBF24] text-glow-gold">MAN</span>ity Timeline
        </h1>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          Witness the parallel histories of our world's nations side-by-side.
        </p>
      </div>

      {/* Search */}
      <div className="container mx-auto max-w-3xl relative z-30 w-full animate-fade-up delay-100">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nations, events, people…"
            className="h-14 pl-14 pr-12 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl focus-visible:ring-[#60A5FA]/40 focus-visible:border-[#60A5FA]/40"
            aria-label="Search timeline"
          />
          {(query.length > 0 || category != null) && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={cn(
                "min-h-9 px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all",
                category === cat
                  ? CATEGORY_STYLES[cat] ?? "bg-white/15 text-white border-white/30"
                  : "bg-white/5 text-white/55 border-white/10 hover:text-white hover:bg-white/10",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {searchActive ? (
        <SearchResults
          loading={searchLoading}
          results={(searchResults as any[]) ?? []}
          onClear={clearSearch}
        />
      ) : (
        <div className="container mx-auto max-w-7xl relative z-20">
          <Tabs
            value={selectedEra}
            onValueChange={setSelectedEra}
            className="w-full animate-fade-up delay-100"
          >
            <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-3 md:grid-cols-5 h-auto p-2 glass-panel rounded-2xl border-none">
              {ERAS.map((era) => (
                <TabsTrigger
                  key={era.id}
                  value={era.id}
                  className={cn(
                    "flex flex-col py-3 px-2 rounded-xl transition-all",
                    "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2563EB] data-[state=active]:to-[#1d4ed8] data-[state=active]:text-white data-[state=active]:glow-blue shadow-none text-white/70 hover:text-white",
                  )}
                >
                  <span className="font-bold text-sm">{era.label}</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-tighter mt-1",
                      selectedEra === era.id ? "text-white/80" : "text-white/50",
                    )}
                  >
                    {era.period}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-16 animate-fade-up delay-200">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-3xl bg-white/5" />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="flex overflow-x-auto pb-12 gap-8 snap-x scrollbar-hide">
                {Object.entries(groupedEvents || {}).map(
                  ([countryName, data]: [string, any], i) => (
                    <div
                      key={countryName}
                      className="min-w-[calc(100vw-2rem)] sm:min-w-[320px] md:min-w-[400px] snap-start flex-shrink-0 space-y-6 animate-fade-up"
                      style={{ animationDelay: `${0.1 * i}s` }}
                    >
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4 px-2 relative">
                        {data.flagUrl && (
                          <img
                            src={data.flagUrl}
                            className="w-10 h-7 object-cover rounded shadow-md border border-white/20"
                            alt="Flag"
                          />
                        )}
                        <h3 className="text-3xl font-serif text-white">
                          {countryName}
                        </h3>
                        <div className="absolute bottom-0 left-0 w-16 h-[2px] bg-gradient-to-r from-[#FBBF24] to-transparent glow-gold" />
                      </div>

                      <div className="space-y-6">
                        {data.events.map((event: any, idx: number) => (
                          <Card
                            key={idx}
                            className="border-none glass-panel rounded-3xl overflow-hidden group hover:-translate-y-2 hover:glow-blue transition-all duration-500"
                          >
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="bg-[#2563EB]/20 text-[#60A5FA] px-3 py-1 rounded-full text-xs font-bold font-sans border border-[#2563EB]/30">
                                  {formatYear(event.year)}
                                </span>
                                <History className="w-4 h-4 text-white/30 group-hover:text-[#FBBF24] transition-colors" />
                              </div>
                              <h4 className="text-xl font-serif text-white leading-snug group-hover:text-[#60A5FA] transition-colors">
                                {event.title}
                              </h4>
                              <p className="text-sm text-white/70 leading-relaxed">
                                {event.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="py-32 text-center space-y-6 max-w-md mx-auto">
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto shadow-xl border border-white/10 glow-blue/20">
                  <Globe className="w-12 h-12 text-white/30" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-serif text-white">
                    History in progress...
                  </h3>
                  <p className="text-white/50 text-lg">
                    No events recorded yet for the{" "}
                    <span className="text-[#60A5FA] font-medium">
                      {selectedEra}
                    </span>{" "}
                    era in our global database.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResults({
  loading,
  results,
  onClear,
}: {
  loading: boolean;
  results: any[];
  onClear: () => void;
}) {
  return (
    <div className="container mx-auto max-w-4xl relative z-20 w-full animate-fade-up">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-white/50 text-sm mb-6 text-center">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="space-y-4">
            {results.map((ev) => (
              <Card
                key={ev.id}
                className="border-none glass-panel rounded-2xl overflow-hidden group hover:glow-blue transition-all duration-300"
              >
                <CardContent className="p-5 flex gap-4 items-start">
                  {ev.countryFlagUrl && (
                    <img
                      src={ev.countryFlagUrl}
                      className="w-12 h-8 object-cover rounded shadow-md border border-white/20 mt-1 flex-shrink-0"
                      alt={ev.countryName}
                    />
                  )}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#2563EB]/20 text-[#60A5FA] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#2563EB]/30">
                        {formatYear(ev.year)}
                      </span>
                      <span className="text-white/80 text-sm font-semibold">
                        {ev.countryName}
                      </span>
                      {ev.category && (
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border",
                            CATEGORY_STYLES[ev.category] ??
                              "bg-white/10 text-white/60 border-white/15",
                          )}
                        >
                          {ev.category}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-serif text-white leading-snug group-hover:text-[#60A5FA] transition-colors">
                      {ev.title}
                    </h4>
                    <p className="text-sm text-white/65 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="py-24 text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto border border-white/10">
            <Search className="w-9 h-9 text-white/30" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-serif text-white">No matches found</h3>
            <p className="text-white/50">
              Try a different nation, event, or category.
            </p>
            <button
              onClick={onClear}
              className="text-[#60A5FA] hover:text-white text-sm font-semibold transition-colors"
            >
              Clear search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
