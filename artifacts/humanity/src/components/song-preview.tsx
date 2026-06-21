import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function PlayPreviewButton({
  url,
  size = "md",
}: {
  url: string;
  size?: "sm" | "md";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [url]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Pause preview" : "Play preview"}
      className={`${dim} shrink-0 rounded-full bg-[#FBBF24] text-[#0F172A] flex items-center justify-center hover:glow-gold transition-all`}
    >
      {playing ? (
        <Pause className={`${icon} fill-current`} />
      ) : (
        <Play className={`${icon} fill-current translate-x-[1px]`} />
      )}
    </button>
  );
}
