import React, { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { useListCountries } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CountryCombobox } from "@/components/country-combobox";
import { apiUrl } from "@/lib/api-config";
import {
  Loader2,
  User,
  Briefcase,
  BadgeCheck,
  Quote,
  Shuffle,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_OCCUPATIONS = [
  "Teacher", "Farmer", "Doctor", "Student", "Artist", "Parent", "Worker", "Elder", "Entrepreneur",
];

const GENDERS = [
  { id: "any", label: "Any" },
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "child", label: "Child" },
];

const LOADING_MESSAGES = [
  "Crossing oceans and time zones…",
  "Waking up in a distant home…",
  "Listening to the morning sounds…",
  "Sitting down for a shared meal…",
  "Walking the streets of a new world…",
  "Finding the beauty in an ordinary day…",
];

export default function Walk() {
  const { data: countries } = useListCountries();
  const search = useSearch();
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<any>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    country: "",
    age: 30,
    occupation: "",
    gender: "any",
  });

  // Pre-fill country from ?country=Name (used by "A Day In My Life" links)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const c = params.get("country");
    if (c) setFormData((f) => ({ ...f, country: c }));
  }, [search]);

  // Rotate evocative loading messages
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2200);
    return () => clearInterval(id);
  }, [loading]);

  const surpriseMe = () => {
    if (!countries?.length) return;
    const c = countries[Math.floor(Math.random() * countries.length)];
    const occ = PRESET_OCCUPATIONS[Math.floor(Math.random() * PRESET_OCCUPATIONS.length)];
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)].id;
    const age = Math.floor(Math.random() * 70) + 12;
    setFormData({ country: c.name, occupation: occ, gender, age });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.occupation) return;

    setLoading(true);
    setNarrative(null);
    setLoadingMsg(LOADING_MESSAGES[0]);
    try {
      const response = await fetch(apiUrl("/api/walk-in-shoes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      setNarrative(data);
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    } catch (error) {
      setNarrative({ error: "We couldn't complete this journey right now. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!narrative?.narrative) return;
    navigator.clipboard.writeText(narrative.narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCountry = countries?.find((c) => c.name === formData.country);
  const paragraphs: string[] = narrative?.narrative
    ? narrative.narrative.split(/\n\s*\n/).filter((p: string) => p.trim())
    : [];

  return (
    <div className="w-full pb-28">
      <div className="container mx-auto px-6 pt-24 max-w-4xl space-y-12">
        <div className="text-center space-y-4 flex flex-col items-center animate-fade-up">
          <span className="label-eyebrow text-[#FBBF24]/80">From their eyes</span>
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight">
            Walk In <span className="text-gradient-gold">Their</span> Shoes
          </h1>
          <div className="accent-rule mt-3" />
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed pt-2">
            Step into the life of someone from another part of our world. AI-generated for education and empathy.
          </p>
        </div>

        <Card className="glass-panel rounded-3xl overflow-hidden animate-fade-up delay-100">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="label-eyebrow text-[#FBBF24]/80">
                      Select Country
                    </Label>
                    <button
                      type="button"
                      onClick={surpriseMe}
                      className="text-xs font-semibold text-[#60A5FA] hover:text-[#FBBF24] flex items-center gap-1 transition-colors"
                    >
                      <Shuffle className="w-3 h-3" /> Surprise me
                    </button>
                  </div>
                  <CountryCombobox
                    countries={countries}
                    value={formData.country}
                    valueKey="name"
                    dark
                    placeholder="Where would you like to go?"
                    triggerClassName="h-12"
                    onChange={(val) => setFormData((f) => ({ ...f, country: val }))}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="label-eyebrow text-[#FBBF24]/80">
                    Age: {formData.age}
                  </Label>
                  <Slider
                    value={[formData.age]}
                    max={100}
                    min={5}
                    step={1}
                    onValueChange={(val) => setFormData((f) => ({ ...f, age: val[0] }))}
                    className="py-4"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="label-eyebrow text-[#FBBF24]/80">
                    Perspective
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {GENDERS.map((g) => (
                      <Button
                        key={g.id}
                        type="button"
                        variant={formData.gender === g.id ? "default" : "outline"}
                        className={
                          formData.gender === g.id
                            ? "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] border-transparent text-white h-10 rounded-xl"
                            : "glass border-white/15 text-white hover:bg-white/10 h-10 rounded-xl"
                        }
                        onClick={() => setFormData((f) => ({ ...f, gender: g.id }))}
                      >
                        {g.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="label-eyebrow text-[#FBBF24]/80">
                    Occupation
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_OCCUPATIONS.map((occ) => (
                      <Button
                        key={occ}
                        type="button"
                        variant={formData.occupation === occ ? "default" : "outline"}
                        className={
                          formData.occupation === occ
                            ? "bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] border-transparent text-white rounded-xl"
                            : "glass border-white/15 text-white hover:bg-white/10 rounded-xl"
                        }
                        onClick={() => setFormData((f) => ({ ...f, occupation: occ }))}
                      >
                        {occ}
                      </Button>
                    ))}
                  </div>
                  <Input
                    value={
                      PRESET_OCCUPATIONS.includes(formData.occupation) ? "" : formData.occupation
                    }
                    placeholder="Or type your own…"
                    className="glass border-white/15 text-white h-12 mt-2 placeholder:text-white/40 rounded-xl"
                    onChange={(e) => setFormData((f) => ({ ...f, occupation: e.target.value }))}
                  />
                </div>

                <Button
                  disabled={loading || !formData.country || !formData.occupation}
                  className="w-full h-14 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white font-bold text-lg rounded-full glow-blue transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Step into their shoes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#60A5FA] border-transparent animate-spin" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMsg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-white/70 font-serif text-lg italic"
              >
                {loadingMsg}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {narrative && !loading && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 scroll-mt-24"
            >
              {narrative.error ? (
                <div className="glass border-red-500/30 rounded-2xl p-8 text-center text-red-200">
                  {narrative.error}
                </div>
              ) : (
                <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden animate-fade-up">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Quote className="w-32 h-32 text-white" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
                      <div className="flex items-center gap-4">
                        {selectedCountry?.flagUrl && (
                          <img
                            src={selectedCountry.flagUrl}
                            className="w-16 h-10 object-cover rounded shadow-lg border border-white/20"
                            alt="Flag"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <div>
                          <h2 className="text-3xl font-serif text-white">
                            {selectedCountry?.name}
                          </h2>
                          <div className="flex items-center gap-4 text-white/60 text-sm mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" /> {formData.age} years old
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" /> {formData.occupation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleCopy}
                          className="inline-flex items-center gap-2 glass border-white/15 text-white hover:bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          {copied ? (
                            <><Check className="w-4 h-4" /> Copied</>
                          ) : (
                            <><Copy className="w-4 h-4" /> Copy</>
                          )}
                        </button>
                        <div className="inline-flex items-center gap-2 glass text-glow-gold border-[#FBBF24]/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                          <BadgeCheck className="w-4 h-4 text-[#FBBF24]" /> Their Shoes
                        </div>
                      </div>
                    </div>

                    <div className="max-w-none space-y-6">
                      {paragraphs.map((p, i) => (
                        <p
                          key={i}
                          className={
                            i === 0
                              ? "text-xl md:text-2xl leading-relaxed font-serif text-white/95 first-letter:text-6xl first-letter:text-[#FBBF24] first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:font-serif"
                              : "text-lg md:text-xl leading-relaxed font-serif text-white/85"
                          }
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
