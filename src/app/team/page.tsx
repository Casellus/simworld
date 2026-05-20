import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/ui/sort-select";
import { Plus, Users } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 30;
export const metadata = { title: "Team · SimUniverse" };

type SP = Promise<{ q?: string; recruiting?: string; ordina?: string }>;

const SORT_OPTIONS = [
  { value: "recenti", label: "Più recenti" },
  { value: "az",      label: "A → Z" },
  { value: "membri",  label: "Più membri" },
];

const ORDER_MAP: Record<string, { col: string; asc: boolean }> = {
  recenti: { col: "created_at", asc: false },
  az:      { col: "name",       asc: true  },
  membri:  { col: "created_at", asc: false }, // fallback, sorted client-side below
};

export default async function TeamPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ordina = sp.ordina ?? "recenti";
  const { col, asc } = ORDER_MAP[ordina] ?? ORDER_MAP.recenti;
  const supabase = await createClient();

  let dbq = supabase
    .from("teams")
    .select("id, slug, name, description, recruiting, country, logo_url, team_members(count)")
    .order(col, { ascending: asc });

  if (sp.q) dbq = dbq.ilike("name", `%${sp.q}%`);
  if (sp.recruiting === "1") dbq = dbq.eq("recruiting", true);

  const { data: teamsRaw } = await dbq;
  const teams = ordina === "membri"
    ? (teamsRaw ?? []).sort((a, b) => (b.team_members?.[0]?.count ?? 0) - (a.team_members?.[0]?.count ?? 0))
    : (teamsRaw ?? []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Team</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Trova squadre o crea la tua.</p>
        </div>
        <Link href="/team/nuovo">
          <Button>
            <Plus className="h-4 w-4" /> Crea team
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <form action="/team" method="get" className="flex flex-1 gap-2">
          {sp.recruiting === "1" && <input type="hidden" name="recruiting" value="1" />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Cerca team..."
            className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary">Cerca</Button>
        </form>
        <Link href={sp.recruiting === "1"
          ? `/team${sp.q ? `?q=${sp.q}` : ""}`
          : `/team?recruiting=1${sp.q ? `&q=${sp.q}` : ""}`}
        >
          <div className={`flex items-center gap-3 h-10 px-3 rounded-xl border cursor-pointer transition-all duration-150 text-sm font-medium select-none ${
            sp.recruiting === "1"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
          }`}>
            <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
              sp.recruiting === "1"
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                : "border-[var(--color-border-strong)] bg-transparent"
            }`}>
              {sp.recruiting === "1" && (
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            Solo che reclutano
          </div>
        </Link>
        <Suspense>
          <SortSelect options={SORT_OPTIONS} />
        </Suspense>
      </div>

      {teams && teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Link key={t.id} href={`/team/${t.slug}`}>
              <div className="rounded-2xl overflow-hidden h-full flex flex-col shadow-xl hover:scale-[1.02] transition-transform duration-200">
                {/* Immagine */}
                <div className="relative h-44 shrink-0 bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]">
                  {t.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover opacity-40" />
                  )}
                  {/* Badge piloti */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 shadow-md">
                    <span className="text-sm leading-none">👥</span>
                    <span className="text-xs font-bold text-gray-800 leading-none">{t.team_members?.[0]?.count ?? 0}</span>
                  </div>
                  {t.recruiting && (
                    <div className="absolute top-3 left-3 bg-[var(--color-success)] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      Recluta
                    </div>
                  )}
                </div>
                {/* Pannello info */}
                <div className="flex flex-col flex-1 px-4 py-3 bg-[var(--color-bg-elev)]">
                  <h3 className="font-bold text-base text-white leading-tight">{t.name}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] mt-0.5 truncate">{t.description ?? "Team sim racing"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <Users className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold mb-1">Nessun team</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Nessun team trovato.</p>
            <Link href="/team/nuovo">
              <Button>Crea primo team</Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
