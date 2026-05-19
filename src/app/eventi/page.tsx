import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { formatDate } from "@/lib/utils";
import { GAMES, EVENT_TYPES } from "@/lib/constants";
import { Calendar, Plus } from "lucide-react";
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

  const now = new Date().toISOString();
  let query = supabase
    .from("events")
    .select("id, slug, title, description, start_at, end_at, event_type, track, car_class, max_participants, banner_url, games(slug, name)")
    .or(`start_at.gte.${now},end_at.gte.${now}`)
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
              <div className="rounded-3xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)] transition-colors h-full flex flex-col" style={{ background: "#111118" }}>
                {/* TOP */}
                <div className="relative h-40 shrink-0">
                  {e.banner_url ? (
                    <Image src={e.banner_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <Badge variant="primary" className="text-[10px]">{e.event_type}</Badge>
                    {/* @ts-expect-error join */}
                    {e.games?.name && <Badge className="text-[10px]">{e.games.name}</Badge>}
                  </div>
                </div>
                {/* BOTTOM con clip angolare */}
                <div className="flex flex-col flex-1 px-4 pb-4 pt-3 -mt-5 relative" style={{ clipPath: "polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 32px)", background: "#111118" }}>
                  <h3 className="font-bold text-base leading-tight mb-0.5">{e.title}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] mb-auto">
                    {[e.track, e.event_type].filter(Boolean).join(" · ")}
                  </p>
                  <div className="flex items-end justify-between mt-6">
                    <span className="text-[var(--color-fg-muted)] text-sm leading-none">
                      <span className="text-lg font-extrabold text-[var(--color-fg)] mr-1">{formatDate(e.start_at)}</span>
                    </span>
                    {e.max_participants && (
                      <span className="text-[var(--color-fg-muted)] text-sm leading-none">
                        <span className="text-3xl font-extrabold text-[var(--color-fg)] mr-1">{e.max_participants}</span>Piloti
                      </span>
                    )}
                  </div>
                </div>
              </div>
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
