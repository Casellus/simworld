"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

export function MobileNav({ nav }: { nav: NavItem[] }) {
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
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                }`}
              >
                <n.icon className={`h-5 w-5 ${active ? "text-[var(--color-primary)]" : ""}`} />
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
