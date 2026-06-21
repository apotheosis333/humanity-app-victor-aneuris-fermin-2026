import React, { useState } from "react";
import { useGetPledgeCount } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHumanityScore } from "@/hooks/useHumanityScore";
import { Loader2, Heart, ShieldCheck, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLEDGE_TEXT = [
  "I will seek understanding before judgment.",
  "I will value the dignity of every human being.",
  "I will remain curious about cultures different from my own.",
  "I recognize that humanity is stronger when we learn from one another."
];

export default function Pledge() {
  const { data: pledgeCount, refetch: refetchCount } = useGetPledgeCount();
  const { trackPledge } = useHumanityScore();
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [formData, setFormData] = useState({ name: "", country: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      trackPledge();
      setSigned(true);
      refetchCount();
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-24 px-4 relative">
      <div className="max-w-5xl w-full relative z-10 space-y-16">
        <div className="text-center space-y-6 animate-fade-up">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/20 glow-blue/40"
          >
            <Heart className="w-10 h-10 text-[#60A5FA] fill-current" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight">The Hu<span className="text-[#FBBF24] text-glow-gold">MAN</span>ity Pledge</h1>
          <div className="flex items-center justify-center gap-2 text-xl text-white/70">
            <Users className="w-6 h-6 text-[#FBBF24]" />
            <span>Join <span className="text-white font-bold">{pledgeCount?.count?.toLocaleString() || "..." || "0"}</span> people who have pledged</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!signed ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-8 glass-panel p-8 md:p-12 rounded-3xl animate-fade-up delay-100">
                <div className="space-y-8">
                  {PLEDGE_TEXT.map((text, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="mt-1.5 w-6 h-6 rounded-full border border-[#60A5FA]/50 flex items-center justify-center flex-shrink-0 bg-[#2563EB]/10">
                        <div className="w-2 h-2 bg-[#60A5FA] rounded-full glow-blue"></div>
                      </div>
                      <p className="text-lg md:text-xl font-serif text-white/90 leading-relaxed italic">"{text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center animate-fade-up delay-200">
                <Card className="glass-panel border-none rounded-3xl p-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8]"></div>
                  <CardContent className="p-0 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-serif text-white">Sign the Pledge</h3>
                      <p className="text-white/60">Add your voice to the global family of humanity.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label className="label-eyebrow text-[#60A5FA]">Your Name (Optional)</Label>
                          <div className="relative">
                            <Input 
                              placeholder="Jane Doe" 
                              className="h-14 glass border-white/15 text-white placeholder:text-white/30 pl-12 rounded-xl focus:ring-[#2563EB] focus:border-[#2563EB]" 
                              value={formData.name}
                              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                            />
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="label-eyebrow text-[#60A5FA]">Your Country (Optional)</Label>
                          <div className="relative">
                            <Input 
                              placeholder="Where are you from?" 
                              className="h-14 glass border-white/15 text-white placeholder:text-white/30 pl-12 rounded-xl focus:ring-[#2563EB] focus:border-[#2563EB]" 
                              value={formData.country}
                              onChange={e => setFormData(f => ({ ...f, country: e.target.value }))}
                            />
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          </div>
                        </div>
                      </div>

                      <Button 
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white font-bold text-lg rounded-full glow-blue transition-transform hover:scale-[1.02]"
                      >
                        {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "I Take The Pledge"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 space-y-8 glass-panel rounded-3xl max-w-2xl mx-auto"
            >
              <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/20 glow-gold/40">
                <ShieldCheck className="w-16 h-16 text-[#FBBF24]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-serif text-white">Welcome Home.</h2>
                <p className="text-2xl text-white/70">You have joined the family of humanity.</p>
              </div>
              <Button 
                variant="outline" 
                size="lg" 
                className="mt-8 glass border-white/15 text-white hover:bg-white/10 rounded-full h-14 px-12 text-lg"
                onClick={() => setSigned(false)}
              >
                Return to Pledge
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
