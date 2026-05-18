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

type SP = Promise<{ gioco?: string; q?: string }>;

export default async function AssettiPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  let q = supabase
    .from("setups")
    .select("id, title, car, track, conditions, category, setup_type, downloads, rating_sum, photo_url, games(slug, name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (gameId) q = q.eq("game_id", gameId);
  if (sp.q) q = q.or(`title.ilike.%${sp.q}%,car.ilike.%${sp.q}%,track.ilike.%${sp.q}%`);

  const { data: all } = await q;

  const autoSetups = (all ?? []).filter((s) => s.setup_type !== "simulatore");
  const simSetups  = (all ?? []).filter((s) => s.setup_type === "simulatore");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Assetti</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Setup e configurazioni condivisi dalla community.</p>
        </div>
        <Link href="/assetti/carica">
          <Button><Plus className="h-4 w-4" /> Carica assetto</Button>
        </Link>
      </div>

      <form action="/assetti" method="get" className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Cerca per titolo, auto o pista..."
          className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <Button type="submit" variant="secondary">Cerca</Button>
      </form>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-10">
          <FilterChip baseHref="/assetti" paramKey="gioco" value={null} label="Tutti i giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/assetti" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
      </Suspense>

      {/* ── ASSETTI AUTO ── */}
      <Section
        icon={<Car className="h-5 w-5 text-[var(--color-primary)]" />}
        title="Assetti auto"
        emptyLabel="Nessun assetto auto trovato."
        href="/assetti/carica?tipo=auto"
      >
        {autoSetups.map((s) => {
          const game = one<{ name: string }>(s.games);
          return <SetupCard key={s.id} s={s} game={game} />;
        })}
      </Section>

      {/* ── CONFIGURAZIONI SIMULATORE ── */}
      <Section
        icon={<Cpu className="h-5 w-5 text-[var(--color-accent)]" />}
        title="Configurazioni simulatore"
        emptyLabel="Nessuna configurazione simulatore trovata."
        href="/assetti/carica?tipo=simulatore"
        accent
      >
        {simSetups.map((s) => {
          const game = one<{ name: string }>(s.games);
          return <SetupCard key={s.id} s={s} game={game} />;
        })}
      </Section>
    </div>
  );
}

type S = {
  id: string; title: string; car: string | null; track: string | null;
  conditions: string | null; category: string | null; setup_type: string;
  downloads: number; rating_sum: number; photo_url: string | null;
  games: { name: string } | { name: string }[];
};

function SetupCard({ s, game }: { s: S; game: { name: string } | null | undefined }) {
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
              catLabel && <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
                <Cpu className="h-3 w-3 text-[var(--color-accent)]" /> {catLabel}
              </div>
            ) : (
              <>
                {s.car  && <div className="flex items-center gap-1.5 text-[var(--color-fg-muted)]"><Car    className="h-3 w-3 text-[var(--color-primary)]" /> {s.car}</div>}
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

function Section({
  icon, title, emptyLabel, href, accent = false, children,
}: {
  icon: React.ReactNode; title: string; emptyLabel: string; href: string; accent?: boolean; children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean);
  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {hasItems ? (
        <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      ) : (
        <Card>
          <CardBody className="text-center py-10">
            <Settings2 className="h-10 w-10 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">{emptyLabel}</p>
            <Link href={href}>
              <Button variant={accent ? "secondary" : "primary"} size="sm">Carica il primo</Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </section>
  );
}
