import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Search, Plus, Mail } from "lucide-react";
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
            return (
              <Card key={p.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={p.post_type === "cerca_pilota" ? "accent" : "primary"}>
                        {p.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
                      </Badge>
                      {game?.name && <Badge>{game.name}</Badge>}
                    </div>
                    {isOwner && <PostActions postId={p.id} />}
                  </div>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] whitespace-pre-wrap">{p.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-fg-muted)]">
                    <span>{formatDate(p.created_at)}</span>
                  </div>
                  {p.contact && (
                    <div className="text-xs flex items-center gap-1.5 text-[var(--color-fg-muted)]">
                      <Mail className="h-3 w-3 text-[var(--color-primary)]" /> {p.contact}
                    </div>
                  )}
                </CardBody>
              </Card>
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
