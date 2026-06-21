import React, { useState } from "react";
import { useListStories, getListStoriesQueryKey, useCreateStory } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, PenTool, Image as ImageIcon, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function CountryStories({ code }: { code: string }) {
  const { data: stories, isLoading } = useListStories(code, {
    query: { enabled: !!code, queryKey: getListStoriesQueryKey(code) }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStory = useCreateStory();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    imageUrl: "",
    audioUrl: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStory.mutate(
      { 
        code, 
        data: {
          title: formData.title,
          author: formData.author || "Anonymous",
          content: formData.content,
          imageUrl: formData.imageUrl || undefined,
          audioUrl: formData.audioUrl || undefined
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Story shared successfully" });
          queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey(code) });
          setIsDialogOpen(false);
          setFormData({ title: "", author: "", content: "", imageUrl: "", audioUrl: "" });
        },
        onError: () => {
          toast({ title: "Failed to share story", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto pt-8">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-2xl bg-white/5 animate-pulse-glow" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex flex-col items-center justify-center text-center mb-20 space-y-6 animate-fade-up">
        <div className="space-y-2 flex flex-col items-center">
          <span className="label-eyebrow text-[#FBBF24]/80">Personal Accounts</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white font-bold">Voices & Memories</h2>
          <div className="accent-rule mt-3" />
        </div>
        <p className="text-lg md:text-xl text-white/70 max-w-3xl leading-relaxed mt-4">
          History isn't just dates and facts—it's the lived experiences of real people. Read personal accounts, memories, and folklore from those connected to this land.
        </p>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-3 mt-6 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue font-sans font-semibold text-lg px-10 h-14 rounded-full shadow-xl transition-all hover:scale-[1.03] active:scale-95">
              <PenTool className="h-5 w-5" /> Share a Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl glass-strong border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl text-white">Write a Story</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="space-y-2">
                <label className="label-eyebrow text-white/70">Story Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="font-serif text-2xl h-14 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" placeholder="A Summer in the Village..." />
              </div>
              <div className="space-y-2">
                <label className="label-eyebrow text-white/70">Author (Optional)</label>
                <Input value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" placeholder="Anonymous" />
              </div>
              <div className="space-y-2">
                <label className="label-eyebrow text-white/70">The Story</label>
                <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required className="min-h-[300px] text-lg leading-relaxed glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB] resize-y" placeholder="Write your memory or narrative here..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="label-eyebrow text-white/70 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#60A5FA]"/> Image URL</label>
                  <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" placeholder="Optional accompanying photo" />
                </div>
                <div className="space-y-2">
                  <label className="label-eyebrow text-white/70 flex items-center gap-2"><Mic className="w-4 h-4 text-[#60A5FA]"/> Audio URL</label>
                  <Input value={formData.audioUrl} onChange={(e) => setFormData({...formData, audioUrl: e.target.value})} className="h-12 glass border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#2563EB]" placeholder="Optional voice recording" />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:glow-blue text-white rounded-full mt-6 transition-transform hover:scale-[1.02]" disabled={createStory.isPending}>Publish Story</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!stories || stories.length === 0 ? (
        <div className="text-center py-32 px-6 glass-panel rounded-[2rem] shadow-2xl relative overflow-hidden animate-fade-up">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)]"></div>
          <BookOpen className="h-20 w-20 text-[#FBBF24] mx-auto mb-8 relative z-10 opacity-70" />
          <h3 className="text-4xl font-serif text-white mb-6 relative z-10">No stories yet.</h3>
          <p className="text-white/70 max-w-lg mx-auto text-xl leading-relaxed relative z-10">
            The pages are empty. Be the first to breathe life into this nation's history with a personal memory or tale.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {stories.map((story, i) => (
            <article key={story.id} className="glass-panel rounded-3xl border-l-[6px] border-l-[#FBBF24] overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:glow-blue animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              {story.imageUrl && (
                <div className="md:w-2/5 shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1120]/50 z-10 md:bg-gradient-to-l" />
                  <img src={story.imageUrl} alt={story.title} className="w-full h-72 md:h-full object-cover opacity-80 mix-blend-lighten" />
                </div>
              )}
              <div className="p-10 md:p-14 flex-1 flex flex-col justify-center relative z-20">
                <header className="mb-8">
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight mb-4">{story.title}</h3>
                  <div className="text-[#60A5FA] font-medium flex items-center gap-3 text-lg italic">
                    <span className="w-12 h-[2px] bg-[#60A5FA] inline-block shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
                    By {story.author || "Anonymous"}
                  </div>
                </header>
                
                <div className="prose prose-lg max-w-none prose-p:leading-relaxed text-white/80 mb-10 font-serif">
                  {story.content.split('\n').map((paragraph, i) => 
                    paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
                  )}
                </div>

                {story.audioUrl && (
                  <div className="mt-auto pt-8 border-t border-white/10">
                    <div className="flex items-center gap-6 glass border border-white/10 p-6 rounded-2xl">
                      <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full shrink-0 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white hover:glow-blue shadow-md flex items-center justify-center border-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                        </svg>
                      </Button>
                      <div className="flex-1">
                        <p className="label-eyebrow text-white/70 mb-3">Voice Recording</p>
                        <div className="flex items-center gap-4">
                          <div className="h-1.5 bg-white/10 rounded-full w-full overflow-hidden">
                            <div className="h-full bg-[#60A5FA] w-1/3 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                          </div>
                          <span className="text-sm font-bold text-[#60A5FA] tabular-nums">0:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
