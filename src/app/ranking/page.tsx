import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { rankEmoji } from "@/lib/xp";

export const metadata = { title: "Classifica — SimUniverse" };

type RankRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  monthly_xp: number;
  current_rank: string;
};

const RANK_STYLES: Record<string, string> = {
  Bronzo: "bg-amber-900/30 text-amber-300 border-amber-700/40",
  Argento: "bg-slate-400/15 text-slate-200 border-slate-400/40",
  Oro: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  Leggenda: "bg-purple-500/15 text-purple-300 border-purple-500/40",
};

function positionEmoji(i: number): string | null {
  return i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
}

export default async function RankingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
    .order("monthly_xp", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as RankRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-3">
          Classifica mensile
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Top piloti del mese
        </h1>
        <p className="mt-4 text-sm text-[var(--color-fg-muted)]">
          Guadagna XP caricando assetti, mettendo like, creando eventi e team. Reset il 1° di ogni mese.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] py-16 text-center text-sm text-[var(--color-fg-muted)]">
          Nessun pilota in classifica questo mese. Sii il primo a guadagnare XP!
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden divide-y divide-[var(--color-border)]">
          {rows.map((r, i) => {
            const pos = positionEmoji(i);
            const name = r.display_name || r.username;
            return (
              <Link
                key={r.id}
                href={`/profilo/${r.username}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-8 shrink-0 text-center font-bold text-sm">
                  {pos ? <span className="text-xl">{pos}</span> : <span className="text-[var(--color-fg-muted)]">{i + 1}</span>}
                </div>
                <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 overflow-hidden flex items-center justify-center">
                  {r.avatar_url ? (
                    <Image src={r.avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{name}</p>
                  <p className="text-xs text-[var(--color-fg-muted)] truncate">@{r.username}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${RANK_STYLES[r.current_rank] ?? RANK_STYLES.Bronzo}`}>
                  {rankEmoji(r.current_rank)} {r.current_rank}
                </span>
                <div className="shrink-0 text-right">
                  <span className="font-extrabold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{r.monthly_xp}</span>
                  <span className="text-xs text-[var(--color-fg-muted)] ml-1">XP</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
