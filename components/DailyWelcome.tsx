"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWelcome } from "@/lib/content";
import type { WelcomeMessage } from "@/lib/types";
import AudioPlayer from "./AudioPlayer";

export default function DailyWelcome() {
  const router = useRouter();
  const [welcome, setWelcome] = useState<WelcomeMessage | null>(null);

  useEffect(() => {
    fetchWelcome(new Date()).then(setWelcome);
  }, []);

  if (!welcome) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#1a1a2e] px-8 text-center text-white">
      <p className="max-w-sm text-2xl font-light leading-relaxed tracking-wide">
        {welcome.text}
      </p>

      <AudioPlayer src={welcome.audioUrl} />

      <button
        onClick={() => router.push("/affirmations")}
        className="rounded-full border border-white/20 px-8 py-3 text-sm tracking-widest uppercase text-white/90 transition-all hover:border-white/40 hover:bg-white/5"
      >
        Begin
      </button>
    </div>
  );
}
