import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rankEmoji } from "@/lib/xp";

type TopRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  monthly_xp: number;
  current_rank: string;
};

// posizione → emoji medaglia + colore anello avatar (palette sito)
const PODIUM = [
  { emoji: "🥇", ring: "ring-yellow-400/70", glow: "shadow-[0_0_24px_rgba(250,204,21,0.25)]" },
  { emoji: "🥈", ring: "ring-slate-300/70", glow: "shadow-[0_0_24px_rgba(203,213,225,0.18)]" },
  { emoji: "🥉", ring: "ring-amber-600/70", glow: "shadow-[0_0_24px_rgba(217,119,6,0.18)]" },
];

export async function RankingTop3() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
    .order("monthly_xp", { ascending: false })
    .limit(3);

  const top = (data ?? []).filter((r) => r.monthly_xp > 0) as TopRow[];
  if (top.length === 0) return null;

  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">
            🏆 Classifica mensile
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Top piloti del mese
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {top.map((r, i) => {
            const p = PODIUM[i];
            const name = r.display_name || r.username;
            return (
              <Link
                key={r.id}
                href={`/profilo/${r.username}`}
                className="group flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-5 py-7 hover:border-[var(--color-primary)]/60 transition-colors"
              >
                {/* avatar con badge posizione */}
                <div className="relative mb-4">
                  <div className={`h-20 w-20 rounded-full overflow-hidden ring-2 ${p.ring} ${p.glow} bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center`}>
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-extrabold text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center text-sm font-extrabold leading-none">
                    {i + 1}
                  </span>
                </div>

                {/* nome */}
                <p className="font-bold text-base text-center leading-tight truncate max-w-full group-hover:text-[var(--color-primary)] transition-colors">
                  {name}
                </p>

                {/* rank */}
                <p className="text-xs text-[var(--color-fg-muted)] mb-2">
                  {p.emoji} {r.current_rank}
                </p>

                {/* punti */}
                <p className="text-lg font-extrabold text-[var(--color-success)]" style={{ fontFamily: "var(--font-heading)" }}>
                  +{r.monthly_xp} XP
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
