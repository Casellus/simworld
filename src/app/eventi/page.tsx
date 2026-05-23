import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { SortSelect } from "@/components/ui/sort-select";
import { formatDate } from "@/lib/utils";
import { GAMES, EVENT_TYPES } from "@/lib/constants";
import { Calendar, Plus } from "lucide-react";
import { Suspense } from "react";

export const metadata = { title: "Eventi · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ gioco?: string; tipo?: string; ordina?: string; q?: string }>;

const SORT_OPTIONS = [
  { value: "prossimi", label: "Prossimi" },
  { value: "recenti",  label: "Più recenti" },
  { value: "az",       label: "A → Z" },
];

const ORDER_MAP: Record<string, { col: string; asc: boolean }> = {
  prossimi: { col: "start_at",   asc: true  },
  recenti:  { col: "created_at", asc: false },
  az:       { col: "title",      asc: true  },
};

export default async function EventiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ordina = sp.ordina ?? "prossimi";
  const { col, asc } = ORDER_MAP[ordina] ?? ORDER_MAP.prossimi;
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  const now = new Date().toISOString();
  let query = supabase
    .from("events")
    .select("id, slug, title, description, start_at, end_at, event_type, track, car_class, max_participants, banner_url, games(slug, name)")
    .or(`start_at.gte.${now},end_at.gte.${now}`)
    .order(col, { ascending: asc });

  if (gameId) query = query.eq("game_id", gameId);
  if (sp.tipo) query = query.eq("event_type", sp.tipo);
  if (sp.q) query = query.ilike("title", `%${sp.q}%`);

  const { data: events } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Eventi</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Tornei, campionati, amichevoli.</p>
        </div>
        <Link href="/eventi/nuovo">
          <Button><Plus className="h-4 w-4" /> Crea evento</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <form action="/eventi" method="get" className="flex flex-1 gap-2 min-w-0">
          {sp.gioco && <input type="hidden" name="gioco" value={sp.gioco} />}
          {sp.tipo && <input type="hidden" name="tipo" value={sp.tipo} />}
          {sp.ordina && <input type="hidden" name="ordina" value={sp.ordina} />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Cerca eventi..."
            className="min-w-0 flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary" className="shrink-0">Cerca</Button>
        </form>
        <Suspense>
          <SortSelect options={SORT_OPTIONS} defaultValue="prossimi" />
        </Suspense>
      </div>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/eventi" paramKey="gioco" value={null} label="Tutti" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/eventi" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {EVENT_TYPES.map((t) => (
            <FilterChip key={t.value} baseHref="/eventi" paramKey="tipo" value={t.value} label={t.label} />
          ))}
        </div>
      </Suspense>

      {events && events.length > 0 ? (
        <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Link key={e.id} href={`/eventi/${e.slug}`}>
              <div className="rounded-2xl overflow-hidden h-full flex flex-col shadow-xl hover:scale-[1.02] transition-transform duration-200">
                <div className="relative h-44 shrink-0">
                  {e.banner_url ? (
                    <Image src={e.banner_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 shadow-md">
                    <span className="text-sm leading-none">📅</span>
                    <span className="text-xs font-bold text-gray-800 leading-none">{formatDate(e.start_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 px-4 py-3 bg-[var(--color-bg-elev)]">
                  <h3 className="font-bold text-base text-white leading-tight">{e.title}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] mt-0.5 truncate">
                    {[e.track, e.event_type].filter(Boolean).join(" · ")}
                  </p>
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
            <Link href="/eventi/nuovo"><Button>Crea primo evento</Button></Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
