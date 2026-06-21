import React, { useState } from "react";
import { useListTimeline, getListTimelineQueryKey, useCreateTimelineEvent } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Image as ImageIcon, Video, Music, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CountryTimeline({ code }: { code: string }) {
  const { data: timelineEvents, isLoading } = useListTimeline(code, {
    query: { enabled: !!code, queryKey: getListTimelineQueryKey(code) }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createEvent = useCreateTimelineEvent();

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    category: "history",
    mediaUrl: "",
    mediaType: "none"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent.mutate(
      { 
        code, 
        data: {
          year: formData.year,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          mediaUrl: formData.mediaUrl || undefined,
          mediaType: formData.mediaType !== "none" ? formData.mediaType : undefined
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Event added to timeline" });
          queryClient.invalidateQueries({ queryKey: getListTimelineQueryKey(code) });
          setIsDialogOpen(false);
          setFormData({ year: new Date().getFullYear(), title: "", description: "", category: "history", mediaUrl: "", mediaType: "none" });
        },
        onError: () => {
          toast({ title: "Failed to add event", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full max-w-4xl mx-auto rounded-xl bg-white/5 animate-pulse-glow" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  const events = timelineEvents?.sort((a, b) => a.year - b.year) || [];

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
        <div>
          <span className="label-eyebrow text-[#FBBF24]/80">History</span>
          <h2 className="text-3xl md:text-4xl font-serif text-white mt-2">Chronicles of Time</h2>
          <div className="accent-rule mt-3" />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glass border-white/15 text-white hover:bg-white/10 gap-2 h-12 px-6 rounded-full text-base transition-transform hover:scale-[1.03] active:scale-95">
              <Plus className="h-5 w-5" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl glass-strong border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white">Add a Timeline Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Year</label>
                  <Input type="number" className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Category</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="h-12 glass border-white/10 text-white focus-visible:ring-[#2563EB]"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-strong border-white/10 text-white">
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="politics">Politics</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                  <label className="text-sm font-semibold text-white/70">Media Type</label>
                  <Select value={formData.mediaType} onValueChange={(v) => setFormData({...formData, mediaType: v})}>
                    <SelectTrigger className="h-12 glass border-white/10 text-white focus-visible:ring-[#2563EB]"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-strong border-white/10 text-white">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Media URL</label>
                  <Input className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" value={formData.mediaUrl} onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})} disabled={formData.mediaType === "none"} />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:glow-blue text-white rounded-full transition-transform hover:scale-[1.02]" disabled={createEvent.isPending}>Save Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 space-y-6 glass-panel rounded-3xl animate-fade-up">
          <Clock className="h-16 w-16 text-[#60A5FA]/30 mx-auto" />
          <h3 className="text-3xl font-serif text-white">The sands of time are waiting.</h3>
          <p className="text-lg text-white/60 max-w-md mx-auto">No historical events recorded yet. Be the first to chronicle a significant moment in this nation's history.</p>
        </div>
      ) : (
        <div className="relative border-l-[2px] border-white/10 ml-4 md:ml-12 pl-10 md:pl-16 space-y-24">
          {events.map((event, i) => (
            <div key={event.id} className="relative group animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              {/* Timeline dot */}
              <div className="absolute -left-[42px] md:-left-[66px] top-2 h-4 w-4 rounded-full bg-[#0F172A] border-[3px] border-[#60A5FA] group-hover:border-[#FBBF24] group-hover:glow-gold transition-colors duration-500 z-10" />
              {/* Year label */}
              <div className="absolute -left-[140px] md:-left-[200px] top-1 text-2xl md:text-3xl font-serif font-bold text-[#FBBF24] w-24 md:w-32 text-right text-glow-gold">
                {event.year < 0 ? `${Math.abs(event.year)} BC` : event.year}
              </div>
              
              <div className="glass-panel border-l-4 border-l-[#60A5FA] p-8 rounded-2xl rounded-l-none group-hover:border-l-[#FBBF24] group-hover:glow-blue transition-all duration-500 hover:-translate-y-2 relative">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">{event.title}</h3>
                    {event.category && (
                      <span className="label-eyebrow bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[#60A5FA]">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 leading-relaxed text-lg mb-8">{event.description}</p>
                  
                  {event.mediaUrl && event.mediaType && (
                    <div className="mt-8 rounded-xl overflow-hidden glass border-white/10 bg-white/5">
                      {event.mediaType === "image" && (
                        <div className="relative group/media">
                          <img src={event.mediaUrl} alt={event.title} className="w-full h-auto max-h-[500px] object-cover opacity-80 mix-blend-lighten" />
                          <div className="absolute inset-0 bg-[#0F172A]/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      )}
                      {event.mediaType === "video" && (
                        <div className="aspect-video relative flex items-center justify-center">
                          <Video className="h-16 w-16 text-white/30" />
                          <span className="absolute bottom-6 right-6 label-eyebrow text-[#0F172A] bg-[#FBBF24] px-4 py-1.5 rounded-full shadow-sm">Video</span>
                        </div>
                      )}
                      {event.mediaType === "audio" && (
                        <div className="p-6 flex items-center gap-6">
                          <div className="h-14 w-14 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-full flex items-center justify-center glow-blue">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                              <div className="h-full bg-[#60A5FA] w-1/3 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
