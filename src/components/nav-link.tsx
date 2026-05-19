"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className="relative px-4 py-2 text-sm font-medium transition-colors"
      style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
    >
      {label}
      {active && (
        <span
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full"
          style={{ background: "var(--primary)" }}
        />
      )}
    </Link>
  );
}
