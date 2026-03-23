"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed right-4 top-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h12M3 9h12M3 13h12" />
          </svg>
        )}
      </button>

      {open && (
        <div className="animate-fade-in mt-2 flex flex-col gap-1 rounded-xl border border-white/10 bg-[#1a1a2e]/95 p-2 backdrop-blur-sm">
          <NavLink href="/" label="Home" active={pathname === "/"} onClick={() => setOpen(false)} />
          <NavLink href="/support" label="Support" active={pathname === "/support"} onClick={() => setOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm tracking-wide transition-colors ${
        active
          ? "text-white/90"
          : "text-white/50 hover:bg-white/5 hover:text-white/80"
      }`}
    >
      {label}
    </Link>
  );
}
