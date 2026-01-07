import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudios } from "@/hooks/use-media";
import { create } from "zustand";

type PlayerStore = {
  currentTrackId: number | null;
  isPlaying: boolean;
  playTrack: (id: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
};

export const usePlayer = create<PlayerStore>((set) => ({
  currentTrackId: null,
  isPlaying: false,
  playTrack: (id) => set({ currentTrackId: id, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));

export function AudioPlayer() {
  const { currentTrackId, isPlaying, togglePlay, setPlaying } = usePlayer();
  const { data: audios } = useAudios();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const currentTrack = audios?.find((a) => a.id === currentTrackId);

  useEffect(() => {
    if (currentTrackId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackId, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  if (!currentTrack) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />
      
      {/* Mini Player */}
      <div className={`fixed bottom-16 md:bottom-0 right-0 left-0 md:left-20 lg:left-64 bg-card/95 backdrop-blur-xl border-t border-border/50 z-30 transition-all duration-300 ${expanded ? 'h-full' : 'h-20'}`}>
        {/* Expanded View */}
        {expanded && (
          <div className="flex flex-col items-center justify-center h-full p-8 space-y-8 animate-enter">
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Volume2 className="w-24 h-24 text-primary" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold font-display">{currentTrack.title}</h3>
              <p className="text-lg text-muted-foreground">{currentTrack.artist || "Unknown Artist"}</p>
            </div>
            <div className="w-full max-w-md space-y-4">
              <Slider value={[progress]} onValueChange={handleSeek} max={100} step={1} className="w-full" />
              <div className="flex justify-center gap-8">
                <Button variant="ghost" size="lg" className="rounded-full"><SkipBack className="w-8 h-8" /></Button>
                <Button size="lg" className="rounded-full w-16 h-16" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full"><SkipForward className="w-8 h-8" /></Button>
              </div>
            </div>
            <Button variant="ghost" className="absolute top-4 right-4" onClick={() => setExpanded(false)}>Minimize</Button>
          </div>
        )}

        {/* Collapsed Bar */}
        {!expanded && (
          <div className="flex items-center h-full px-4 gap-4">
            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => setExpanded(true)}>
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(true)}>
              <h4 className="font-medium truncate">{currentTrack.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist || "Unknown Artist"}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {/* prev */}}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="default" 
                size="icon" 
                className="h-10 w-10 rounded-full shadow-lg shadow-primary/20" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {/* next */}}>
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hidden sm:flex" onClick={() => setExpanded(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
