"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// Filtro "Solo che reclutano". La spunta cambia SUBITO al clic (stato locale),
// poi la navigazione aggiorna i risultati in transizione: niente ritardo visivo.
export function TeamRecruitingFilter({ active, q }: { active: boolean; q?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [checked, setChecked] = useState(active);

  function toggle() {
    const next = !checked;
    setChecked(next); // aggiornamento immediato della UI
    const params = new URLSearchParams();
    if (next) params.set("recruiting", "1");
    if (q) params.set("q", q);
    const qs = params.toString();
    startTransition(() => router.push(`/team${qs ? `?${qs}` : ""}`));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={checked}
      className={`flex items-center gap-3 h-10 px-3 rounded-xl border cursor-pointer transition-all duration-150 text-sm font-medium select-none ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
      }`}
    >
      <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
        checked
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
          : "border-[var(--color-border-strong)] bg-transparent"
      }`}>
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      Solo che reclutano
    </button>
  );
}
