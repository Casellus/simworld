import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Search, Plus, Mail, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { GAMES } from "@/lib/constants";
import { Suspense } from "react";
import { PostActions } from "./post-actions";

export const metadata = { title: "Cerca pilota/team · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ tipo?: string; gioco?: string }>;

export default async function CercaPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
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
    .order("created_at", { ascending: false })
    .limit(50);

  if (sp.tipo) q = q.eq("post_type", sp.tipo);
  if (gameId) q = q.eq("game_id", gameId);

  const { data: posts } = await q;
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Cerca</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Cerca pilota o team con cui correre.</p>
        </div>
        <Link href="/cerca/nuovo">
          <Button><Plus className="h-4 w-4" /> Pubblica annuncio</Button>
        </Link>
      </div>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/cerca" paramKey="tipo" value={null} label="Tutti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_pilota" label="Team cerca piloti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_team" label="Piloti cercano team" />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip baseHref="/cerca" paramKey="gioco" value={null} label="Tutti giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/cerca" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
      </Suspense>

      {posts && posts.length > 0 ? (
        <div className="stagger grid gap-4 md:grid-cols-2">
          {posts.map((p) => {
            const gameArr = Array.isArray(p.games) ? p.games : p.games ? [p.games] : [];
            const game = gameArr[0] as { name: string; slug: string } | undefined;
            const isOwner = user && p.user_id === user.id;
            const contactIsUrl = p.contact ? /^https?:\/\//i.test(p.contact.trim()) : false;
            return (
              <div key={p.id} className="rounded-3xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)] transition-colors h-full flex flex-col relative" style={{ background: "#111118" }}>
                <Link href={`/cerca/${p.id}`} className="absolute inset-0 z-[1]" aria-label={p.title} />
                {/* TOP: gradient con tipo e gioco */}
                <div className="relative h-40 shrink-0 flex flex-col items-end justify-start p-3"
                  style={{ background: p.post_type === "cerca_pilota"
                    ? "linear-gradient(135deg, #0d2a1a, #0a1a2e, #050507)"
                    : "linear-gradient(135deg, #0d1b3e, #1a1a2e, #050507)" }}>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge variant={p.post_type === "cerca_pilota" ? "accent" : "primary"} className="text-[10px]">
                      {p.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
                    </Badge>
                    {game?.name && <Badge className="text-[10px]">{game.name}</Badge>}
                  </div>
                  {isOwner && (
                    <div className="absolute top-3 left-3 z-[2]">
                      <PostActions postId={p.id} />
                    </div>
                  )}
                </div>
                {/* BOTTOM con clip angolare */}
                <div className="flex flex-col flex-1 px-4 pb-4 pt-3 -mt-5 relative" style={{ clipPath: "polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 32px)", background: "#111118" }}>
                  <h3 className="font-bold text-base leading-tight mb-0.5">{p.title}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2 mb-auto">{p.description}</p>
                  <div className="flex items-end justify-between mt-6">
                    <span className="text-[var(--color-fg-muted)] text-sm leading-none">
                      <span className="text-lg font-extrabold text-[var(--color-fg)] mr-1">{formatDate(p.created_at)}</span>
                    </span>
                    {p.contact && (
                      <span className="flex items-center gap-1 text-[var(--color-fg-muted)] text-xs z-[2] relative">
                        {contactIsUrl
                          ? <ExternalLink className="h-3 w-3 text-[var(--color-primary)]" />
                          : <Mail className="h-3 w-3 text-[var(--color-primary)]" />}
                        {contactIsUrl ? "Link" : p.contact}
                      </span>
                    )}
                  </div>
                </div>
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
