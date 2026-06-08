"use client";

import { useState, useRef, useEffect } from "react";
import { RANKS, calcRank, rankEmoji } from "@/lib/xp-shared";
import { XP_VALUES } from "@/lib/constants";

const ACTION_LABELS: { action: keyof typeof XP_VALUES; label: string }[] = [
  { action: "setup_create", label: "Carichi un assetto" },
  { action: "event_create", label: "Crei un evento" },
  { action: "team_create", label: "Crei un team" },
  { action: "team_join", label: "Entri in un team" },
  { action: "post_create", label: "Pubblichi un annuncio" },
  { action: "event_join", label: "Ti iscrivi a un evento" },
  { action: "like_received", label: "Ricevi un like su un assetto" },
  { action: "like_given", label: "Metti un like a un assetto" },
];

export function RankBadge({ rank, xp }: { rank: string | null | undefined; xp: number | null | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const currentXp = xp ?? 0;
  const currentRank = rank ?? calcRank(currentXp);
  const currentIdx = RANKS.findIndex((r) => r.rank === currentRank);
  const nextRank = RANKS[currentIdx + 1] ?? null;
  const toNext = nextRank ? Math.max(0, nextRank.minXp - currentXp) : 0;
  const progress = nextRank
    ? Math.min(100, Math.round(((currentXp - RANKS[currentIdx].minXp) / (nextRank.minXp - RANKS[currentIdx].minXp)) * 100))
    : 100;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Il tuo rank — come funziona"
        aria-label="Il tuo rank, apri spiegazione"
        className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/[0.08] transition-colors text-lg leading-none"
      >
        <span role="img" aria-hidden="true">{rankEmoji(currentRank)}</span>
      </button>

      {open && (
        <div className="fixed left-1/2 -translate-x-1/2 top-20 w-[calc(100vw-2rem)] max-w-72 sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-auto sm:mt-2 sm:w-72 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] shadow-xl z-50 overflow-hidden">
          {/* Tuo stato */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl leading-none" role="img" aria-hidden="true">{rankEmoji(currentRank)}</span>
              <div>
                <p className="font-bold text-sm leading-tight">{currentRank}</p>
                <p className="text-xs text-[var(--color-fg-muted)]">{currentXp} XP questo mese</p>
              </div>
            </div>
            {nextRank ? (
              <>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elev-2)] overflow-hidden">
                  <div className="h-full bg-[var(--color-primary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-[var(--color-fg-muted)] mt-1.5">
                  Mancano <span className="font-semibold text-[var(--color-fg)]">{toNext} XP</span> per {rankEmoji(nextRank.rank)} {nextRank.rank}
                </p>
              </>
            ) : (
              <p className="text-[11px] text-[var(--color-fg-muted)]">Hai raggiunto il rank massimo. 🔥</p>
            )}
          </div>

          {/* Come guadagnare XP */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-fg-muted)] mb-2">Come guadagnare XP</p>
            <ul className="space-y-1">
              {ACTION_LABELS.map(({ action, label }) => (
                <li key={action} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-fg-muted)]">{label}</span>
                  <span className="font-bold text-[var(--color-primary)]">+{XP_VALUES[action]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rank */}
          <div className="p-4">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-fg-muted)] mb-2">I rank</p>
            <ul className="space-y-1">
              {RANKS.map((r) => (
                <li key={r.rank} className="flex items-center justify-between text-xs">
                  <span className={r.rank === currentRank ? "font-bold text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}>
                    {r.emoji} {r.rank}
                  </span>
                  <span className="text-[var(--color-fg-muted)]">{r.minXp}+ XP</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[var(--color-fg-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
              La classifica si azzera il 1° di ogni mese.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
