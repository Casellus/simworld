import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Search, Plus, Mail, ExternalLink, User as UserIcon } from "lucide-react";
import { GAMES } from "@/lib/constants";
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
  if (sp.q) q = q.ilike("title", `%${sp.q}%`);

  const { data: posts } = await q;
  const { data: { user } } = await supabase.auth.getUser();

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id).filter(Boolean))];
  const profileMap: Record<string, { display_name: string | null; username: string | null; avatar_url: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url")
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

      <div className="flex gap-2 mb-6">
        <form action="/cerca" method="get" className="flex flex-1 gap-2">
          {sp.tipo && <input type="hidden" name="tipo" value={sp.tipo} />}
          {sp.gioco && <input type="hidden" name="gioco" value={sp.gioco} />}
          {sp.ordina && <input type="hidden" name="ordina" value={sp.ordina} />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Cerca annunci..."
            className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary">Cerca</Button>
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
            const isOwner = user && p.user_id === user.id;
            const contactIsUrl = p.contact ? /^https?:\/\//i.test(p.contact.trim()) : false;
            const isPilota = p.post_type === "cerca_pilota";
            const profile = p.user_id ? profileMap[p.user_id] : null;
            const authorName = profile?.display_name || profile?.username || "Utente";
            const gameName = Array.isArray(p.games) ? p.games[0]?.name : (p.games as { name: string } | null)?.name;
            return (
              <div key={p.id} className="rounded-2xl overflow-hidden h-full flex flex-col shadow-xl hover:scale-[1.02] transition-transform duration-200 relative bg-[var(--color-bg-elev)]">
                <Link href={`/cerca/${p.id}`} className="absolute inset-0 z-[1]" aria-label={p.title} />

                {/* Header: avatar + nome + badge */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={authorName} width={44} height={44} className="object-cover w-full h-full" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-[var(--color-fg-muted)]" />
                    )}
                  </div>
                  {/* Nome + badge */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white leading-tight truncate">{authorName}</p>
                    <span className={`inline-flex items-center gap-1 mt-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isPilota
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      <span className="leading-none">{isPilota ? "🏁" : "🧑‍✈️"}</span>
                      {isPilota ? "Cerca pilota" : "Cerca team"}
                    </span>
                  </div>
                  {isOwner && (
                    <div className="relative z-[2]">
                      <PostActions postId={p.id} />
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--color-border)] mx-4" />

                {/* Body */}
                <div className="flex flex-col flex-1 px-4 py-3 gap-1.5">
                  {/* Gioco */}
                  {gameName && (
                    <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">{gameName}</span>
                  )}
                  <h3 className="font-bold text-base text-white leading-tight">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2 mt-0.5">{p.description}</p>
                  )}
                </div>

                {/* Footer: contatto */}
                {p.contact && (
                  <div className="px-4 pb-3 pt-1 border-t border-[var(--color-border)] mt-auto">
                    <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)] text-xs z-[2] relative">
                      {contactIsUrl
                        ? <ExternalLink className="h-3 w-3 text-[var(--color-primary)]" />
                        : <Mail className="h-3 w-3 text-[var(--color-primary)]" />}
                      <span className="truncate">{contactIsUrl ? p.contact : p.contact}</span>
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
