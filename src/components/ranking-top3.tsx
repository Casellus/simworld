import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type TopRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  monthly_xp: number;
  current_rank: string;
};

// stile per posizione (0=1°, 1=2°, 2=3°)
const PODIUM = [
  { emoji: "🥇", ring: "ring-yellow-400/70", glow: "shadow-[0_0_28px_rgba(250,204,21,0.3)]", avatar: "h-24 w-24", crown: true },
  { emoji: "🥈", ring: "ring-slate-300/70", glow: "shadow-[0_0_20px_rgba(203,213,225,0.18)]", avatar: "h-20 w-20", crown: false },
  { emoji: "🥉", ring: "ring-amber-600/70", glow: "shadow-[0_0_20px_rgba(217,119,6,0.18)]", avatar: "h-20 w-20", crown: false },
];

function PodiumCard({ row, pos }: { row: TopRow; pos: number }) {
  const p = PODIUM[pos];
  const name = row.display_name || row.username;
  // 1° alzato, 2° e 3° più in basso
  const lift = pos === 0 ? "sm:-translate-y-8" : "sm:translate-y-2";
  return (
    <Link
      href={`/profilo/${row.username}`}
      className={`group flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 py-7 hover:border-[var(--color-primary)]/60 transition-all ${lift}`}
    >
      <div className="relative mb-4">
        {p.crown && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl leading-none select-none" role="img" aria-hidden="true">
            👑
          </span>
        )}
        <div className={`${p.avatar} rounded-full overflow-hidden ring-2 ${p.ring} ${p.glow} bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center`}>
          {row.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center text-sm font-extrabold leading-none">
          {pos + 1}
        </span>
      </div>

      <p className="font-bold text-base text-center leading-tight truncate max-w-full group-hover:text-[var(--color-primary)] transition-colors">
        {name}
      </p>
      <p className="text-xs text-[var(--color-fg-muted)] mb-2">
        {p.emoji} {row.current_rank}
      </p>
      <p className="text-lg font-extrabold text-[var(--color-success)]" style={{ fontFamily: "var(--font-heading)" }}>
        +{row.monthly_xp} XP
      </p>
    </Link>
  );
}

export async function RankingTop3() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
    .order("monthly_xp", { ascending: false })
    .limit(3);

  const top = (data ?? []).filter((r) => r.monthly_xp > 0) as TopRow[];
  if (top.length === 0) return null;

  // ordine visivo podio: 2° a sinistra, 1° al centro, 3° a destra
  const first = top[0];
  const second = top[1];
  const third = top[2];

  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">
            🏆 Classifica mensile
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Top piloti del mese
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-start max-w-3xl mx-auto">
          {/* 2° (sinistra) */}
          {second ? <PodiumCard row={second} pos={1} /> : <div className="hidden sm:block" />}
          {/* 1° (centro, rialzato) */}
          <PodiumCard row={first} pos={0} />
          {/* 3° (destra) */}
          {third ? <PodiumCard row={third} pos={2} /> : <div className="hidden sm:block" />}
        </div>
      </div>
    </section>
  );
}
