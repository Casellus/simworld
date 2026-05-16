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
  { href: "/cerca", label: "Cerca" },
  { href: "/guide", label: "Guide" },
];

export function MobileHamburger({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

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

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "min(300px, 80vw)",
          zIndex: 999,
          background: "#0d0d12",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          padding: "1.25rem 1.5rem 2rem",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2.5rem" }}>
          <button
            onClick={() => setOpen(false)}
            aria-label="Chiudi menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--primary)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {nav.map((n) => {
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
                  padding: "13px 16px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontSize: 19,
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
            padding: "13px 24px",
            borderRadius: 9999,
            textDecoration: "none",
            fontSize: 15,
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
