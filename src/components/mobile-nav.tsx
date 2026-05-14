"use client";

import { useState, useEffect } from "react";
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

  // chiudi su cambio pagina
  useEffect(() => { setOpen(false); }, [pathname]);

  // blocca scroll body quando aperto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center h-9 w-9 rounded hover:bg-[var(--color-bg-elev)] transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.18s ease",
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 24,
              right: 20,
              background: "none",
              border: "none",
              color: "#0b1a33",
              cursor: "pointer",
              padding: 8,
            }}
            aria-label="Chiudi"
          >
            <X size={28} />
          </button>

          <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
            {nav.map((n, i) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 40px",
                    width: "100%",
                    maxWidth: 320,
                    borderRadius: 12,
                    textDecoration: "none",
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                    color: active ? "#0b5fff" : "#0b1a33",
                    background: active ? "rgba(11,95,255,0.08)" : "transparent",
                    animation: `slideUp 0.2s ease ${i * 0.05}s both`,
                  }}
                >
                  <n.icon size={24} />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <style>{`
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
          `}</style>
        </div>
      )}
    </>
  );
}
