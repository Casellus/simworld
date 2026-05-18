import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { GAMES, SIM_CATEGORIES } from "@/lib/constants";
import { Settings2, Download, ThumbsUp, Plus, MapPin, Car, Cpu } from "lucide-react";
import { one } from "@/lib/types";
import { Suspense } from "react";

export const metadata = { title: "Assetti · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ gioco?: string; q?: string; tipo?: string }>;

export default async function AssettiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tipo: "auto" | "simulatore" = sp.tipo === "simulatore" ? "simulatore" : "auto";
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  let q = supabase
    .from("setups")
    .select("id, title, car, track, conditions, category, setup_type, downloads, rating_sum, photo_url, games(slug, name)")
    .eq("setup_type", tipo)
    .order("created_at", { ascending: false })
    .limit(50);

  if (gameId) q = q.eq("game_id", gameId);
  if (sp.q) q = q.or(`title.ilike.%${sp.q}%,car.ilike.%${sp.q}%,track.ilike.%${sp.q}%`);

  const { data: setups } = await q;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Assetti</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Setup e configurazioni condivisi dalla community.</p>
        </div>
        <Link href={`/assetti/carica?tipo=${tipo}`}>
          <Button><Plus className="h-4 w-4" /> Carica assetto</Button>
        </Link>
      </div>

      {/* Tab tipo */}
      <Suspense>
        <div className="flex gap-2 mb-6">
          <FilterChip baseHref="/assetti" paramKey="tipo" value="auto"       label="Assetti auto" />
          <FilterChip baseHref="/assetti" paramKey="tipo" value="simulatore" label="Configurazioni simulatore" />
        </div>
      </Suspense>

      <form action="/assetti" method="get" className="flex gap-2 mb-6">
        <input type="hidden" name="tipo" value={tipo} />
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder={tipo === "auto" ? "Cerca per titolo, auto o pista..." : "Cerca per titolo..."}
          className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <Button type="submit" variant="secondary">Cerca</Button>
      </form>

      {/* Filtro gioco */}
      <Suspense>
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip baseHref="/assetti" paramKey="gioco" value={null} label="Tutti i giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/assetti" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
      </Suspense>

      {setups && setups.length > 0 ? (
        <GameGroups setups={setups} tipo={tipo} />
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            {tipo === "simulatore"
              ? <Cpu className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
              : <Settings2 className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />}
            <h3 className="font-bold mb-1">
              {tipo === "simulatore" ? "Nessuna configurazione" : "Nessun assetto"}
            </h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Carica il primo.</p>
            <Link href={`/assetti/carica?tipo=${tipo}`}><Button>Carica</Button></Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

type S = {
  id: string; title: string; car: string | null; track: string | null;
  conditions: string | null; category: string | null; setup_type: string;
  downloads: number; rating_sum: number; photo_url: string | null;
  games: { name: string; slug: string } | { name: string; slug: string }[];
};

function GameGroups({ setups, tipo }: { setups: S[]; tipo: string }) {
  // Raggruppa per gioco preservando l'ordine di GAMES
  const gameOrder: string[] = GAMES.map((g) => g.slug);
  const groups = new Map<string, { name: string; slug: string; items: S[] }>();

  for (const s of setups) {
    const g = one<{ name: string; slug: string }>(s.games);
    const slug = g?.slug ?? "altro";
    const name = g?.name ?? "Altro";
    if (!groups.has(slug)) groups.set(slug, { name, slug, items: [] });
    groups.get(slug)!.items.push(s);
  }

  const sorted = [...groups.values()].sort((a, b) => {
    const ia = gameOrder.indexOf(a.slug);
    const ib = gameOrder.indexOf(b.slug);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return (
    <div className="space-y-10">
      {sorted.map(({ name, slug, items }) => (
        <section key={slug}>
          <div className="flex items-center gap-3 mb-4">
            {tipo === "simulatore"
              ? <Cpu className="h-4 w-4 text-[var(--color-accent)]" />
              : <Car className="h-4 w-4 text-[var(--color-primary)]" />}
            <h2 className="text-lg font-bold tracking-tight">{name}</h2>
            <span className="text-xs text-[var(--color-fg-muted)]">({items.length})</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>
          <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => <SetupCard key={s.id} s={s} game={one<{ name: string; slug: string }>(s.games)} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SetupCard({ s, game }: { s: S; game: { name: string; slug: string } | null | undefined }) {
  const catLabel = SIM_CATEGORIES.find((c) => c.value === s.category)?.label ?? s.category;
  return (
    <Link href={`/assetti/${s.id}`}>
      <Card className="h-full hover:border-[var(--color-primary)] transition-colors overflow-hidden">
        {s.photo_url && (
          <div className="w-full h-36 overflow-hidden relative">
            <Image src={s.photo_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          </div>
        )}
        <CardBody className="space-y-3">
          <Badge>{game?.name}</Badge>
          <h3 className="font-bold">{s.title}</h3>
          <div className="text-xs space-y-1.5">
            {s.setup_type === "simulatore" ? (
              catLabel && (
                <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
                  <Cpu className="h-3 w-3 text-[var(--color-accent)]" /> {catLabel}
                </div>
              )
            ) : (
              <>
                {s.car   && <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]"><Car    className="h-3 w-3 text-[var(--color-primary)]" /> {s.car}</div>}
                {s.track && <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]"><MapPin className="h-3 w-3 text-[var(--color-accent)]"  /> {s.track}</div>}
                {s.conditions && <div className="italic text-[var(--color-fg-muted)]/70">{s.conditions}</div>}
              </>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs">
            <span className="flex items-center gap-1 text-[var(--color-fg-muted)]"><Download className="h-3 w-3 text-[var(--color-primary)]" /> {s.downloads}</span>
            <span className="flex items-center gap-1 text-[var(--color-fg-muted)]"><ThumbsUp className="h-3 w-3 text-[var(--color-success)]" /> {s.rating_sum}</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
