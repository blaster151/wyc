"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAffirmations, fetchConfig } from "@/lib/content";
import { shuffleArray } from "@/lib/shuffle";
import type { Affirmation, SiteConfig } from "@/lib/types";
import AffirmationCard from "./AffirmationCard";
import PresenceTimer from "./PresenceTimer";

interface AffirmationFlowProps {
  onComplete: () => void;
}

export default function AffirmationFlow({ onComplete }: AffirmationFlowProps) {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [index, setIndex] = useState(0);
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    Promise.all([fetchAffirmations(), fetchConfig()]).then(
      ([affs, cfg]) => {
        setAffirmations(shuffleArray(affs));
        setConfig(cfg);
      }
    );
  }, []);

  const current = affirmations[index] ?? null;
  const isLast = index === affirmations.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
      setTimerDone(false);
    }
  }, [isLast, onComplete]);

  const handleTimerComplete = useCallback(() => {
    setTimerDone(true);
  }, []);

  // Loading state
  if (!config || affirmations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        {affirmations.length === 0 && config ? (
          <p className="text-lg text-white/60">No affirmations available.</p>
        ) : (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#1a1a2e]">
      {current && (
        <div key={current.id} className="animate-fade-in">
          <AffirmationCard affirmation={current} />
        </div>
      )}

      {/* Bottom controls overlay */}
      <div className="fixed inset-x-0 bottom-0 flex flex-col items-center gap-6 pb-12">
        {config && (
          <PresenceTimer
            key={index}
            durationMs={config.timerDurationMs}
            onComplete={handleTimerComplete}
          />
        )}

        <button
          onClick={advance}
          className="rounded-full border border-white/20 px-8 py-3 text-sm tracking-widest uppercase text-white/90 transition-all hover:border-white/40 hover:bg-white/5"
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
