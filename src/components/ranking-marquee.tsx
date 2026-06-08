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

const POS_EMOJI = ["🥇", "🥈", "🥉"];

export async function RankingMarquee() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
    .order("monthly_xp", { ascending: false })
    .limit(3);

  const top = (data ?? []).filter((r) => r.monthly_xp > 0) as TopRow[];
  if (top.length === 0) return null;

  // duplica per loop continuo dello scorrimento
  const items = [...top, ...top, ...top, ...top];

  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-fg-muted)] mb-3">
        🏆 Top piloti del mese
      </p>
      <div className="sponsor-marquee rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] py-3">
        <div className="sponsor-track">
          {items.map((r, i) => {
            const name = r.display_name || r.username;
            const realIdx = i % top.length;
            return (
              <div key={i} className="sponsor-item !h-auto !opacity-100 px-2" aria-hidden={i >= top.length}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none" role="img" aria-hidden="true">{POS_EMOJI[realIdx]}</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center shrink-0">
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--color-primary)]">{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="whitespace-nowrap">
                    <p className="text-sm font-bold leading-tight">{name}</p>
                    <p className="text-[11px] text-[var(--color-fg-muted)] leading-tight">
                      {rankEmoji(r.current_rank)} {r.monthly_xp} XP
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
