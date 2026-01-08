import { createContext, useContext, useState, ReactNode } from "react";

type PlayerContextType = {
  currentSrc: string | null;
  play: (src: string) => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

/* 🔹 Hook exported */
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used inside AudioPlayer");
  }
  return ctx;
}

/* 🔹 Provider + UI */
export function AudioPlayer({ children }: { children?: ReactNode }) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const play = (src: string) => {
    setCurrentSrc(src);
  };

  const stop = () => {
    setCurrentSrc(null);
  };

  return (
    <PlayerContext.Provider value={{ currentSrc, play, stop }}>
      {children}

      {currentSrc && (
        <audio
          src={currentSrc}
          autoPlay
          controls
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
        />
      )}
    </PlayerContext.Provider>
  );
}
