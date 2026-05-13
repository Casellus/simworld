import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { GAMES, EVENT_TYPES } from "@/lib/constants";
import { Calendar, Plus, MapPin, Users } from "lucide-react";

export const metadata = { title: "Eventi · SimWorld" };

type SP = Promise<{ gioco?: string; tipo?: string }>;

export default async function EventiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("id, slug, title, description, start_at, event_type, track, car_class, max_participants, games(slug, name), teams:host_team_id(name, slug)")
    .gte("start_at", new Date(Date.now() - 86_400_000).toISOString())
    .order("start_at", { ascending: true });

  if (sp.gioco) {
    const game = GAMES.find((g) => g.slug === sp.gioco);
    if (game) {
      const { data: g } = await supabase.from("games").select("id").eq("slug", game.slug).single();
      if (g) query = query.eq("game_id", g.id);
    }
  }
  if (sp.tipo) query = query.eq("event_type", sp.tipo);

  const { data: events } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Eventi</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Tornei, campionati, amichevoli.</p>
        </div>
        <Link href="/eventi/nuovo">
          <Button>
            <Plus className="h-4 w-4" /> Crea evento
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip href="/eventi" active={!sp.gioco && !sp.tipo}>
          Tutti
        </FilterChip>
        {GAMES.map((g) => (
          <FilterChip
            key={g.slug}
            href={`/eventi?gioco=${g.slug}${sp.tipo ? `&tipo=${sp.tipo}` : ""}`}
            active={sp.gioco === g.slug}
          >
            {g.short}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {EVENT_TYPES.map((t) => (
          <FilterChip
            key={t.value}
            href={`/eventi?tipo=${t.value}${sp.gioco ? `&gioco=${sp.gioco}` : ""}`}
            active={sp.tipo === t.value}
          >
            {t.label}
          </FilterChip>
        ))}
      </div>

      {events && events.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/eventi/${e.slug}`}>
              <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary">{e.event_type}</Badge>
                    {/* @ts-expect-error join */}
                    {e.games?.name && <Badge>{e.games.name}</Badge>}
                  </div>
                  <h3 className="font-bold text-lg">{e.title}</h3>
                  {e.description && (
                    <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2">{e.description}</p>
                  )}
                  <div className="text-xs text-[var(--color-fg-muted)] space-y-1 pt-2 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {formatDate(e.start_at)}
                    </div>
                    {e.track && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {e.track}
                      </div>
                    )}
                    {e.max_participants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" /> max {e.max_participants}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <Calendar className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold uppercase mb-1">Nessun evento</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Nessun evento corrisponde ai filtri.</p>
            <Link href="/eventi/nuovo">
              <Button>Crea primo evento</Button>
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
