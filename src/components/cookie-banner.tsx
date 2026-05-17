"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_notice_seen")) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem("cookie_notice_seen", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Informativa cookie"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="mx-auto max-w-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-[var(--color-border)] px-5 py-4 shadow-2xl"
        style={{
          background: "rgba(10,10,18,0.92)",
          backdropFilter: "blur(20px)",
          pointerEvents: "auto",
        }}
      >
        <p className="flex-1 text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Utilizziamo solo{" "}
          <strong className="text-[var(--color-fg)]">cookie tecnici</strong> necessari al
          funzionamento della piattaforma (sessione di autenticazione). Nessun tracker o cookie
          pubblicitario.{" "}
          <Link href="/info/cookie" className="text-[var(--color-primary)] underline underline-offset-2 hover:no-underline">
            Cookie Policy
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
