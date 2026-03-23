"use client";

import type { Affirmation } from "@/lib/types";

interface AffirmationCardProps {
  affirmation: Affirmation;
}

export default function AffirmationCard({ affirmation }: AffirmationCardProps) {
  const hasImage = !!affirmation.imageUrl;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-8 text-center text-white"
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(rgba(26,26,46,0.75), rgba(26,26,46,0.85)), url(${affirmation.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : { backgroundColor: "#1a1a2e" }
      }
    >
      <p className="max-w-md text-2xl font-light leading-relaxed tracking-wide sm:text-3xl">
        {affirmation.text}
      </p>

      {affirmation.attribution && (
        <p className="mt-6 text-sm tracking-wide text-white/50">
          — {affirmation.attribution}
        </p>
      )}
    </div>
  );
}
