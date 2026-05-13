import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { GAMES } from "@/lib/constants";
import { one } from "@/lib/types";

export const metadata = { title: "Cerca pilota/team · SimWorld" };

type SP = Promise<{ tipo?: string; gioco?: string }>;

export default async function CercaPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("recruitment_posts")
    .select("id, post_type, title, description, contact, created_at, games(name, slug), profiles(username, display_name), teams(name, slug)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (sp.tipo) q = q.eq("post_type", sp.tipo);
  if (sp.gioco) {
    const game = GAMES.find((g) => g.slug === sp.gioco);
    if (game) {
      const { data: g } = await supabase.from("games").select("id").eq("slug", game.slug).single();
      if (g) q = q.eq("game_id", g.id);
    }
  }

  const { data: posts } = await q;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Cerca</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Cerca pilota o team con cui correre.</p>
        </div>
        <Link href="/cerca/nuovo">
          <Button>
            <Plus className="h-4 w-4" /> Pubblica annuncio
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <FilterChip href="/cerca" active={!sp.tipo}>
          Tutti
        </FilterChip>
        <FilterChip href="/cerca?tipo=cerca_pilota" active={sp.tipo === "cerca_pilota"}>
          Team cercano piloti
        </FilterChip>
        <FilterChip href="/cerca?tipo=cerca_team" active={sp.tipo === "cerca_team"}>
          Piloti cercano team
        </FilterChip>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterChip href={`/cerca${sp.tipo ? `?tipo=${sp.tipo}` : ""}`} active={!sp.gioco}>
          Tutti giochi
        </FilterChip>
        {GAMES.map((g) => (
          <FilterChip
            key={g.slug}
            href={`/cerca?gioco=${g.slug}${sp.tipo ? `&tipo=${sp.tipo}` : ""}`}
            active={sp.gioco === g.slug}
          >
            {g.short}
          </FilterChip>
        ))}
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((p) => {
            const game = one<{ name: string; slug: string }>(p.games);
            const team = one<{ name: string; slug: string }>(p.teams);
            const author = one<{ username: string; display_name: string | null }>(p.profiles);
            return (
            <Card key={p.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={p.post_type === "cerca_pilota" ? "accent" : "primary"}>
                    {p.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
                  </Badge>
                  {game?.name && <Badge>{game.name}</Badge>}
                </div>
                <h3 className="font-bold text-lg">{p.title}</h3>
                <p className="text-sm text-[var(--color-fg-muted)] whitespace-pre-wrap">{p.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-fg-muted)]">
                  <span>
                    {team?.name ? (
                      <Link href={`/team/${team.slug}`} className="hover:text-[var(--color-primary)]">
                        Team: {team.name}
                      </Link>
                    ) : author?.username ? (
                      <Link href={`/profilo/${author.username}`} className="hover:text-[var(--color-primary)]">
                        {author.display_name || author.username}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span>{formatDate(p.created_at)}</span>
                </div>
                {p.contact && (
                  <div className="text-xs flex items-center gap-1 text-[var(--color-fg-muted)]">
                    <Mail className="h-3 w-3" /> {p.contact}
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
            <h3 className="font-bold uppercase mb-1">Nessun annuncio</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Pubblica il primo.</p>
            <Link href="/cerca/nuovo">
              <Button>Pubblica annuncio</Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition-colors ${
        active
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
          : "bg-[var(--color-bg-elev)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:text-[var(--color-fg)]"
      }`}
    >
      {children}
    </Link>
  );
}
