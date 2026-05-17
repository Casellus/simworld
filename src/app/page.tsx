import Link from "next/link";
import Image from "next/image";
import { HeroVideo } from "@/components/hero-video";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { GAMES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";
import { Calendar, Users, Settings2, Search, ArrowRight, Plus, LayoutDashboard, Trophy, ChevronRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      .select("id, slug, title, start_at, event_type, track, banner_url, games(name, slug)")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .limit(6),
    supabase
      .from("setups")
      .select("id, title, car, track, downloads, rating_sum, photo_url, games(name, slug)")
      .order("downloads", { ascending: false })
      .limit(6),
    supabase
      .from("recruitment_posts")
      .select("id, title, post_type, created_at, games(name, slug)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("setups").select("*", { count: "exact", head: true }),
  ]);

  let myTeam: { name: string; slug: string } | null = null;
  let profile: { display_name: string | null; username: string } | null = null;

  if (user) {
    const [{ data: tm }, { data: pr }] = await Promise.all([
      supabase.from("team_members").select("teams(name, slug)").eq("user_id", user.id).limit(1).maybeSingle(),
      supabase.from("profiles").select("display_name, username").eq("id", user.id).maybeSingle(),
    ]);
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
  const featuredEvent = upcomingEvents?.[0];

  return (
    <>
      {/* ── CINEMATIC HERO ── */}
      <section className="hero-fullscreen">
        <HeroVideo />
        <div className="hero-video-overlay" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full">
            <div className="flex flex-col items-center text-center">
              {user ? (
                <>
                  <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    Ciao,<br />
                    <span className="text-accent-glow">{displayName}.</span>
                  </h1>
                  <p className="hero-sub mt-6 text-lg md:text-xl text-[var(--color-fg-muted)] max-w-xl">
                    Carica un assetto, organizza una gara o trova nuovi compagni di squadra.
                  </p>
                  <div className="hero-cta mt-10 flex flex-wrap justify-center gap-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="px-8 py-4 text-base">
                        <LayoutDashboard className="h-5 w-5" /> Dashboard
                      </Button>
                    </Link>
                    <Link href="/eventi">
                      <Button size="lg" variant="outline" className="px-8 py-4 text-base !bg-white/10 !border-white/30 backdrop-blur-sm hover:!bg-white/20">
                        Esplora eventi <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    Benvenuto in<br />
                    <span className="text-accent-glow">SimUniverse!</span>
                  </h1>
                  <p className="hero-sub mt-6 text-lg md:text-xl text-[var(--color-fg-muted)] max-w-xl">
                    La community italiana del sim racing: organizza tornei, crea il tuo team, condividi assetti e guide, trova compagni con cui correre e scendi in pista.
                  </p>
                  <div className="hero-cta mt-10 flex flex-wrap justify-center gap-4">
                    <Link href="/auth/register">
                      <Button size="lg" className="px-8 py-4 text-base">
                        Inizia ora <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/eventi">
                      <Button size="lg" variant="outline" className="px-8 py-4 text-base !bg-white/10 !border-white/30 backdrop-blur-sm hover:!bg-white/20">
                        Eventi attivi
                      </Button>
                    </Link>
                  </div>
                  <div className="hero-badges mt-12 flex flex-wrap justify-center gap-2">
                    {GAMES.map((g) => (
                      <span key={g.slug} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--color-border-strong)] bg-black/30 text-[var(--color-fg-muted)] backdrop-blur-sm">
                        {g.short}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
        </div>

        {/* stats overlay bottom — hide if featured event shown on right */}
        <div className="hidden lg:block absolute bottom-12 right-8 z-10">
          {!featuredEvent && (
            <div className="flex gap-6 text-right">
              <StatPill value={totalEvents ?? 0} label="Eventi" />
              <StatPill value={totalTeams ?? 0} label="Team" />
              <StatPill value={totalSetups ?? 0} label="Assetti" />
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED CAROUSEL: EVENTI ── */}
      <Section
        eyebrow="In programma"
        title="Eventi in evidenza"
        link={{ href: "/eventi", label: "Tutti gli eventi" }}
      >
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="carousel">
            {upcomingEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState msg="Nessun evento in programma." cta="Crea evento" href="/eventi/nuovo" />
        )}
      </Section>

      {/* ── LOGGED IN QUICK ACTIONS ── */}
      {user && (
        <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <h2 className="text-xs font-semibold tracking-widest text-[var(--color-fg-muted)] uppercase mb-5">Azioni rapide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickAction href="/eventi/nuovo" icon={Plus} label="Nuovo evento" />
              <QuickAction href="/assetti/carica" icon={Settings2} label="Carica assetto" />
              <QuickAction href={myTeam ? `/team/${myTeam.slug}` : "/team/nuovo"} icon={Users} label={myTeam ? "Il tuo team" : "Crea team"} />
              <QuickAction href="/cerca/nuovo" icon={Search} label="Pubblica annuncio" />
            </div>
          </div>
        </section>
      )}

      {/* ── ASSETTI TOP ── */}
      <Section
        eyebrow="Più scaricati"
        title="Assetti top"
        link={{ href: "/assetti", label: "Tutti gli assetti" }}
      >
        {topSetups && topSetups.length > 0 ? (
          <div className="carousel">
            {topSetups.map((s) => (
              <SetupCard key={s.id} setup={s} />
            ))}
          </div>
        ) : (
          <EmptyState msg="Nessun assetto caricato." cta="Carica assetto" href="/assetti/carica" />
        )}
      </Section>

      {/* ── CERCA ── */}
      <Section
        eyebrow="Bacheca"
        title="Cerca pilota o team"
        link={{ href: "/cerca", label: "Tutti gli annunci" }}
      >
        {recentPosts && recentPosts.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState msg="Nessun annuncio attivo." cta="Pubblica annuncio" href="/cerca/nuovo" />
        )}
      </Section>

      {/* ── ABOUT (anon only) ── */}
      {!user && (
        <section className="border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-3">La community</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                Fatto da piloti,<br />
                <span className="text-accent-glow">per piloti.</span>
              </h2>
              <p className="mt-5 text-lg text-[var(--color-fg-muted)]">
                Una piattaforma dedicata al sim racing italiano. Niente forum dispersivi — solo strumenti che servono per correre.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FeatureBlock icon={Trophy} title="Organizza eventi" desc="Tornei, campionati, endurance. Tutto in pochi clic." />
              <FeatureBlock icon={Users} title="Costruisci team" desc="Logo, descrizione, recluta piloti tramite bacheca." />
              <FeatureBlock icon={Settings2} title="Condividi assetti" desc="Setup per ogni auto e tracciato. Vota, scarica, contribuisci." />
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/auth/register"><Button size="lg">Crea account <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/eventi"><Button size="lg" variant="outline">Esplora senza account</Button></Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ── COMPONENTS ── */

function Section({ eyebrow, title, link, children }: { eyebrow: string; title: string; link: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">{eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
          </div>
          <Link href={link.href} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] whitespace-nowrap">
            {link.label} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

type EventShape = {
  id: string;
  slug: string;
  title: string;
  start_at: string;
  event_type: string;
  track: string | null;
  banner_url?: string | null;
  games: { name: string; slug: string } | { name: string; slug: string }[];
};

function EventCard({ event }: { event: EventShape }) {
  const game = one<{ name: string; slug: string }>(event.games);
  return (
    <Link href={`/eventi/${event.slug}`} className="media-card block group">
      <div className="media-image">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 80vw, 360px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Calendar className="h-10 w-10 text-[var(--color-border-strong)]" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <Badge variant="primary" className="!bg-black/60 backdrop-blur-sm !border-white/20 !text-white">{event.event_type}</Badge>
          {game?.name && <Badge className="!bg-black/60 backdrop-blur-sm !border-white/20 !text-white/80">{game.name}</Badge>}
        </div>
      </div>
      <div className="media-body">
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-[var(--color-primary)] transition-colors">{event.title}</h3>
        <div className="flex items-center gap-3 text-xs text-[var(--color-fg-muted)]">
          <span>{formatDate(event.start_at)}</span>
          {event.track && <span>· {event.track}</span>}
        </div>
      </div>
    </Link>
  );
}

type SetupShape = {
  id: string;
  title: string;
  car: string;
  track: string;
  downloads: number;
  rating_sum: number;
  photo_url: string | null;
  games: { name: string; slug: string } | { name: string; slug: string }[];
};

function SetupCard({ setup }: { setup: SetupShape }) {
  const game = one<{ name: string; slug: string }>(setup.games);
  return (
    <Link href={`/assetti/${setup.id}`} className="media-card block group">
      <div className="media-image">
        {setup.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={setup.photo_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Settings2 className="h-10 w-10 text-[var(--color-border-strong)]" />
          </div>
        )}
        <div className="absolute top-3 left-3 z-10">
          {game?.name && <Badge variant="primary">{game.name}</Badge>}
        </div>
      </div>
      <div className="media-body">
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-[var(--color-primary)] transition-colors">{setup.title}</h3>
        <p className="text-xs text-[var(--color-fg-muted)] mb-3">{setup.car} · {setup.track}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--color-fg-muted)]">
          <span>{setup.downloads} download</span>
          <span>· {setup.rating_sum > 0 ? `+${setup.rating_sum}` : setup.rating_sum} voti</span>
        </div>
      </div>
    </Link>
  );
}

type PostShape = {
  id: string;
  title: string;
  post_type: string;
  created_at: string;
  games: { name: string; slug: string } | { name: string; slug: string }[];
};

function PostCard({ post }: { post: PostShape }) {
  const game = one<{ name: string; slug: string }>(post.games);
  return (
    <Link href="/cerca" className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 hover:border-[var(--color-primary)] transition-colors group">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={post.post_type === "cerca_pilota" ? "accent" : "primary"}>
          {post.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
        </Badge>
        {game?.name && <Badge>{game.name}</Badge>}
      </div>
      <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{post.title}</h3>
      <p className="text-xs text-[var(--color-fg-muted)]">{formatDate(post.created_at)}</p>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-elev-2)] transition-all">
      <div className="h-9 w-9 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function FeatureBlock({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)]">
      <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
      </div>
      <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
      <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
    </div>
  );
}


function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>{value}</div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-fg-muted)]">{label}</div>
    </div>
  );
}

function EmptyState({ msg, cta, href }: { msg: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] py-12 px-6 text-center">
      <p className="text-sm text-[var(--color-fg-muted)] mb-4">{msg}</p>
      <Link href={href}><Button size="sm" variant="outline">{cta}</Button></Link>
    </div>
  );
}
