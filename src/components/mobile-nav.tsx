"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Settings2, Search, BookOpen, X, Menu } from "lucide-react";

const nav = [
  { href: "/eventi", label: "Eventi", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
  { href: "/assetti", label: "Assetti", icon: Settings2 },
  { href: "/cerca", label: "Cerca", icon: Search },
  { href: "/guide", label: "Guide", icon: BookOpen },
];

export function MobileHamburger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center h-9 w-9 rounded hover:bg-[var(--color-bg-elev)] transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => setOpen(false)}
          />
          {/* drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-[var(--color-bg)] border-l border-[var(--color-border)] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)] mt-[env(safe-area-inset-top)]">
              <span className="text-sm font-black uppercase tracking-widest">Menu</span>
              <button onClick={() => setOpen(false)} className="h-9 w-9 flex items-center justify-center rounded hover:bg-[var(--color-bg-elev-2)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {nav.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                      active
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev-2)]"
                    }`}
                  >
                    <n.icon className="h-4 w-4 shrink-0" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
