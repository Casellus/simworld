import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { User as UserIcon, MapPin, Cpu, Calendar, Settings2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";

export default async function ProfiloPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: setups }, { data: events }, { data: userGames }] = await Promise.all([
    supabase
      .from("setups")
      .select("id, title, car, track, games(name)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("event_participants")
      .select("events(id, slug, title, start_at, event_type)")
      .eq("user_id", profile.id)
      .limit(6),
    supabase
      .from("user_games")
      .select("skill_level, games(name, slug)")
      .eq("user_id", profile.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-start gap-6 mb-8">
        <div className="h-24 w-24 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-10 w-10 text-[var(--color-primary)]" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)]">@{profile.username}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-fg-muted)] flex-wrap">
            {profile.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile.country}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Membro dal {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {profile.bio && (
        <Card className="mb-6">
          <CardBody>
            <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {profile.hardware && (
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Hardware
              </h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm whitespace-pre-wrap">{profile.hardware}</p>
            </CardBody>
          </Card>
        )}

        {userGames && userGames.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold uppercase tracking-wider">Giochi</h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {userGames.map((ug, i) => {
                  const game = one<{ name: string }>(ug.games);
                  return (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{game?.name}</span>
                      {ug.skill_level && <Badge variant="primary">{ug.skill_level}</Badge>}
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        )}

        {setups && setups.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> Assetti pubblicati
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="grid gap-2 sm:grid-cols-2">
                {setups.map((s) => {
                  const game = one<{ name: string }>(s.games);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/assetti/${s.id}`}
                        className="block p-3 rounded border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm"
                      >
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-[var(--color-fg-muted)]">
                          {s.car} · {s.track} · {game?.name}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        )}

        {events && events.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <h2 className="text-sm font-bold uppercase tracking-wider">Eventi</h2>
            </CardHeader>
            <CardBody>
              <ul className="grid gap-2 sm:grid-cols-2">
                {events.map((ep, i) => {
                  const ev = one<{ slug: string; title: string; event_type: string; start_at: string }>(ep.events);
                  if (!ev) return null;
                  return (
                    <li key={i}>
                      <Link
                        href={`/eventi/${ev.slug}`}
                        className="block p-3 rounded border border-[var(--color-border)] hover:border-[var(--color-primary)] text-sm"
                      >
                        <div className="font-medium">{ev.title}</div>
                        <div className="text-xs text-[var(--color-fg-muted)]">
                          {ev.event_type} · {formatDate(ev.start_at)}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
