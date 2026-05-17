import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { formatDate } from "@/lib/utils";
import { GAMES, EVENT_TYPES } from "@/lib/constants";
import { Calendar, Plus, MapPin, Users } from "lucide-react";
import { Suspense } from "react";

export const metadata = { title: "Eventi · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ gioco?: string; tipo?: string }>;

async function fetchEvents(gioco?: string, tipo?: string) {
  const supabase = await createClient();

  // resolve game id without extra round-trip when no filter
  let gameId: string | null = null;
  if (gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", gioco).single();
    gameId = g?.id ?? null;
  }

  const sinceYesterday = new Date(Date.now() - 86_400_000).toISOString();
  let query = supabase
    .from("events")
    .select("id, slug, title, description, start_at, event_type, track, car_class, max_participants, banner_url, games(slug, name)")
    .gte("start_at", sinceYesterday)
    .order("start_at", { ascending: true });

  if (gameId) query = query.eq("game_id", gameId);
  if (tipo) query = query.eq("event_type", tipo);

  const { data } = await query;
  return data;
}

export default async function EventiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const events = await fetchEvents(sp.gioco, sp.tipo);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Eventi</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Tornei, campionati, amichevoli.</p>
        </div>
        <Link href="/eventi/nuovo">
          <Button>
            <Plus className="h-4 w-4" /> Crea evento
          </Button>
        </Link>
      </div>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/eventi" paramKey="gioco" value={null} label="Tutti" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/eventi" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {EVENT_TYPES.map((t) => (
            <FilterChip key={t.value} baseHref="/eventi" paramKey="tipo" value={t.value} label={t.label} />
          ))}
        </div>
      </Suspense>

      {events && events.length > 0 ? (
        <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/eventi/${e.slug}`}>
              <Card className="h-full hover:border-[var(--color-primary)] transition-colors overflow-hidden">
                {e.banner_url && (
                  <div className="relative w-full h-36">
                    <Image
                      src={e.banner_url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
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
                  <div className="text-xs space-y-1.5 pt-2 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                      <Calendar className="h-3 w-3 text-[var(--color-primary)]" /> {formatDate(e.start_at)}
                    </div>
                    {e.track && (
                      <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <MapPin className="h-3 w-3 text-[var(--color-accent)]" /> {e.track}
                      </div>
                    )}
                    {e.max_participants && (
                      <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
                        <Users className="h-3 w-3 text-[var(--color-success)]" /> max {e.max_participants}
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
            <h3 className="font-bold mb-1">Nessun evento</h3>
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
