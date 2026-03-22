"use client";

import { useEffect, useState } from "react";
import { isFirstVisit, markVisited } from "@/lib/firstVisit";
import { fetchWelcome } from "@/lib/content";
import type { WelcomeMessage } from "@/lib/types";
import WelcomeScreen from "@/components/WelcomeScreen";
import DailyWelcome from "@/components/DailyWelcome";

type Phase = "loading" | "first-visit" | "daily";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [welcome, setWelcome] = useState<WelcomeMessage | null>(null);

  useEffect(() => {
    fetchWelcome(new Date()).then(setWelcome);
    setPhase(isFirstVisit() ? "first-visit" : "daily");
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
      </div>
    );
  }

  if (phase === "first-visit") {
    return (
      <div className="animate-fade-in">
        <WelcomeScreen
          audioUrl={welcome?.audioUrl}
          onEnter={() => {
            markVisited();
            setPhase("daily");
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DailyWelcome />
    </div>
  );
}
