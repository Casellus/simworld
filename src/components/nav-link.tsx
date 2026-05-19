"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className="relative px-5 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
      style={{ color: active ? "#fff" : "rgba(255,255,255,0.45)" }}
    >
      {label}
      {active && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}
    </Link>
  );
}
