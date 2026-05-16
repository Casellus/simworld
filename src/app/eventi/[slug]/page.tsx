import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, Car, Settings2, Pencil } from "lucide-react";
import { JoinButton } from "./join-button";
import { EventDeleteButton } from "./delete-button";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, games(name, slug), profiles:host_user_id(username, display_name)")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const { data: participants } = await supabase
    .from("event_participants")
    .select("id, status, profiles(username, display_name, avatar_url)")
    .eq("event_id", event.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isJoined = false;
  if (user) {
    const { data } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isJoined = !!data;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link href="/eventi" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4 inline-block">
        ← Tutti gli eventi
      </Link>

      {event.banner_url && (
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 border border-[var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant="primary">{event.event_type}</Badge>
              {event.games?.name && <Badge>{event.games.name}</Badge>}
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{event.title}</h1>
                <p className="text-sm text-[var(--color-fg-muted)] mt-2">
                  Organizzato da{" "}
                  <span className="text-[var(--color-fg)] font-medium">{event.profiles?.display_name || event.profiles?.username || "—"}</span>
                </p>
              </div>
              {user && user.id === event.host_user_id && (
                <div className="flex gap-2 shrink-0">
                  <Link href={`/eventi/${event.slug}/modifica`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-4 w-4" /> Modifica
                    </Button>
                  </Link>
                  <EventDeleteButton eventId={event.id} />
                </div>
              )}
            </div>
          </div>

          {event.description && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold">Descrizione</h2>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm">{event.description}</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold">
                Partecipanti ({participants?.length || 0}
                {event.max_participants ? `/${event.max_participants}` : ""})
              </h2>
            </CardHeader>
            <CardBody>
              {participants && participants.length > 0 ? (
                <ul className="space-y-2">
                  {participants.map((p) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const profile = p.profiles as any;
                    const name = profile?.display_name || profile?.username || "?";
                    const avatar = profile?.avatar_url as string | null;
                    return (
                      <li key={p.id} className="flex items-center gap-3 text-sm">
                        <div className="h-7 w-7 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatar} alt={name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-[var(--color-fg-muted)] uppercase">
                              {name[0]}
                            </span>
                          )}
                        </div>
                        <span>{name}</span>
                        <Badge>{p.status}</Badge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-fg-muted)]">Nessun iscritto. Sii il primo!</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody className="space-y-3">
              <InfoRow icon={Calendar} label="Inizio" value={formatDate(event.start_at)} />
              {event.track && <InfoRow icon={MapPin} label="Tracciato" value={event.track} />}
              {event.car_class && <InfoRow icon={Car} label="Categoria" value={event.car_class} />}
              {event.format && <InfoRow icon={Settings2} label="Formato" value={event.format} />}
              {event.max_participants && (
                <InfoRow icon={Users} label="Max partecipanti" value={String(event.max_participants)} />
              )}
              <div className="pt-3 border-t border-[var(--color-border)]">
                <JoinButton eventId={event.id} isJoined={isJoined} isLogged={!!user} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-[var(--color-primary)] mt-0.5" />
      <div>
        <div className="text-xs font-semibold text-[var(--color-fg-muted)]">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
