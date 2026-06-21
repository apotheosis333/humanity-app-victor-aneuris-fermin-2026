import React, { useState } from "react";
import { useListMilestones, getListMilestonesQueryKey, useCreateMilestone } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Palette, Music, Utensils, Languages, Trophy, Heart, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<string, React.ReactNode> = {
  art: <Palette className="w-6 h-6" />,
  music: <Music className="w-6 h-6" />,
  cuisine: <Utensils className="w-6 h-6" />,
  language: <Languages className="w-6 h-6" />,
  sport: <Trophy className="w-6 h-6" />,
  religion: <Heart className="w-6 h-6" />,
  tradition: <Sparkles className="w-6 h-6" />
};

export default function CountryCulture({ code }: { code: string }) {
  const { data: milestones, isLoading } = useListMilestones(code, {
    query: { enabled: !!code, queryKey: getListMilestonesQueryKey(code) }
  });

  const [filter, setFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMilestone = useCreateMilestone();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "art",
    year: "",
    imageUrl: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMilestone.mutate(
      { 
        code, 
        data: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          year: formData.year ? Number(formData.year) : undefined,
          imageUrl: formData.imageUrl || undefined
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Milestone added" });
          queryClient.invalidateQueries({ queryKey: getListMilestonesQueryKey(code) });
          setIsDialogOpen(false);
          setFormData({ title: "", description: "", category: "art", year: "", imageUrl: "" });
        },
        onError: () => {
          toast({ title: "Failed to add milestone", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-2xl bg-white/5 animate-pulse-glow" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  const filteredMilestones = filter === "all" 
    ? milestones 
    : milestones?.filter(m => m.category === filter);

  return (
    <div className="py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-white/10 pb-8">
        <div>
          <span className="label-eyebrow text-[#FBBF24]/80">Heritage</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Cultural Milestones</h2>
          <div className="accent-rule mt-3" />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[220px] h-12 rounded-full glass border-white/10 text-white font-semibold focus:ring-[#2563EB]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-white/10 text-white">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="art">Art & Architecture</SelectItem>
              <SelectItem value="music">Music & Dance</SelectItem>
              <SelectItem value="cuisine">Cuisine</SelectItem>
              <SelectItem value="language">Language & Literature</SelectItem>
              <SelectItem value="tradition">Traditions</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0 h-12 px-6 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:glow-blue text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95">
                <Plus className="h-5 w-5" /> Document Culture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl glass-strong border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-white">Document Cultural Heritage</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Title</label>
                  <Input className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Description</label>
                  <Textarea className="min-h-[120px] glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Category</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger className="h-12 glass border-white/10 text-white focus-visible:ring-[#2563EB]"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-strong border-white/10 text-white">
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="cuisine">Cuisine</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                        <SelectItem value="sport">Sport</SelectItem>
                        <SelectItem value="religion">Religion</SelectItem>
                        <SelectItem value="tradition">Tradition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Year (Optional)</label>
                    <Input className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Image URL</label>
                  <Input className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
                <Button type="submit" className="w-full h-14 text-lg rounded-full bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue transition-transform hover:scale-[1.02]" disabled={createMilestone.isPending}>Save Heritage</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!filteredMilestones || filteredMilestones.length === 0 ? (
        <div className="text-center py-32 space-y-6 glass-panel rounded-3xl animate-fade-up">
          <Palette className="h-16 w-16 text-[#60A5FA]/40 mx-auto" />
          <h3 className="text-3xl font-serif text-white italic">The canvas is blank.</h3>
          <p className="text-lg text-white/50 max-w-md mx-auto">No cultural milestones found for this category. Add the first piece of heritage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMilestones.map((milestone, i) => (
            <div key={milestone.id} className="group glass-panel rounded-2xl overflow-hidden flex flex-col relative transition-all duration-500 hover:-translate-y-2 hover:glow-blue animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#60A5FA] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>
              {milestone.imageUrl ? (
                <div className="h-64 w-full overflow-hidden relative">
                  <div className="absolute top-4 right-4 glass text-[#FBBF24] p-3 rounded-full shadow-lg z-10 border border-white/20">
                    {categoryIcons[milestone.category || "tradition"] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] to-transparent z-0" />
                  <img src={milestone.imageUrl} alt={milestone.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" />
                </div>
              ) : (
                <div className="h-48 w-full bg-[#0F172A]/50 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at center, #60A5FA 0%, transparent 70%)' }}></div>
                  <div className="glass text-[#FBBF24] p-5 rounded-full shadow-xl relative z-10 ring-1 ring-white/20">
                    {categoryIcons[milestone.category || "tradition"] || <Sparkles className="w-8 h-8" />}
                  </div>
                </div>
              )}
              
              <div className="p-8 flex-1 flex flex-col">
                {milestone.year && (
                  <span className="text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-3 block">Circa {milestone.year}</span>
                )}
                <h3 className="font-serif text-2xl font-bold text-white mb-4 line-clamp-2">{milestone.title}</h3>
                <p className="text-white/70 text-base leading-relaxed flex-1">
                  {milestone.description}
                </p>
                
                {!milestone.imageUrl && milestone.category && (
                  <div className="mt-6 pt-6 border-t border-white/10 inline-flex">
                    <span className="text-xs uppercase tracking-widest font-bold text-[#60A5FA] bg-[#60A5FA]/10 px-4 py-2 rounded-full">
                      {milestone.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
