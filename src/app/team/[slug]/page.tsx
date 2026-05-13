import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flag, User as UserIcon, Pencil } from "lucide-react";
import { one } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { TeamDeleteButton } from "./delete-button";
import { ApplyButton } from "./apply-button";
import { ApplicationActions } from "./application-actions";

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

  // check if current user already applied
  let alreadyApplied = false;
  if (user && !isOwner) {
    const { data: existing } = await supabase
      .from("team_applications")
      .select("id")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .maybeSingle();
    alreadyApplied = !!existing;
  }

  // owner: fetch pending applications
  let applications: Array<{
    id: string;
    message: string | null;
    status: string;
    created_at: string;
    profiles: { username: string; display_name: string | null } | null;
  }> = [];
  if (isOwner) {
    const { data } = await supabase
      .from("team_applications")
      .select("id, message, status, created_at, profiles:user_id(username, display_name)")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false });
    applications = (data ?? []).map((a) => ({
      ...a,
      profiles: one<{ username: string; display_name: string | null }>(a.profiles),
    }));
  }

  const pending = applications.filter((a) => a.status === "pending");
  const others = applications.filter((a) => a.status !== "pending");

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
          {team.recruiting && !isOwner && user && (
            alreadyApplied ? (
              <div className="px-4 py-2 rounded border border-[var(--color-success)] text-[var(--color-success)] text-sm font-medium">
                Candidatura inviata
              </div>
            ) : (
              <ApplyButton teamId={team.id} />
            )
          )}
          {team.recruiting && !user && (
            <Link href="/auth/login">
              <Button variant="outline">Accedi per candidarti</Button>
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
            return <Badge variant="primary" key={idx}>{game?.name}</Badge>;
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

          {/* CANDIDATURE (solo owner) */}
          {isOwner && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  Candidature ricevute
                  {pending.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold">
                      {pending.length}
                    </span>
                  )}
                </h2>
              </CardHeader>
              <CardBody>
                {applications.length === 0 ? (
                  <p className="text-sm text-[var(--color-fg-muted)]">Nessuna candidatura ricevuta.</p>
                ) : (
                  <div className="space-y-4">
                    {[...pending, ...others].map((a) => (
                      <div key={a.id} className="border border-[var(--color-border)] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <Link
                              href={`/profilo/${a.profiles?.username}`}
                              className="font-medium text-sm hover:text-[var(--color-primary)]"
                            >
                              {a.profiles?.display_name || a.profiles?.username}
                            </Link>
                            <span className="text-xs text-[var(--color-fg-muted)] ml-2">{formatDate(a.created_at)}</span>
                          </div>
                          <Badge
                            variant={a.status === "accepted" ? "success" : a.status === "rejected" ? "default" : "primary"}
                          >
                            {a.status === "pending" ? "In attesa" : a.status === "accepted" ? "Accettato" : "Rifiutato"}
                          </Badge>
                        </div>
                        {a.message && (
                          <p className="text-sm text-[var(--color-fg-muted)] whitespace-pre-wrap">{a.message}</p>
                        )}
                        {a.status === "pending" && (
                          <ApplicationActions applicationId={a.id} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
