import { useEffect, useRef, useState } from "react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const playAudio = (url: string) => {
    if (!audioRef.current) return;

    audioRef.current.src = url;
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
  };

  // expose to window for now (simple & safe)
  (window as any).playAudio = playAudio;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isPlaying && (
        <div className="bg-background border shadow-lg rounded-full px-4 py-2 text-sm">
          🎵 Playing audio...
        </div>
      )}
    </div>
  );
}
