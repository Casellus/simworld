import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Search, Plus, Flag, User } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";
import { GAMES } from "@/lib/constants";
import { likePattern } from "@/lib/validation";
import { Suspense } from "react";
import { PostActions } from "./post-actions";
import { SortSelect } from "@/components/ui/sort-select";

export const metadata = { title: "Community · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ tipo?: string; gioco?: string; ordina?: string; q?: string }>;

const SORT_OPTIONS = [
  { value: "recenti", label: "Più recenti" },
  { value: "vecchi",  label: "Meno recenti" },
  { value: "az",      label: "A → Z" },
];

const ORDER_MAP: Record<string, { col: string; asc: boolean }> = {
  recenti: { col: "created_at", asc: false },
  vecchi:  { col: "created_at", asc: true  },
  az:      { col: "title",      asc: true  },
};

export default async function CercaPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ordina = sp.ordina ?? "recenti";
  const { col, asc } = ORDER_MAP[ordina] ?? ORDER_MAP.recenti;
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  let q = supabase
    .from("recruitment_posts")
    .select("id, post_type, title, description, contact, created_at, user_id, team_id, games(name, slug)")
    .eq("active", true)
    .order(col, { ascending: asc })
    .limit(50);

  if (sp.tipo) q = q.eq("post_type", sp.tipo);
  if (gameId) q = q.eq("game_id", gameId);
  if (sp.q) q = q.ilike("title", likePattern(sp.q));

  const { data: posts } = await q;
  const userId = await getUserId();

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id).filter(Boolean))];
  const profileMap: Record<string, { display_name: string | null; username: string | null; avatar_url: string | null; cover_url: string | null }> = {};
  if (userIds.length > 0) {
    // Standard client — profiles are world-readable via RLS, no service role needed.
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, cover_url")
      .in("id", userIds);
    profiles?.forEach((p) => { profileMap[p.id] = p; });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Cerca pilota o team con cui correre.</p>
        </div>
        <Link href="/cerca/nuovo">
          <Button><Plus className="h-4 w-4" /> Pubblica annuncio</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <form action="/cerca" method="get" className="flex flex-1 gap-2 min-w-0">
          {sp.tipo && <input type="hidden" name="tipo" value={sp.tipo} />}
          {sp.gioco && <input type="hidden" name="gioco" value={sp.gioco} />}
          {sp.ordina && <input type="hidden" name="ordina" value={sp.ordina} />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Cerca annunci..."
            className="min-w-0 flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary" className="shrink-0">Cerca</Button>
        </form>
        <Suspense>
          <SortSelect options={SORT_OPTIONS} />
        </Suspense>
      </div>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/cerca" paramKey="tipo" value={null} label="Tutti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_pilota" label="Team cerca piloti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_team" label="Piloti cercano team" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip baseHref="/cerca" paramKey="gioco" value={null} label="Tutti giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/cerca" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
      </Suspense>

      {posts && posts.length > 0 ? (
        <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const isOwner = userId && p.user_id === userId;
            const isPilota = p.post_type === "cerca_pilota";
            const profile = p.user_id ? profileMap[p.user_id] : null;
            const authorName = profile?.display_name || profile?.username || "Utente";
            const gameName = Array.isArray(p.games) ? p.games[0]?.name : (p.games as { name: string } | null)?.name;
            return (
              <div key={p.id} className="group rounded-2xl overflow-hidden h-full flex flex-col border border-[var(--color-border)] hover:border-[var(--color-border-strong)] shadow-xl hover:-translate-y-1 transition-all duration-200 relative bg-[var(--color-bg-elev)]">
                <Link href={`/cerca/${p.id}`} className="absolute inset-0 z-[1]" aria-label={p.title} />

                {/* Cover del profilo (o gradiente racing di fallback) */}
                <div className="relative h-24 overflow-hidden">
                  {profile?.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
                  )}
                  {/* fade verso il corpo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-elev)] to-transparent" />
                  {/* badge tipo, sulla cover */}
                  <span className={`absolute top-3 right-3 z-[2] inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                    isPilota
                      ? "bg-blue-500/25 text-blue-200 border border-blue-500/40"
                      : "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40"
                  }`}>
                    {isPilota ? <Flag className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {isPilota ? "Cerca pilota" : "Cerca team"}
                  </span>
                </div>

                {/* Avatar che sborda sulla cover */}
                <div className="px-4 relative">
                  <div className="absolute -top-7 h-14 w-14 rounded-full overflow-hidden border-[3px] border-[var(--color-bg-elev)] bg-[var(--color-bg-elev-2)] flex items-center justify-center text-sm font-bold text-[var(--color-primary)] z-[2]">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt={authorName} className="object-cover w-full h-full" />
                    ) : (
                      authorName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  {isOwner && (
                    <div className="absolute right-4 -top-1 z-[2]">
                      <PostActions postId={p.id} />
                    </div>
                  )}
                </div>

                {/* Body: nome + info */}
                <div className="flex flex-col flex-1 px-4 pt-9 pb-3 gap-0.5">
                  <p className="font-bold text-base text-white leading-tight truncate" style={{ fontFamily: "var(--font-heading)" }}>{authorName}</p>
                  {gameName && (
                    <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide mt-1.5">{gameName}</span>
                  )}
                  <h3 className="font-semibold text-[15px] text-white leading-snug mt-0.5">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                  )}
                </div>

                {/* Footer: contatto */}
                {p.contact && (
                  <div className="px-4 pb-3.5 pt-2.5 border-t border-[var(--color-border)] mt-auto">
                    <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)] text-xs z-[2] relative">
                      <BrandIcon contact={p.contact} className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                      <span className="truncate">{p.contact}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <Search className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold mb-1">Nessun annuncio</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Pubblica il primo.</p>
            <Link href="/cerca/nuovo"><Button>Pubblica annuncio</Button></Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
