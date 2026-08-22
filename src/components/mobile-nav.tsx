"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/eventi", label: "Eventi" },
  { href: "/team", label: "Team" },
  { href: "/assetti", label: "Assetti" },
  { href: "/cerca", label: "Community" },
  { href: "/guide", label: "Guide" },
];

export function MobileHamburger({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on route change (incl. back/forward) without an effect.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-9 w-9 rounded hover:bg-[var(--color-bg-elev)] transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Fullscreen overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "#0d0d12",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      >
        {/* Close button — top right */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Chiudi menu"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        {/* Nav links (Classifica solo per utenti loggati) */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: 320, textAlign: "center" }}>
          {(isLoggedIn ? [...nav, { href: "/classifica", label: "Classifica" }] : nav).map((n) => {
            const active = n.href === "/"
              ? pathname === "/"
              : pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 16px",
                  borderRadius: 14,
                  textDecoration: "none",
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "var(--font-heading)",
                  color: active ? "var(--primary)" : "#f5f7fa",
                  background: active ? "rgba(46,125,255,0.10)" : "transparent",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/auth/register"}
          onClick={() => setOpen(false)}
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "2rem",
            width: "100%",
            maxWidth: 320,
            padding: "14px 24px",
            borderRadius: 9999,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            background: "var(--primary)",
            color: "#fff",
          }}
        >
          {isLoggedIn ? "Dashboard" : "Registrati"}
        </Link>
      </div>
    </>
  );
}
