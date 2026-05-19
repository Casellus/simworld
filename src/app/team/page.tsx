import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

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
              <div className="rounded-3xl border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)] transition-colors h-full flex flex-col" style={{ background: "#111118" }}>
                {/* TOP */}
                <div className="relative h-40 shrink-0 bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]">
                  {t.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover opacity-40" />
                  )}
                  <div className="absolute top-3 right-3">
                    {t.recruiting && <Badge variant="success" className="text-[10px]">Recluta</Badge>}
                  </div>
                </div>
                {/* BOTTOM con clip angolare */}
                <div className="flex flex-col flex-1 px-4 pb-4 pt-3 -mt-5 relative" style={{ clipPath: "polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 32px)", background: "#111118" }}>
                  <h3 className="font-bold text-base leading-tight mb-0.5">{t.name}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] mb-auto line-clamp-1">
                    {t.description ?? "Team sim racing"}
                  </p>
                  <div className="flex items-end justify-between mt-6">
                    <span className="text-[var(--color-fg-muted)] text-sm leading-none">
                      <span className="text-3xl font-extrabold text-[var(--color-fg)] mr-1">{t.team_members?.[0]?.count ?? 0}</span>Piloti
                    </span>
                    {t.logo_url && (
                      <div className="h-10 w-10 rounded-lg border border-white/10 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.logo_url} alt={t.name} className="h-full w-full object-cover" />
                      </div>
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
