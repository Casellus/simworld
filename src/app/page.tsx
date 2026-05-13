import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { GAMES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";
import { Calendar, Users, Settings2, Search, Trophy, Zap, ArrowRight, Flag, Plus, LayoutDashboard } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: upcomingEvents },
    { data: topSetups },
    { data: recentPosts },
    { count: totalEvents },
    { count: totalTeams },
    { count: totalSetups },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id, slug, title, start_at, event_type, track, games(name, slug)")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .limit(3),
    supabase
      .from("setups")
      .select("id, title, car, track, downloads, rating_count, rating_sum, games(name, slug)")
      .order("downloads", { ascending: false })
      .limit(3),
    supabase
      .from("recruitment_posts")
      .select("id, title, post_type, created_at, games(name, slug)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("setups").select("*", { count: "exact", head: true }),
  ]);

  let myEvents: Array<{ events: unknown }> | null = null;
  let myTeam: { name: string; slug: string } | null = null;
  let profile: { display_name: string | null; username: string } | null = null;

  if (user) {
    const [{ data: ep }, { data: tm }, { data: pr }] = await Promise.all([
      supabase
        .from("event_participants")
        .select("events(id, slug, title, start_at, event_type)")
        .eq("user_id", user.id)
        .gte("events.start_at", new Date().toISOString())
        .limit(3),
      supabase
        .from("team_members")
        .select("teams(name, slug)")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    myEvents = ep;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tmRow = (tm as any)?.data ?? tm;
    if (tmRow?.teams) {
      myTeam = one<{ name: string; slug: string }>(tmRow.teams as { name: string; slug: string }[] | { name: string; slug: string });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prRow = (pr as any)?.data ?? pr;
    profile = prRow ?? null;
  }

  const displayName = profile?.display_name || profile?.username || "Pilota";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="absolute inset-0 checker-bg opacity-[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
          {user ? (
            /* ── LOGGED IN HERO ── */
            <div className="max-w-4xl">
              <Badge variant="success" className="mb-4 hero-title">
                <Zap className="h-3 w-3" /> Bentornato nella pit lane
              </Badge>
              <h1 className="hero-title text-4xl md:text-6xl font-black leading-[1.05] tracking-tight uppercase">
                Ciao, <span className="text-[var(--color-primary)]">{displayName}.</span>
                <br />
                Pronto a correre?
              </h1>
              <p className="hero-sub mt-6 text-lg text-[var(--color-fg-muted)] max-w-2xl">
                Controlla gli ultimi eventi, carica un assetto o trova nuovi compagni di squadra.
              </p>
              <div className="hero-cta mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <Button size="lg">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/eventi/nuovo">
                  <Button size="lg" variant="outline">
                    <Plus className="h-4 w-4" /> Crea evento
                  </Button>
                </Link>
                <Link href="/assetti/carica">
                  <Button size="lg" variant="outline">
                    <Settings2 className="h-4 w-4" /> Carica assetto
                  </Button>
                </Link>
              </div>

              {/* STATS ROW */}
              <div className="hero-badges mt-10 grid grid-cols-3 gap-4 max-w-sm">
                <StatChip label="Eventi" value={totalEvents ?? 0} />
                <StatChip label="Team" value={totalTeams ?? 0} />
                <StatChip label="Assetti" value={totalSetups ?? 0} />
              </div>
            </div>
          ) : (
            /* ── ANON HERO ── */
            <div className="max-w-3xl">
              <Badge variant="primary" className="mb-4 hero-title">
                <Zap className="h-3 w-3" /> Hub italiano del sim racing
              </Badge>
              <h1 className="hero-title text-4xl md:text-6xl font-black leading-[1.05] tracking-tight uppercase">
                Tutte le piste,
                <br />
                <span className="text-[var(--color-primary)]">una community.</span>
              </h1>
              <p className="hero-sub mt-6 text-lg text-[var(--color-fg-muted)] max-w-2xl">
                Tornei, team, assetti e guide per ACC, iRacing, Le Mans Ultimate, Assetto Corsa, AC EVO e F1 25.
                Crea il tuo team, partecipa agli eventi, condividi assetti.
              </p>
              <div className="hero-cta mt-8 flex flex-wrap gap-3">
                <Link href="/auth/register">
                  <Button size="lg">
                    Inizia ora <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/eventi">
                  <Button size="lg" variant="outline">
                    Esplora eventi
                  </Button>
                </Link>
              </div>

              <div className="hero-badges mt-10 flex flex-wrap gap-2">
                {GAMES.map((g) => (
                  <Badge key={g.slug}>{g.short}</Badge>
                ))}
              </div>

              {/* community stats */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-[var(--color-fg-muted)]">
                <span><strong className="text-[var(--color-fg)]">{totalEvents ?? 0}</strong> eventi</span>
                <span><strong className="text-[var(--color-fg)]">{totalTeams ?? 0}</strong> team</span>
                <span><strong className="text-[var(--color-fg)]">{totalSetups ?? 0}</strong> assetti</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* LOGGED IN: my events + quick links */}
      {user && (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-bg-elev)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                <Trophy className="h-4 w-4 text-[var(--color-primary)]" /> I tuoi prossimi eventi
              </h2>
              {myEvents && myEvents.length > 0 ? (
                <div className="space-y-3">
                  {myEvents.map((ep, i) => {
                    type EvShape = { id: string; slug: string; title: string; start_at: string; event_type: string };
                  const ev = one<EvShape>(ep.events as EvShape | EvShape[]);
                    if (!ev) return null;
                    return (
                      <Link key={i} href={`/eventi/${ev.slug}`}>
                        <Card className="hover:border-[var(--color-primary)] transition-colors">
                          <CardBody className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{ev.title}</div>
                              <div className="text-xs text-[var(--color-fg-muted)]">{formatDate(ev.start_at)} · {ev.event_type}</div>
                            </div>
                          </CardBody>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardBody>
                    <p className="text-sm text-[var(--color-fg-muted)] text-center py-2">Nessun evento in programma.</p>
                    <div className="text-center mt-2">
                      <Link href="/eventi"><Button size="sm" variant="outline">Esplora eventi</Button></Link>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                <Flag className="h-4 w-4 text-[var(--color-primary)]" /> Azioni rapide
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/team/nuovo", label: "Crea team", icon: Users },
                  { href: "/cerca/nuovo", label: "Cerca pilota/team", icon: Search },
                  { href: "/guide", label: "Guide", icon: Zap },
                  { href: myTeam ? `/team/${myTeam.slug}` : "/team", label: myTeam ? `Il tuo team` : "Trova team", icon: Flag },
                ].map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Card className="hover:border-[var(--color-primary)] transition-colors h-full">
                      <CardBody className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                        {label}
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES (anon only) */}
      {!user && (
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Calendar} title="Eventi & Tornei" desc="Organizza o partecipa a campionati, amichevoli, endurance." />
            <FeatureCard icon={Users} title="Team Hub" desc="Crea il tuo team, gestisci roster, recluta piloti." />
            <FeatureCard icon={Settings2} title="Assetti" desc="Condividi e scarica setup per auto e tracciato." />
            <FeatureCard icon={Search} title="Cerca compagni" desc="Bacheca cerca pilota / cerca team. Trova chi gioca con te." />
          </div>
        </section>
      )}

      {/* DASHBOARD ROWS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-10 lg:grid-cols-3">
        <SectionBlock title="Prossimi Eventi" href="/eventi" icon={Trophy}>
          {upcomingEvents && upcomingEvents.length > 0 ? (
            upcomingEvents.map((e) => (
              <Link key={e.id} href={`/eventi/${e.slug}`}>
                <Card className="hover:border-[var(--color-primary)] transition-colors">
                  <CardBody className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{e.event_type}</Badge>
                      {/* @ts-expect-error supabase join shape */}
                      {e.games?.name && <Badge>{e.games.name}</Badge>}
                    </div>
                    <h3 className="font-bold">{e.title}</h3>
                    <div className="text-xs text-[var(--color-fg-muted)] flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {formatDate(e.start_at)}
                    </div>
                    {e.track && <div className="text-xs text-[var(--color-fg-muted)]">{e.track}</div>}
                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            <EmptyMsg msg="Nessun evento programmato." />
          )}
        </SectionBlock>

        <SectionBlock title="Assetti Top" href="/assetti" icon={Settings2}>
          {topSetups && topSetups.length > 0 ? (
            topSetups.map((s) => (
              <Link key={s.id} href={`/assetti/${s.id}`}>
                <Card className="hover:border-[var(--color-primary)] transition-colors">
                  <CardBody className="space-y-2">
                    {/* @ts-expect-error join */}
                    <Badge>{s.games?.name}</Badge>
                    <h3 className="font-bold">{s.title}</h3>
                    <div className="text-xs text-[var(--color-fg-muted)]">
                      {s.car} · {s.track}
                    </div>
                    <div className="text-xs text-[var(--color-fg-muted)]">
                      {s.downloads} download · {s.rating_count} voti
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            <EmptyMsg msg="Nessun assetto caricato." />
          )}
        </SectionBlock>

        <SectionBlock title="Cerca Piloti/Team" href="/cerca" icon={Search}>
          {recentPosts && recentPosts.length > 0 ? (
            recentPosts.map((p) => (
              <Link key={p.id} href="/cerca">
                <Card className="hover:border-[var(--color-primary)] transition-colors">
                  <CardBody className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={p.post_type === "cerca_pilota" ? "accent" : "primary"}>
                        {p.post_type === "cerca_pilota" ? "Cerca pilota" : "Cerca team"}
                      </Badge>
                      {/* @ts-expect-error join */}
                      {p.games?.name && <Badge>{p.games.name}</Badge>}
                    </div>
                    <h3 className="font-bold">{p.title}</h3>
                    <div className="text-xs text-[var(--color-fg-muted)]">{formatDate(p.created_at)}</div>
                  </CardBody>
                </Card>
              </Link>
            ))
          ) : (
            <EmptyMsg msg="Nessun annuncio attivo." />
          )}
        </SectionBlock>
      </section>

      {/* CHI SIAMO */}
      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <Badge variant="primary" className="mb-3">
              <Flag className="h-3 w-3" /> Chi siamo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Fatto da piloti,<br />
              <span className="text-[var(--color-primary)]">per piloti.</span>
            </h2>
            <p className="mt-4 text-[var(--color-fg-muted)]">
              SimUniverse nasce dalla passione per il sim racing italiano. Niente forum dispersivi, niente gruppi
              Telegram disorganizzati — una piattaforma dedicata dove trovare tutto quello che ti serve per correre
              al meglio, in italiano, con la tua community.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AboutCard
              icon="🏁"
              title="Organizza eventi"
              desc="Crea tornei, campionati ed endurance in pochi clic. Gestisci iscrizioni, tracciati, categorie e formato di gara. Tutto in un posto."
            />
            <AboutCard
              icon="🤝"
              title="Costruisci il tuo team"
              desc="Crea il tuo team con logo e descrizione, apri le candidature e trova i piloti giusti con la bacheca recruiting integrata."
            />
            <AboutCard
              icon="⚙️"
              title="Condividi assetti"
              desc="Carica i tuoi setup per ogni auto e tracciato. La community vota e scarica. Smetti di cercare assetti su YouTube."
            />
            <AboutCard
              icon="🎮"
              title="6 simulatori supportati"
              desc="ACC, iRacing, Le Mans Ultimate, Assetto Corsa, AC EVO e F1 25. Tutti i giochi che ami, in un'unica piattaforma."
            />
            <AboutCard
              icon="🔍"
              title="Trova compagni di gara"
              desc="Sei un pilota senza team? Un team senza piloti? La bacheca cerca pilota / cerca team ti mette in contatto con chi fa al caso tuo."
            />
            <AboutCard
              icon="📖"
              title="Guide e consigli"
              desc="Articoli, guide tecniche e consigli dai piloti più esperti della community. Migliora il tuo stile di guida step by step."
            />
          </div>
        </div>
      </section>

      {/* CTA (anon only) */}
      {!user && (
        <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 text-center">
            <Flag className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Pronto al via?
            </h2>
            <p className="mt-3 text-[var(--color-fg-muted)] max-w-xl mx-auto">
              Registrati gratis. Trova team, eventi, assetti. Tutto in italiano.
            </p>
            <div className="mt-6">
              <Link href="/auth/register">
                <Button size="lg">Crea account</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-lg p-3 text-center">
      <div className="text-2xl font-black text-[var(--color-primary)]">{value}</div>
      <div className="text-xs text-[var(--color-fg-muted)] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Card>
      <CardBody>
        <Icon className="h-6 w-6 text-[var(--color-primary)] mb-3" />
        <h3 className="font-bold uppercase tracking-wide text-sm mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-fg-muted)]">{desc}</p>
      </CardBody>
    </Card>
  );
}

function AboutCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-bold uppercase tracking-wide text-sm mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-fg-muted)]">{desc}</p>
      </CardBody>
    </Card>
  );
}

function SectionBlock({
  title,
  href,
  icon: Icon,
  children,
}: {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-wider">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" /> {title}
        </h2>
        <Link href={href} className="text-xs uppercase tracking-wider text-[var(--color-fg-muted)] hover:text-[var(--color-primary)]">
          Vedi tutti →
        </Link>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EmptyMsg({ msg }: { msg: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-[var(--color-fg-muted)] text-center py-4">{msg}</p>
      </CardBody>
    </Card>
  );
}
