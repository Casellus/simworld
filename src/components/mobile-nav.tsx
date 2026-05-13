"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Settings2, Search, BookOpen } from "lucide-react";

const nav = [
  { href: "/eventi", label: "Eventi", icon: Calendar },
  { href: "/team", label: "Team", icon: Users },
  { href: "/assetti", label: "Assetti", icon: Settings2 },
  { href: "/cerca", label: "Cerca", icon: Search },
  { href: "/guide", label: "Guide", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <ul className="flex items-center justify-around h-16">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <li key={n.href} className="flex-1">
              <Link
                href={n.href}
                className={`flex flex-col items-center justify-center gap-1 h-16 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  active ? "text-[var(--color-primary)]" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                }`}
              >
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
