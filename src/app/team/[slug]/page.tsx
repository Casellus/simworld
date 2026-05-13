import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flag, User as UserIcon, Pencil } from "lucide-react";
import { one } from "@/lib/types";
import { TeamDeleteButton } from "./delete-button";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*, profiles:owner_id(username, display_name)")
    .eq("slug", slug)
    .single();

  if (!team) notFound();

  const [{ data: members }, { data: games }, { data: { user } }] = await Promise.all([
    supabase
      .from("team_members")
      .select("role, profiles(username, display_name, avatar_url)")
      .eq("team_id", team.id),
    supabase.from("team_games").select("games(slug, name)").eq("team_id", team.id),
    supabase.auth.getUser(),
  ]);

  const isOwner = !!user && user.id === team.owner_id;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link href="/team" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4 inline-block">
        ← Tutti i team
      </Link>

      <div className="flex flex-wrap items-start gap-6 mb-8">
        <div className="h-20 w-20 rounded-lg bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          {team.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <Flag className="h-10 w-10 text-[var(--color-primary)]" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {team.recruiting && <Badge variant="success">Reclutamento aperto</Badge>}
            {team.country && <Badge>{team.country}</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{team.name}</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Proprietario:{" "}
            <span className="text-[var(--color-fg)] font-medium">
              {team.profiles?.display_name || team.profiles?.username}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {team.recruiting && (
            <Link href={`/cerca/nuovo?team=${team.slug}`}>
              <Button variant="outline">Candidati</Button>
            </Link>
          )}
          {isOwner && (
            <>
              <Link href={`/team/${team.slug}/modifica`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4" /> Modifica
                </Button>
              </Link>
              <TeamDeleteButton teamId={team.id} />
            </>
          )}
        </div>
      </div>

      {games && games.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {games.map((g, idx) => {
            const game = one<{ name: string }>(g.games);
            return (
              <Badge variant="primary" key={idx}>
                {game?.name}
              </Badge>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {team.description && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold uppercase tracking-wider">Descrizione</h2>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm">{team.description}</p>
              </CardBody>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Roster ({members?.length || 0})
            </h2>
          </CardHeader>
          <CardBody>
            {members && members.length > 0 ? (
              <ul className="space-y-3">
                {members.map((m, idx) => {
                  const p = one<{ username: string; display_name: string | null }>(m.profiles);
                  return (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{p?.display_name || p?.username}</div>
                        <div className="text-xs text-[var(--color-fg-muted)] capitalize">{m.role}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-fg-muted)]">Nessun membro.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
