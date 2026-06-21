import React, { useEffect, useState } from "react";
import { useGetCountry, getGetCountryQueryKey, useGetCountryStats, getGetCountryStatsQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CountryTimeline from "./timeline";
import CountryCulture from "./culture";
import CountryStories from "./stories";
import { ArrowLeft, MapPin, Users, Building, Activity, Languages, Globe, Shield, Landmark, Maximize, Footprints, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api-config";
import { useHumanityScore } from "@/hooks/useHumanityScore";

const IMAGE_ON_ERROR = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget;
  t.onerror = null;
  t.style.display = 'none';
  t.parentElement!.style.background = 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #0F172A 100%)';
};

export default function CountryDetail() {
  const params = useParams();
  const code = params.code as string;
  const [location, setLocation] = useLocation();
  const { trackCountryVisit } = useHumanityScore();
  const [phrases, setPhrases] = useState<any[]>([]);
  const [loadingPhrases, setLoadingPhrases] = useState(false);

  useEffect(() => {
    if (code) {
      trackCountryVisit(code);
    }
  }, [code]);

  const { data: country, isLoading: loadingCountry } = useGetCountry(code, {
    query: { enabled: !!code, queryKey: getGetCountryQueryKey(code) }
  });

  const { data: stats, isLoading: loadingStats } = useGetCountryStats(code, {
    query: { enabled: !!code, queryKey: getGetCountryStatsQueryKey(code) }
  });

  const currentTab = location.endsWith("/timeline") ? "timeline" 
                   : location.endsWith("/culture") ? "culture" 
                   : location.endsWith("/stories") ? "stories" 
                   : location.endsWith("/phrases") ? "phrases"
                   : "timeline"; 

  const handleTabChange = (value: string) => {
    setLocation(`/country/${code}/${value}`);
  };

  useEffect(() => {
    if (currentTab === "phrases" && code) {
      fetchPhrases();
    }
  }, [currentTab, code]);

  const fetchPhrases = async () => {
    setLoadingPhrases(true);
    try {
      const res = await fetch(apiUrl(`/api/countries/${code}/phrases`));
      const data = await res.json();
      setPhrases(data);
    } catch (e) {
      // 
    } finally {
      setLoadingPhrases(false);
    }
  };

  if (loadingCountry) {
    return (
      <div className="w-full flex flex-col space-y-4">
        <Skeleton className="w-full h-80 md:h-[500px] bg-white/5" />
        <div className="container mx-auto px-6 space-y-4 max-w-6xl mt-8">
          <Skeleton className="h-12 w-1/3 bg-white/5" />
          <Skeleton className="h-4 w-1/2 bg-white/5" />
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="container mx-auto px-6 py-32 text-center max-w-2xl glass-panel rounded-3xl mt-12">
        <MapPin className="w-16 h-16 text-white/50 mx-auto mb-6" />
        <h1 className="text-3xl font-serif text-white mb-4">Country not found.</h1>
        <Link href="/explore" className="text-[#60A5FA] font-semibold hover:text-[#FBBF24] transition-colors inline-block text-lg">Return to Explore</Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-32 relative">
      {/* Hero Section */}
      <div className="w-full relative h-80 md:h-[500px] overflow-hidden">
        {country.coverImageUrl ? (
          <img src={country.coverImageUrl} alt={country.name} onError={IMAGE_ON_ERROR} className="w-full h-full object-cover opacity-60 mix-blend-screen" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/60 via-[#0b1120]/30 to-[#0b1120]" />
        
        <div className="absolute top-6 left-6 z-20">
          <Link href="/explore" className="flex items-center gap-2 text-white glass border-white/10 hover:bg-white/10 px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-bold tracking-wide">
            <ArrowLeft className="h-4 w-4" /> Back to Explore
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full z-10">
          <div className="container mx-auto px-6 pb-12 flex flex-col md:flex-row items-start md:items-end gap-8 animate-fade-up">
            {country.flagUrl && (
              <img src={country.flagUrl} alt={`${country.name} flag`} className="w-32 md:w-48 h-auto shadow-2xl rounded-md border-2 border-white/20" />
            )}
            <div className="pb-2">
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white drop-shadow-lg text-glow-blue">{country.name}</h1>
              <p className="text-xl text-[#FBBF24] font-medium flex items-center gap-2 mt-4 tracking-wide uppercase text-glow-gold">
                <MapPin className="h-5 w-5" /> {country.continent}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 space-y-16 max-w-7xl relative z-10">
        {/* Info & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-up delay-100">
          <div className="lg:col-span-2 space-y-6 text-xl leading-relaxed text-white/80">
            <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-[#60A5FA] first-letter:mr-3 first-letter:float-left first-letter:leading-none">
              {country.summary}
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-8 shadow-xl space-y-8 text-white h-fit">
            <h3 className="font-serif text-2xl font-bold flex items-center gap-3 border-l-4 border-[#FBBF24] pl-4 text-white">
              <Activity className="h-6 w-6 text-[#FBBF24]" /> Fact File
            </h3>
            <div className="space-y-6 text-sm md:text-base">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Building className="h-4 w-4" /> Capital</span>
                <span className="font-medium">{country.capital || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Users className="h-4 w-4" /> Population</span>
                <span className="font-medium">{country.population?.toLocaleString() || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Maximize className="h-4 w-4" /> Area</span>
                <span className="font-medium">{country.areaKm2 ? `${country.areaKm2.toLocaleString()} km²` : "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Languages className="h-4 w-4" /> Languages</span>
                <span className="font-medium text-right max-w-[50%]">{country.languages || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Landmark className="h-4 w-4" /> Government</span>
                <span className="font-medium text-right max-w-[50%]">{country.governmentType || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Shield className="h-4 w-4" /> Religion</span>
                <span className="font-medium text-right max-w-[50%]">{country.religion || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white/60 flex items-center gap-2"><Globe className="h-4 w-4" /> Currency</span>
                <span className="font-medium">{country.currency || "Unknown"}</span>
              </div>
              
              {!loadingStats && stats && (
                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Timeline Events</span>
                    <span className="font-bold text-[#FBBF24] text-xl">{stats.timelineCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Cultural Milestones</span>
                    <span className="font-bold text-[#FBBF24] text-xl">{stats.milestoneCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Stories Shared</span>
                    <span className="font-bold text-[#FBBF24] text-xl">{stats.storyCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Teaser Section */}
        <div className="glass-panel border-l-4 border-l-[#FBBF24] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group animate-fade-up delay-200">
           <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#FBBF24]/10 text-[#FBBF24] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-[#FBBF24]/20">
                <Footprints className="w-4 h-4" /> A Day In My Life
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-white">What is it like to live in {country.name}?</h2>
              <p className="text-lg text-white/60 font-sans italic leading-relaxed">
                Step into the shoes of a local resident. Experience the sights, sounds, and daily rhythms of this beautiful nation through our immersive AI narrative.
              </p>
           </div>
           <Link href={`/walk?country=${encodeURIComponent(country.name)}`}>
             <Button size="lg" className="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:glow-blue text-white rounded-full px-10 h-16 text-lg shadow-xl transition-transform group-hover:scale-[1.03]">
               Walk In Their Shoes
             </Button>
           </Link>
        </div>

        {/* Content Tabs */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full pt-8 animate-fade-up delay-300">
          <div className="border-b border-white/10 mb-12">
            <TabsList className="w-full max-w-2xl flex justify-start gap-8 bg-transparent h-auto p-0 rounded-none">
              <TabsTrigger 
                value="timeline" 
                className={cn(
                  "font-serif text-xl rounded-none pb-4 border-b-2 bg-transparent shadow-none px-0 transition-colors",
                  currentTab === "timeline" ? "border-[#FBBF24] text-[#FBBF24]" : "border-transparent text-white/50 hover:text-white"
                )}
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="culture" 
                className={cn(
                  "font-serif text-xl rounded-none pb-4 border-b-2 bg-transparent shadow-none px-0 transition-colors",
                  currentTab === "culture" ? "border-[#FBBF24] text-[#FBBF24]" : "border-transparent text-white/50 hover:text-white"
                )}
              >
                Culture
              </TabsTrigger>
              <TabsTrigger 
                value="stories" 
                className={cn(
                  "font-serif text-xl rounded-none pb-4 border-b-2 bg-transparent shadow-none px-0 transition-colors",
                  currentTab === "stories" ? "border-[#FBBF24] text-[#FBBF24]" : "border-transparent text-white/50 hover:text-white"
                )}
              >
                Stories
              </TabsTrigger>
              <TabsTrigger 
                value="phrases" 
                className={cn(
                  "font-serif text-xl rounded-none pb-4 border-b-2 bg-transparent shadow-none px-0 transition-colors",
                  currentTab === "phrases" ? "border-[#FBBF24] text-[#FBBF24]" : "border-transparent text-white/50 hover:text-white"
                )}
              >
                Phrases
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="timeline" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <CountryTimeline code={code} />
          </TabsContent>
          <TabsContent value="culture" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <CountryCulture code={code} />
          </TabsContent>
          <TabsContent value="stories" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <CountryStories code={code} />
          </TabsContent>
          <TabsContent value="phrases" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingPhrases ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse-glow" style={{ animationDelay: `${i * 0.1}s` }} />)
              ) : phrases?.length > 0 ? (
                phrases.map((p, idx) => (
                  <div key={idx} className="glass-panel p-8 rounded-2xl border border-white/10 hover:glow-blue hover:-translate-y-1 transition-all duration-500 space-y-4 animate-fade-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                    <div className="flex items-center gap-2 text-[#60A5FA] text-xs font-bold uppercase tracking-widest">
                       <BookOpen className="w-4 h-4" /> {p.language}
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-serif font-bold text-white">{p.phrase}</p>
                      <p className="text-lg text-white/60 italic">"{p.translation}"</p>
                    </div>
                    <p className="text-sm text-[#FBBF24] font-bold font-sans uppercase tracking-tighter">{p.romanization}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center text-white/40 font-serif text-xl italic glass-panel rounded-3xl">
                  Common phrases for this nation are being added to our library.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
