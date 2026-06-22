import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useListFeaturedCountries, useListCountries, useGetDailyCountry, useGetRandomCountry } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe2, MapPin, Footprints, History, Heart, ArrowRightLeft, Sparkles, Compass, ArrowRight, Utensils } from "lucide-react";
import { useGetCurrentDinner } from "@workspace/api-client-react";
import { WorldGlobe } from "@/components/globe";
import { Button } from "@/components/ui/button";

const IMAGE_ON_ERROR = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const t = e.currentTarget;
  t.onerror = null;
  t.style.display = "none";
  t.parentElement!.style.background = "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #0F172A 100%)";
};

const QUICK_LINKS = [
  { label: "Walk In Their Shoes", desc: "Live a day across the world", icon: Footprints, href: "/walk" },
  { label: "Humanity Timeline", desc: "Civilizations, side by side", icon: History, href: "/humanity-timeline" },
  { label: "Take The Pledge", desc: "Seek understanding first", icon: Heart, href: "/pledge" },
  { label: "Compare Nations", desc: "Find what we share", icon: ArrowRightLeft, href: "/compare" },
];

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { data: featuredCountries, isLoading: loadingFeatured } = useListFeaturedCountries();
  const { data: allCountries, isLoading: loadingAll } = useListCountries();
  const { data: dailyCountry } = useGetDailyCountry();
  const { data: randomCountry, refetch: refetchRandom } = useGetRandomCountry({
    query: { enabled: false, queryKey: ["getRandomCountry"] },
  });
  void randomCountry;
  const { data: dinner } = useGetCurrentDinner();

  const handleRandomExplore = async () => {
    const { data } = await refetchRandom();
    if (data) setLocation(`/country/${data.code}`);
  };

  return (
    <div className="w-full flex flex-col items-center pb-28 space-y-24">
      {/* ===== Cinematic Hero ===== */}
      <section className="w-full relative flex flex-col items-center justify-center text-center px-4 pt-24 pb-28 md:pt-36 md:pb-40 overflow-hidden">
        {/* Orbital rings */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="relative w-[640px] h-[640px] md:w-[900px] md:h-[900px]">
            <div className="absolute inset-0 rounded-full border border-[#2563EB]/20 animate-spin-slow">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#FBBF24] glow-gold" />
            </div>
            <div className="absolute inset-12 rounded-full border border-[#2563EB]/15" />
            <div className="absolute inset-28 rounded-full border border-[#FBBF24]/10" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18)_0%,transparent_65%)] blur-3xl" />
          </div>
        </div>

        <div className="relative z-10 space-y-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span className="label-eyebrow text-white/70">{t("hero.eyebrow")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tight leading-[1.05] animate-fade-up delay-100">
            {t("hero.titleMain")} <br className="hidden md:block" />
            <span className="text-gradient-gold italic">{t("hero.titleAccent")}</span>
          </h1>

          <p className="text-lg md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            {t("hero.subtitle")}
          </p>

          <div className="flex w-full flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-up delay-300">
            <Link href="/explore" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white rounded-full px-6 sm:px-9 h-14 text-base sm:text-lg glow-blue transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto">
                <Compass className="mr-2 h-5 w-5" /> {t("hero.ctaExplore")}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={handleRandomExplore}
              className="w-full glass border-white/15 text-white hover:bg-white/10 hover:text-white rounded-full px-6 sm:px-9 h-14 text-base sm:text-lg transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
            >
              <Sparkles className="mr-2 h-5 w-5 text-[#FBBF24]" /> {t("hero.ctaDiscover")}
            </Button>
          </div>

          <p className="font-serif italic text-white/55 text-base md:text-lg pt-8 animate-fade-up delay-400 animate-floaty">
            {t("hero.quote")}
          </p>
        </div>
      </section>

      {/* ===== Divider ===== */}
      <div className="w-full flex justify-center -my-12">
        <div className="flex items-center gap-4 w-full max-w-md px-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2563EB]/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24] glow-gold" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2563EB]/40" />
        </div>
      </div>

      {/* ===== Mission ===== */}
      <section className="w-full px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="glass-panel rounded-3xl p-5 sm:p-8 md:p-14 text-center animate-fade-up">
          <span className="label-eyebrow text-[#FBBF24]/80">Our Mission</span>
          <h2 className="text-3xl md:text-5xl font-serif text-white mt-3">
            A living library of <span className="text-gradient-gold italic">human civilization.</span>
          </h2>
          <div className="accent-rule mx-auto mt-5" />
          <div className="mt-8 space-y-6 text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            <p>
              Our mission is to help people explore every culture, every nation, every belief system, and every chapter of human history through knowledge, curiosity, and respect.
            </p>
            <p className="text-white/90">
              We believe understanding is stronger than division, curiosity is stronger than fear, and humanity is strongest when it learns from itself.
            </p>
          </div>
        </div>
      </section>

      {/* ===== World Dinner Table ===== */}
      <section className="w-full px-4 sm:px-6 max-w-5xl mx-auto">
        <Link href="/dinner-table">
          <div className="group relative overflow-hidden glass-panel rounded-3xl p-5 sm:p-8 md:p-12 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:glow-gold animate-fade-up">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12)_0%,transparent_60%)] pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center gap-8">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass border border-[#FBBF24]/30 group-hover:border-[#FBBF24]/60 transition-colors">
                <Utensils className="h-7 w-7 text-[#FBBF24]" />
              </span>
              <div className="flex-1 space-y-3">
                <span className="label-eyebrow text-[#FBBF24]/80">The World Dinner Table</span>
                {dinner?.question ? (
                  <h2 className="text-2xl md:text-4xl font-serif text-white leading-tight">
                    "{dinner.question.question}"
                  </h2>
                ) : (
                  <h2 className="text-2xl md:text-4xl font-serif text-white leading-tight">
                    One question. Every nation. One table.
                  </h2>
                )}
                <p className="text-white/65 leading-relaxed max-w-2xl">
                  Each week, one universal human question. People from every corner of the world pull up a
                  chair and share their answer. {dinner?.totalAnswers ? `${dinner.totalAnswers} voices have answered.` : "Add your voice."}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-[#FBBF24] font-semibold shrink-0 group-hover:gap-3 transition-all">
                Pull up a chair <ArrowRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ===== Quick Links ===== */}
      <div className="container mx-auto px-4 sm:px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {QUICK_LINKS.map((link, i) => (
            <Link key={i} href={link.href}>
              <div
                className="group glass-panel rounded-2xl p-4 sm:p-6 md:p-7 h-full cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:glow-blue animate-fade-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl glass border border-[#2563EB]/30 mb-5 transition-colors group-hover:border-[#FBBF24]/40">
                  <link.icon className="h-5 w-5 text-[#60A5FA] transition-colors group-hover:text-[#FBBF24]" />
                </span>
                <span className="block font-semibold text-base md:text-lg text-white">{link.label}</span>
                <span className="block text-sm text-white/50 mt-1">{link.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== Globe + Daily Nation ===== */}
      <section className="w-full px-4 sm:px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span className="label-eyebrow text-[#FBBF24]/80">From orbit</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Global Interactive Map</h2>
            <div className="accent-rule mt-3" />
          </div>
          <div className="glass-panel rounded-3xl p-3 md:p-4 overflow-hidden glow-blue/30">
            {loadingAll ? (
              <Skeleton className="w-full aspect-[2/1] bg-white/5 rounded-2xl" />
            ) : (
              <WorldGlobe countries={allCountries || []} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="label-eyebrow text-[#FBBF24]/80">Today</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Daily Nation</h2>
            <div className="accent-rule mt-3" />
          </div>
          {dailyCountry ? (
            <Link href={`/country/${dailyCountry.code}`}>
              <Card className="group cursor-pointer overflow-hidden glass-panel rounded-3xl h-full flex flex-col border-none p-0 gap-0 hover:-translate-y-2 hover:glow-gold transition-all duration-500">
                <div className="h-60 relative overflow-hidden">
                  {dailyCountry.coverImageUrl ? (
                    <img
                      src={dailyCountry.coverImageUrl}
                      alt={dailyCountry.name}
                      onError={IMAGE_ON_ERROR}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center">
                      <Globe2 className="h-20 w-20 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-transparent" />
                  <div className="absolute bottom-5 left-5 flex items-center gap-3">
                    {dailyCountry.flagUrl && (
                      <img src={dailyCountry.flagUrl} alt="Flag" className="w-11 h-7 object-cover rounded shadow-lg border border-white/20" />
                    )}
                    <h3 className="text-2xl font-serif text-white font-bold">{dailyCountry.name}</h3>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4 flex-1">
                  <div className="flex items-center gap-2 text-[#60A5FA] font-semibold text-xs uppercase tracking-widest">
                    <MapPin className="h-4 w-4" /> {dailyCountry.continent}
                  </div>
                  <p className="text-white/70 leading-relaxed line-clamp-4 font-serif italic text-lg">
                    "{dailyCountry.summary}"
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[#FBBF24] font-semibold group-hover:gap-2.5 transition-all">
                    Read their story <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Skeleton className="h-[480px] w-full rounded-3xl bg-white/5" />
          )}
        </div>
      </section>

      {/* ===== Featured Nations ===== */}
      <section className="w-full px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="label-eyebrow text-[#FBBF24]/80">Curated</span>
            <h2 className="text-4xl font-serif text-white mt-2">Featured Nations</h2>
            <div className="accent-rule mt-3" />
          </div>
          <Link href="/explore" className="group text-[#60A5FA] hover:text-[#FBBF24] font-semibold text-base flex items-center gap-2 transition-colors">
            View all 195 nations <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCountries?.map((country, i) => (
              <Link key={country.code} href={`/country/${country.code}`}>
                <Card
                  className="group cursor-pointer overflow-hidden glass-panel rounded-3xl border-none p-0 gap-0 h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:glow-blue animate-fade-up"
                  style={{ animationDelay: `${0.08 * i}s` }}
                >
                  <div className="h-52 w-full overflow-hidden relative">
                    {country.coverImageUrl ? (
                      <img
                        src={country.coverImageUrl}
                        alt={country.name}
                        onError={IMAGE_ON_ERROR}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-75"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 z-20 flex items-center gap-3">
                      {country.flagUrl && (
                        <img src={country.flagUrl} alt="Flag" className="w-10 h-7 object-cover shadow-md rounded-sm border border-white/20" />
                      )}
                      <h3 className="text-2xl font-serif text-white font-bold">{country.name}</h3>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 pt-5 px-6 pb-7">
                    <div className="label-eyebrow text-[#60A5FA]">{country.continent}</div>
                    <p className="line-clamp-3 text-sm text-white/65 leading-relaxed">{country.summary}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
