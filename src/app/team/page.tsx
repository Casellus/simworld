import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Flag } from "lucide-react";

export const revalidate = 30;
export const metadata = { title: "Team · SimUniverse" };

type SP = Promise<{ q?: string; recruiting?: string }>;

export default async function TeamPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("teams")
    .select("id, slug, name, description, recruiting, country, team_members(count)")
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
              <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center">
                      <Flag className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{t.name}</h3>
                      <div className="text-xs text-[var(--color-fg-muted)] flex items-center gap-1">
                        <Users className="h-3 w-3" /> {t.team_members?.[0]?.count ?? 0} piloti
                      </div>
                    </div>
                    {t.recruiting && <Badge variant="success">Recluta</Badge>}
                  </div>
                  {t.description && (
                    <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2">{t.description}</p>
                  )}
                </CardBody>
              </Card>
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
