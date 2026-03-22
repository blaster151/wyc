"use client";

import AudioPlayer from "./AudioPlayer";

interface WelcomeScreenProps {
  audioUrl?: string | null;
  onEnter: () => void;
}

export default function WelcomeScreen({ audioUrl, onEnter }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#1a1a2e] px-8 text-center text-white">
      <div className="space-y-4">
        <h1 className="text-4xl font-light tracking-wide">Welcome</h1>
        <p className="max-w-xs text-lg leading-relaxed text-white/70">
          A small moment of calm, just for you.
        </p>
      </div>

      <AudioPlayer src={audioUrl} />

      <button
        onClick={onEnter}
        className="rounded-full border border-white/20 px-8 py-3 text-sm tracking-widest uppercase text-white/90 transition-all hover:border-white/40 hover:bg-white/5"
      >
        Enter
      </button>
    </div>
  );
}
