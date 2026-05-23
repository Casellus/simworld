import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { GAMES } from "@/lib/constants";
import { Settings2, Plus, Car, Cpu } from "lucide-react";
import { one } from "@/lib/types";
import { Suspense } from "react";
import { AssettiSort } from "./assetti-sort";

export const metadata = { title: "Assetti · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ gioco?: string; q?: string; tipo?: string; ordina?: string }>;

export default async function AssettiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tipo: "auto" | "simulatore" = sp.tipo === "simulatore" ? "simulatore" : "auto";
  const ordina = sp.ordina ?? "recenti";
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  const orderMap: Record<string, { col: string; asc: boolean }> = {
    recenti:  { col: "created_at", asc: false },
    vecchi:   { col: "created_at", asc: true },
    rating:   { col: "rating_sum", asc: false },
    az:       { col: "title",      asc: true },
    za:       { col: "title",      asc: false },
  };
  const { col, asc } = orderMap[ordina] ?? orderMap.recenti;

  let q = supabase
    .from("setups")
    .select("id, title, car, track, conditions, category, setup_type, downloads, rating_sum, rating_count, photo_url, user_id, games(slug, name)")
    .order(col, { ascending: asc })
    .limit(50);

  // NULL setup_type = assetto auto (retrocompatibilità con record precedenti)
  if (tipo === "auto") {
    q = q.or("setup_type.eq.auto,setup_type.is.null");
  } else {
    q = q.eq("setup_type", tipo);
  }

  if (gameId) q = q.eq("game_id", gameId);
  if (sp.q) q = q.or(`title.ilike.%${sp.q}%,car.ilike.%${sp.q}%,track.ilike.%${sp.q}%`);

  const { data: rawSetups, error: setupsError } = await q;
  if (setupsError) console.error("SETUPS ERROR:", JSON.stringify(setupsError));

  // Fetch profiles separatamente per evitare problemi RLS con join
  const userIds = [...new Set((rawSetups ?? []).map((s) => s.user_id).filter(Boolean))];
  const profileMap = new Map<string, { username: string; display_name: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", userIds);
    for (const p of profiles ?? []) profileMap.set(p.id, p);
  }

  const setups = (rawSetups ?? []).map((s) => ({
    ...s,
    profiles: profileMap.get(s.user_id) ?? null,
  }));

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

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <form action="/assetti" method="get" className="flex flex-1 gap-2 min-w-0">
          <input type="hidden" name="tipo" value={tipo} />
          {sp.gioco && <input type="hidden" name="gioco" value={sp.gioco} />}
          {ordina !== "recenti" && <input type="hidden" name="ordina" value={ordina} />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder={tipo === "auto" ? "Cerca per titolo, auto o pista..." : "Cerca per titolo..."}
            className="min-w-0 flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary" className="shrink-0">Cerca</Button>
        </form>
        <Suspense>
          <AssettiSort current={ordina} tipo={tipo} gioco={sp.gioco} q={sp.q} />
        </Suspense>
      </div>

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
  downloads: number; rating_sum: number; rating_count: number; photo_url: string | null;
  user_id: string;
  games: { name: string; slug: string } | { name: string; slug: string }[];
  profiles: { username: string; display_name: string | null } | null;
};

function GameGroups({ setups, tipo }: { setups: S[]; tipo: string }) {
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
            <h2 className="text-lg font-extrabold tracking-tight text-white">{name}</h2>
            <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-2 py-0.5 rounded-full">{items.length}</span>
            <div className="flex-1 h-px bg-[var(--color-border-strong)]" />
          </div>
          <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => <SetupCard key={s.id} s={s} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SetupCard({ s }: { s: S }) {
  const author = s.profiles?.display_name || s.profiles?.username || "Anonimo";
  const positivi = (s.rating_count + s.rating_sum) / 2;
  const stelle = s.rating_count > 0 ? (positivi / s.rating_count) * 5 : null;
  const rating = stelle !== null ? stelle.toFixed(1) : null;
  return (
    <Link href={`/assetti/${s.id}`}>
      <div className="rounded-2xl overflow-hidden h-full flex flex-col shadow-xl hover:scale-[1.02] transition-transform duration-200">
        {/* Immagine */}
        <div className="relative h-44 shrink-0">
          {s.photo_url ? (
            <Image src={s.photo_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1a2a4a] via-[#0d1b3e] to-[#050507]" />
          )}
          {/* Badge stelle */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 shadow-md">
            <span className="text-yellow-400 text-sm leading-none">★</span>
            <span className="text-xs font-bold text-gray-800 leading-none">{rating ?? "–"}</span>
          </div>
        </div>
        {/* Pannello info */}
        <div className="flex flex-col flex-1 px-4 py-3 bg-[var(--color-bg-elev)]">
          <h3 className="font-bold text-base text-white leading-tight">{s.title}</h3>
          <p className="text-sm text-[var(--color-fg-muted)] mt-0.5 truncate">di {author}</p>
        </div>
      </div>
    </Link>
  );
}
