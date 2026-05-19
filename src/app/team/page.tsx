import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Flag, Users } from "lucide-react";

export const revalidate = 30;
export const metadata = { title: "Team · SimUniverse" };

type SP = Promise<{ q?: string; recruiting?: string }>;

export default async function TeamPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("teams")
    .select("id, slug, name, description, recruiting, country, logo_url, team_members(count)")
    .order("created_at", { ascending: false });

  if (sp.q) q = q.ilike("name", `%${sp.q}%`);
  if (sp.recruiting === "1") q = q.eq("recruiting", true);

  const { data: teams } = await q;

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

      <form className="flex gap-2 mb-6" action="/team" method="get">
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Cerca team..."
          className="flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm px-3 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] cursor-pointer">
          <input type="checkbox" name="recruiting" value="1" defaultChecked={sp.recruiting === "1"} />
          Solo che reclutano
        </label>
        <Button type="submit" variant="secondary">
          Filtra
        </Button>
      </form>

      {teams && teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Link key={t.id} href={`/team/${t.slug}`}>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden hover:border-[var(--color-primary)] transition-colors h-full flex flex-col">
                {/* TOP */}
                <div className="relative h-32 shrink-0 overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]">
                  {t.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover opacity-40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    {t.recruiting && <Badge variant="success" className="text-[10px]">Recluta</Badge>}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="h-10 w-10 rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      {t.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover" />
                      ) : (
                        <Flag className="h-5 w-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                  </div>
                </div>
                {/* BOTTOM */}
                <div className="flex flex-col flex-1 p-4 bg-[#111118]">
                  <h3 className="font-bold text-base leading-tight mb-1">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-[var(--color-fg-muted)] line-clamp-2 mb-auto">{t.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5 text-[var(--color-fg-muted)]">
                      <span className="text-xl font-extrabold text-[var(--color-fg)]">{t.team_members?.[0]?.count ?? 0}</span>
                      <span className="text-sm font-semibold">Piloti</span>
                    </span>
                  </div>
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
