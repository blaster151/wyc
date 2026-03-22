"use client";

import { useRef, useState } from "react";

interface AudioPlayerProps {
  src: string | undefined | null;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!src) return null;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }

  return (
    <div className="flex items-center justify-center">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause audio" : "Play audio"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10"
      >
        {playing ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="5" y="4" width="3" height="12" rx="1" />
            <rect x="12" y="4" width="3" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 4l10 6-10 6V4z" />
          </svg>
        )}
      </button>
    </div>
  );
}
