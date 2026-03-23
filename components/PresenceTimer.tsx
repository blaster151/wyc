"use client";

import { useEffect, useState } from "react";

interface PresenceTimerProps {
  durationMs: number;
  onComplete: () => void;
}

export default function PresenceTimer({
  durationMs,
  onComplete,
}: PresenceTimerProps) {
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setComplete(true);
      onComplete();
    }, durationMs);
    return () => clearTimeout(id);
  }, [durationMs, onComplete]);

  return (
    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-white/40"
        ref={(el) => {
          if (el) {
            // Force reflow so the CSS transition animates from 0% → 100%
            el.style.width = "0%";
            void el.offsetHeight;
            el.style.transition = `width ${durationMs}ms linear`;
            el.style.width = "100%";
          }
        }}
        role="progressbar"
        aria-valuenow={complete ? 100 : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Presence timer"
      />
    </div>
  );
}
