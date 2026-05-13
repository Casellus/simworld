import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GAMES } from "@/lib/constants";
import { Settings2, Download, ThumbsUp, Plus, MapPin, Car } from "lucide-react";
import { one } from "@/lib/types";

export const metadata = { title: "Assetti · SimWorld" };

type SP = Promise<{ gioco?: string; q?: string }>;

export default async function AssettiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("setups")
    .select("id, title, car, track, conditions, downloads, rating_sum, rating_count, games(slug, name), profiles(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (sp.gioco) {
    const game = GAMES.find((g) => g.slug === sp.gioco);
    if (game) {
      const { data: g } = await supabase.from("games").select("id").eq("slug", game.slug).single();
      if (g) q = q.eq("game_id", g.id);
    }
  }
  if (sp.q) q = q.or(`title.ilike.%${sp.q}%,car.ilike.%${sp.q}%,track.ilike.%${sp.q}%`);

  const { data: setups } = await q;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Assetti</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Setup condivisi dalla community.</p>
        </div>
        <Link href="/assetti/carica">
          <Button>
            <Plus className="h-4 w-4" /> Carica assetto
          </Button>
        </Link>
      </div>

      <form action="/assetti" method="get" className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Cerca per titolo, auto o pista..."
          className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <Button type="submit" variant="secondary">
          Cerca
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip href="/assetti" active={!sp.gioco}>
          Tutti
        </FilterChip>
        {GAMES.map((g) => (
          <FilterChip key={g.slug} href={`/assetti?gioco=${g.slug}`} active={sp.gioco === g.slug}>
            {g.short}
          </FilterChip>
        ))}
      </div>

      {setups && setups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {setups.map((s) => {
            const game = one<{ name: string }>(s.games);
            const author = one<{ username: string; display_name: string | null }>(s.profiles);
            return (
              <Link key={s.id} href={`/assetti/${s.id}`}>
                <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
                  <CardBody className="space-y-3">
                    <Badge>{game?.name}</Badge>
                    <h3 className="font-bold">{s.title}</h3>
                    <div className="text-xs text-[var(--color-fg-muted)] space-y-1">
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3" /> {s.car}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.track}
                      </div>
                      {s.conditions && <div className="italic">{s.conditions}</div>}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-fg-muted)]">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {s.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {s.rating_sum}
                      </span>
                      <span>{author?.username}</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <Settings2 className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold uppercase mb-1">Nessun assetto</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Carica il primo.</p>
            <Link href="/assetti/carica">
              <Button>Carica assetto</Button>
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
