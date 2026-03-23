"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchConfig } from "@/lib/content";
import type { SiteConfig } from "@/lib/types";

export default function SupportScreen() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#1a1a2e] px-8 text-center text-white">
      {config.supportNote && (
        <p className="max-w-sm text-lg font-light leading-relaxed tracking-wide text-white/70">
          {config.supportNote}
        </p>
      )}

      {config.donationUrl && (
        <a
          href={config.donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 px-8 py-3 text-sm tracking-widest uppercase text-white/90 transition-all hover:border-white/40 hover:bg-white/5"
        >
          Support this project ❤️
        </a>
      )}

      <Link
        href="/"
        className="text-sm tracking-wide text-white/40 transition-colors hover:text-white/60"
      >
        Start again
      </Link>
    </div>
  );
}
