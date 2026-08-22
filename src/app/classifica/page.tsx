import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { RANKS } from "@/lib/xp-shared";
import { RankMedal, RANK_COLORS } from "@/components/rank-medal";
import { Trophy, RotateCcw } from "lucide-react";

export const metadata = { title: "Classifica · SimUniverse" };
export const revalidate = 60;

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  monthly_xp: number;
  current_rank: string;
};

// Azioni che danno XP, con i valori reali da @/lib/constants (XP_VALUES).
const XP_ACTIONS = [
  { label: "Pubblica un assetto", xp: 50, icon: "wheel" },
  { label: "Crea un evento", xp: 40, icon: "calendar" },
  { label: "Crea un team", xp: 30, icon: "group" },
  { label: "Entra in un team / annuncio", xp: 20, icon: "doc" },
  { label: "Iscriviti a un evento", xp: 15, icon: "check" },
  { label: "Like dato o ricevuto", xp: 5, icon: "heart" },
] as const;

export default async function ClassificaPage() {
  const supabase = await createClient();
  const [{ data }, viewerId] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, monthly_xp, current_rank")
      .order("monthly_xp", { ascending: false })
      .limit(50),
    getUserId(),
  ]);

  const ranked = (data ?? []).filter((r) => r.monthly_xp > 0) as Row[];
  const [first, second, third] = ranked;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      {/* HEADER */}
      <div className="text-center mb-10">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
          <Trophy className="h-4 w-4" /> Classifica mensile
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2" style={{ fontFamily: "var(--font-heading)" }}>
          Top piloti del mese
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-2 max-w-lg mx-auto">
          I piloti più attivi della community. Guadagna XP pubblicando assetti, organizzando eventi e partecipando.
        </p>
      </div>

      {/* PODIO */}
      {ranked.length > 0 ? (
        <>
          {/* Su mobile ordina 1-2-3 (order); su desktop 2-1-3 (podio). */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-start max-w-2xl mx-auto mb-8">
            {second ? <div className="order-2 sm:order-1"><PodiumCard row={second} pos={1} /></div> : <div className="hidden sm:block sm:order-1" />}
            {first && <div className="order-1 sm:order-2"><PodiumCard row={first} pos={0} /></div>}
            {third ? <div className="order-3"><PodiumCard row={third} pos={2} /></div> : <div className="hidden sm:block sm:order-3" />}
          </div>

          {/* CLASSIFICA ESTESA */}
          {ranked.length > 3 && (
            <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden mb-12">
              {ranked.slice(3).map((r, i) => {
                const pos = i + 4;
                const name = r.display_name || r.username;
                const isMe = viewerId === r.id;
                return (
                  <Link
                    key={r.id}
                    href={`/profilo/${r.username}`}
                    className={`flex items-center gap-3.5 px-4 py-3 transition-colors border-b border-[var(--color-border)] last:border-0 ${
                      isMe ? "bg-[var(--color-accent)]/8" : "bg-[var(--color-bg-elev)] hover:bg-[var(--color-bg-elev-2)]"
                    }`}
                  >
                    <span className="w-6 text-center text-sm font-bold text-[var(--color-fg-muted)]" style={{ fontFamily: "var(--font-heading)" }}>{pos}</span>
                    <span className="h-9 w-9 rounded-full overflow-hidden bg-[var(--color-bg-elev-2)] flex items-center justify-center text-sm font-bold text-[var(--color-accent)] shrink-0">
                      {r.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                      ) : name.charAt(0).toUpperCase()}
                    </span>
                    <span className="flex-1 font-semibold text-sm truncate">{name}{isMe && <span className="text-[var(--color-fg-muted)] font-normal"> · tu</span>}</span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)]">
                      <RankMedal rank={r.current_rank} className="h-3.5 w-3.5" /> {r.current_rank}
                    </span>
                    <span className="w-20 text-right text-sm font-bold text-[var(--color-success)]" style={{ fontFamily: "var(--font-heading)" }}>{r.monthly_xp} XP</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] py-14 px-6 text-center mb-12">
          <Trophy className="h-10 w-10 text-[var(--color-fg-muted)] mx-auto mb-3 opacity-50" />
          <h3 className="font-bold mb-1">Classifica ancora vuota</h3>
          <p className="text-sm text-[var(--color-fg-muted)]">Nessuno ha ancora guadagnato XP questo mese. Sii il primo!</p>
        </div>
      )}

      {/* I RANGHI */}
      <div className="mb-12">
        <h2 className="text-xl font-extrabold text-center" style={{ fontFamily: "var(--font-heading)" }}>I ranghi</h2>
        <p className="text-sm text-[var(--color-fg-muted)] text-center mt-1 mb-6">
          Sali di rango accumulando XP nel mese. Ogni mese la classifica riparte.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RANKS.map((r) => (
            <div key={r.rank} className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 py-5 text-center overflow-hidden">
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 h-24 w-24 rounded-full blur-3xl opacity-30"
                style={{ background: RANK_COLORS[r.rank] }}
              />
              <RankMedal rank={r.rank} className="h-10 w-10 mx-auto mb-3 relative" />
              <p className="font-bold relative" style={{ fontFamily: "var(--font-heading)" }}>{r.rank}</p>
              <p className="text-xs text-[var(--color-fg-muted)] relative">da {r.minXp} XP</p>
            </div>
          ))}
        </div>
      </div>

      {/* COME FUNZIONA */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6">
        <h2 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>Come funziona</h2>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1 mb-5">
          Ogni azione utile alla community ti fa guadagnare XP. Più sei attivo, più sali in classifica.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {XP_ACTIONS.map((a) => (
            <div key={a.label} className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] px-3.5 py-3">
              <span className="h-8 w-8 rounded-[9px] bg-[var(--color-accent)]/12 flex items-center justify-center shrink-0">
                <ActionIcon name={a.icon} />
              </span>
              <span className="flex-1 text-sm font-medium">{a.label}</span>
              <span className="text-sm font-bold text-[var(--color-success)] whitespace-nowrap" style={{ fontFamily: "var(--font-heading)" }}>+{a.xp} XP</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-5 rounded-xl px-4 py-3 bg-[var(--color-primary)]/8 border border-[var(--color-primary)]/20">
          <RotateCcw className="h-[18px] w-[18px] text-[var(--color-primary)] shrink-0" />
          <p className="text-[12.5px] leading-relaxed">
            La classifica si <b className="text-[var(--color-primary)]">azzera ogni mese</b>: il 1° del mese tutti ripartono da zero. Il rango riflette l&apos;XP guadagnato nel mese corrente.
          </p>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ row, pos }: { row: Row; pos: number }) {
  const name = row.display_name || row.username;
  const ring = pos === 0 ? RANK_COLORS.Oro : pos === 1 ? RANK_COLORS.Argento : RANK_COLORS.Bronzo;
  const lift = pos === 0 ? "sm:-translate-y-4" : "sm:translate-y-2";
  const avatarSize = pos === 0 ? "h-20 w-20" : "h-16 w-16";
  return (
    <Link
      href={`/profilo/${row.username}`}
      className={`group flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-4 py-6 hover:-translate-y-1 transition-all ${lift}`}
    >
      <div className="relative mb-3">
        <div
          className={`${avatarSize} rounded-full overflow-hidden flex items-center justify-center bg-[var(--color-bg-elev-2)]`}
          style={{ border: `3px solid ${ring}`, boxShadow: pos === 0 ? `0 0 24px ${ring}55` : "none" }}
        >
          {row.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center text-xs font-extrabold">
          {pos + 1}
        </span>
      </div>
      <p className="font-bold text-sm text-center truncate max-w-full group-hover:text-[var(--color-primary)] transition-colors">{name}</p>
      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-fg-muted)] mt-0.5 mb-2">
        <RankMedal rank={row.current_rank} className="h-3.5 w-3.5" /> {row.current_rank}
      </span>
      <p className="text-lg font-extrabold text-[var(--color-success)]" style={{ fontFamily: "var(--font-heading)" }}>{row.monthly_xp} XP</p>
    </Link>
  );
}

function ActionIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    wheel: "M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-13 8.66a8 8 0 0 0 7 7.937v-5.107a3 3 0 0 1 -1.898 -2.05l-5.07 -1.504q -.031 .36 -.032 .725m15.967 -.725l-5.069 1.503a3 3 0 0 1 -1.897 2.051v5.108a8 8 0 0 0 6.985 -8.422zm-11.967 -6.204a8 8 0 0 0 -3.536 4.244l4.812 1.426a3 3 0 0 1 5.448 0l4.812 -1.426a8 8 0 0 0 -11.536 -4.244",
    calendar: "M16 2a1 1 0 0 1 .993 .883l.007 .117v1h1a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h1v-1a1 1 0 0 1 1.993 -.117l.007 .117v1h6v-1a1 1 0 0 1 1 -1m3 8h-14v8.625c0 .705 .386 1.286 .883 1.366l.117 .009h12c.513 0 .936 -.53 .993 -1.215l.007 -.16zm-9 4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1z",
    group: "M12 11a4 4 0 1 1 0 -8a4 4 0 0 1 0 8m-6.5 3h13a3 3 0 0 1 3 3v.5a4.5 4.5 0 0 1 -4.5 4.5h-10a4.5 4.5 0 0 1 -4.5 -4.5v-.5a3 3 0 0 1 3 -3",
    doc: "M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm3 14h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m-5 -4h-1a1 1 0 1 0 0 2h1a1 1 0 0 0 0 -2",
    check: "M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z",
    heart: "M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z",
  };
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="var(--color-accent)" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}
