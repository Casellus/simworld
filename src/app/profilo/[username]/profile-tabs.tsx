"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings2, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Game = { name: string } | null;
type Setup = { id: string; title: string; car: string; track: string; games: Game };
type EventRow = { slug: string; title: string; event_type: string; start_at: string };

type Props = {
  setups: Setup[];
  events: EventRow[];
};

const TABS = ["Assetti", "Eventi"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({ setups, events }: Props) {
  const [tab, setTab] = useState<Tab>("Assetti");

  return (
    <>
      {/* TABS BAR */}
      <div className="flex items-center border-b border-[var(--color-border)] mb-5 gap-1 sm:gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "text-[var(--color-fg)] border-[var(--color-primary)]"
                : "text-[var(--color-fg-muted)] border-transparent hover:text-[var(--color-fg)]"
            }`}
          >
            {t}
            <span className="ml-1.5 text-xs text-[var(--color-fg-muted)]/60">
              {t === "Assetti" ? setups.length : events.length}
            </span>
          </button>
        ))}
      </div>

      {/* ASSETTI */}
      {tab === "Assetti" && (
        setups.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {setups.map((s) => (
              <Link
                key={s.id}
                href={`/assetti/${s.id}`}
                className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 transition-all"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-1">
                  {s.games?.name}
                </div>
                <div className="font-semibold text-sm text-white">{s.title}</div>
                <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                  {[s.car, s.track].filter(Boolean).join(" · ")}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Settings2} msg="Nessun assetto pubblicato." />
        )
      )}

      {/* EVENTI */}
      {tab === "Eventi" && (
        events.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((ev, i) => (
              <Link
                key={i}
                href={`/eventi/${ev.slug}`}
                className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 transition-all"
              >
                <div className="font-semibold text-sm text-white">{ev.title}</div>
                <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                  {ev.event_type} · {formatDate(ev.start_at)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={Trophy} msg="Nessun evento partecipato." />
        )
      )}
    </>
  );
}

function EmptyState({ icon: Icon, msg }: { icon: React.ComponentType<{ className?: string }>; msg: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] py-14 px-6 text-center">
      <Icon className="h-9 w-9 text-[var(--color-fg-muted)] mx-auto mb-3 opacity-60" />
      <p className="text-sm text-[var(--color-fg-muted)]">{msg}</p>
    </div>
  );
}
