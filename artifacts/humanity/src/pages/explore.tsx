import React, { useState } from "react";
import { Link } from "wouter";
import { useSearchCountries, useListContinents } from "@workspace/api-client-react";
import { getSearchCountriesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [religion, setReligion] = useState<string | null>(null);

  const { data: searchResults, isLoading: isSearching } = useSearchCountries(
    { q: search },
    { query: { enabled: search.length > 0, queryKey: getSearchCountriesQueryKey({ q: search }) } }
  );

  const { data: continents, isLoading: loadingContinents } = useListContinents();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const IMAGE_ON_ERROR = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget;
    t.onerror = null;
    t.style.display = 'none';
    t.parentElement!.style.background = 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #0F172A 100%)';
  };

  const allCountries = continents?.flatMap(c => c.countries) || [];
  
  const filteredData = (search.length > 0 ? searchResults : allCountries)?.filter(c => {
    if (continent && c.continent !== continent) return false;
    if (language && !c.languages?.toLowerCase().includes(language.toLowerCase())) return false;
    if (religion && !c.religion?.toLowerCase().includes(religion.toLowerCase())) return false;
    return true;
  });

  const activeData = filteredData;

  return (
    <div className="w-full pb-24 relative z-10">
      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-up">
          <div className="space-y-4">
            <span className="label-eyebrow text-[#FBBF24]/80">Discover</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white font-bold tracking-tight">Explore the World</h1>
            <div className="accent-rule mt-3" />
          </div>
          
          <div className="relative max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-[#60A5FA]" />
            <Input 
              value={search}
              onChange={handleSearchChange}
              placeholder="Search for a country..." 
              className="pl-16 h-16 text-lg glass border-white/15 shadow-xl rounded-2xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl space-y-12">
        <div className="space-y-6 animate-fade-up delay-100">
          <div className="flex flex-wrap gap-3">
            <button 
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm border",
                continent === null 
                  ? "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white border-transparent glow-blue" 
                  : "glass text-white/80 border-white/15 hover:bg-white/10"
              )}
              onClick={() => setContinent(null)}
            >
              All Regions
            </button>
            {continents?.map(c => (
              <button 
                key={c.continent}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm border",
                  continent === c.continent 
                    ? "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white border-transparent glow-blue" 
                    : "glass text-white/80 border-white/15 hover:bg-white/10"
                )}
                onClick={() => setContinent(c.continent)}
              >
                {c.continent}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-2">
               <span className="label-eyebrow text-white/50">Language:</span>
               <div className="flex gap-2 flex-wrap">
                 {["Arabic", "Spanish", "French", "English", "Hindi", "Chinese", "Hebrew", "Japanese"].map(lang => (
                   <button
                    key={lang}
                    onClick={() => setLanguage(language === lang ? null : lang)}
                    className={cn(
                      "min-h-9 text-xs px-3 py-1 rounded-full border transition-all",
                      language === lang ? "bg-[#FBBF24] border-[#FBBF24] text-[#0F172A] glow-gold" : "glass text-white/70 border-white/15 hover:border-[#FBBF24]/50"
                    )}
                   >
                     {lang}
                   </button>
                 ))}
               </div>
             </div>

             <div className="flex items-center gap-2">
               <span className="label-eyebrow text-white/50">Religion:</span>
               <div className="flex gap-2 flex-wrap">
                 {["Christianity", "Islam", "Hinduism", "Buddhism", "Judaism"].map(rel => (
                   <button
                    key={rel}
                    onClick={() => setReligion(religion === rel ? null : rel)}
                    className={cn(
                      "min-h-9 text-xs px-3 py-1 rounded-full border transition-all",
                      religion === rel ? "bg-[#FBBF24] border-[#FBBF24] text-[#0F172A] glow-gold" : "glass text-white/70 border-white/15 hover:border-[#FBBF24]/50"
                    )}
                   >
                     {rel}
                   </button>
                 ))}
               </div>
             </div>
          </div>
          
          <div className="text-white/60 text-sm font-serif italic">
            Showing {activeData?.length || 0} of 195 nations
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loadingContinents || isSearching ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-3xl bg-white/5" />
            ))
          ) : activeData?.length === 0 ? (
            <div className="col-span-full py-24 text-center space-y-4 animate-fade-up">
              <MapPin className="mx-auto h-16 w-16 text-white/20" />
              <p className="text-2xl text-white font-serif">No countries found.</p>
            </div>
          ) : (
            activeData?.map((country, i) => (
              <Link key={country.code} href={`/country/${country.code}`}>
                <div 
                  className="group glass-panel rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border-none h-full cursor-pointer flex flex-col transition-all duration-500 hover:-translate-y-2 hover:glow-blue animate-fade-up"
                  style={{ animationDelay: `${(i % 12) * 0.05}s` }}
                >
                  <div className="aspect-[4/3] bg-[#0F172A] relative overflow-hidden">
                    {country.coverImageUrl ? (
                      <img 
                        src={country.coverImageUrl} 
                        alt={country.name} 
                        onError={IMAGE_ON_ERROR}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    {country.flagUrl && (
                      <img 
                        src={country.flagUrl} 
                        className="absolute bottom-4 left-4 w-12 h-auto object-cover rounded shadow-md border border-white/20"
                        alt="Flag"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 bg-transparent">
                    <p className="label-eyebrow text-[#60A5FA] mb-2">{country.continent}</p>
                    <h3 className="font-serif font-bold text-xl text-white group-hover:text-white transition-colors">{country.name}</h3>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
