import Link from "next/link";
import Image from "next/image";
import { HeroVideo } from "@/components/hero-video";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Calendar, Settings2, ArrowRight, LayoutDashboard, ChevronRight } from "lucide-react";

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

  let profile: { display_name: string | null; username: string } | null = null;

  if (user) {
    const { data: pr } = await supabase.from("profiles").select("display_name, username").eq("id", user.id).maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prRow = (pr as any)?.data ?? pr;
    profile = prRow ?? null;
  }

  const displayName = profile?.display_name || profile?.username || "Pilota";
  const featuredEvent = upcomingEvents?.[0];

  return (
    <>
      {/* ── CINEMATIC HERO ── */}
      <section className="hero-fullscreen" style={{ marginTop: "calc(-56px - 1.5rem)" }}>
        <HeroVideo />
        <div className="hero-video-overlay" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full" style={{ paddingTop: "calc(56px + 1.5rem)" }}>
            <div className="flex flex-col items-center text-center">
              {user ? (
                <>
                  <h1 className="hero-title text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
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
                  <h1 className="hero-title text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.95] tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
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

      {user ? (
        <>
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
        </>
      ) : (
        <>
          {/* ── CHI SIAMO ── */}
          <section className="border-t border-[var(--color-border)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Chi siamo</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                  L&apos;hub italiano del<br />
                  <span className="text-accent-glow">sim racing.</span>
                </h2>
                <p className="text-base sm:text-lg text-[var(--color-fg-muted)] leading-relaxed">
                  SimUniverse nasce per riunire la community italiana del sim racing in un unico spazio.
                  Niente forum dispersivi, niente gruppi WhatsApp scollegati — solo strumenti pensati
                  per chi vive di curve, settaggi e gomme che si scaldano.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <FeatureBlock emoji="🏆" title="Organizza eventi" desc="Tornei, campionati, gare endurance. Crea, gestisci iscrizioni e raduna piloti in pochi clic." />
                <FeatureBlock emoji="🏎️" title="Costruisci il tuo team" desc="Logo, lineup, descrizione. Recluta nuovi piloti tramite la bacheca pubblica." />
                <FeatureBlock emoji="⚙️" title="Condividi assetti" desc="Setup per ogni auto e tracciato. Vota, scarica, contribuisci alla libreria della community." />
                <FeatureBlock emoji="🎮" title="Tutti i sim principali" desc="ACC, iRacing, LMU, Assetto Corsa, AC EVO, F1 25. Un solo profilo, tutti i tuoi sim." />
                <FeatureBlock emoji="🤝" title="Trova compagni" desc="Cerca piloti del tuo livello o team aperti al reclutamento. Niente più gare in solitaria." />
                <FeatureBlock emoji="🇮🇹" title="100% italiano" desc="Una community costruita da piloti italiani, per piloti italiani. Lingua, fuso orario, mentalità." />
              </div>
            </div>
          </section>

          {/* ── COME FUNZIONA ── */}
          <section className="border-t border-[var(--color-border)]" style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.04))" }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Come funziona</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Tre passi.<br />
                  <span className="text-accent-glow">Sei in pista.</span>
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <StepBlock num="01" title="Crea il profilo" desc="Registrati gratis, scegli i sim che usi e indica il tuo livello." />
                <StepBlock num="02" title="Esplora la community" desc="Trova eventi, team aperti al reclutamento e assetti pronti all'uso." />
                <StepBlock num="03" title="Scendi in pista" desc="Iscriviti agli eventi, entra in un team, condividi i tuoi setup. Corri." />
              </div>
            </div>
          </section>

          {/* ── PER CHI ── */}
          <section className="border-t border-[var(--color-border)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Per chi è</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                    Dal rookie<br />
                    <span className="text-accent-glow">al veterano.</span>
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--color-fg-muted)] leading-relaxed">
                    Non serve essere un alien. SimUniverse è aperto a chiunque ami il sim racing:
                    da chi ha appena acceso il volante per la prima volta a chi macina ore di endurance ogni weekend.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AudienceBlock emoji="🌱" title="Rookie" desc="Trova team paziente, primi tornei, guide per iniziare." />
                  <AudienceBlock emoji="⚡" title="Amatori" desc="Gare settimanali, assetti condivisi, community attiva." />
                  <AudienceBlock emoji="🏆" title="Competitivi" desc="Campionati seri, lineup di team, sfide ad alto livello." />
                  <AudienceBlock emoji="🔥" title="Pro" desc="Esports, endurance, eventi premium e visibilità." />
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA FINALE ── */}
          <section className="border-t border-[var(--color-border)] relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at center, rgba(46,125,255,0.15), transparent 70%)" }} />
            <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-5">È il momento</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Sei pronto a<br />
                <span className="text-accent-glow">scendere in pista?</span>
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-fg-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
                Unisciti gratis a SimUniverse. Crea il tuo profilo, trova compagni di gara
                e inizia a correre con la community italiana del sim racing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8 py-4 text-base w-full sm:w-auto">
                    Registrati gratis <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-base w-full sm:w-auto">
                    Accedi
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
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
  return (
    <Link href={`/assetti/${setup.id}`} className="media-card block group">
      <div className="media-image">
        {setup.photo_url ? (
          <Image src={setup.photo_url} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Settings2 className="h-10 w-10 text-[var(--color-border-strong)]" />
          </div>
        )}
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
  return (
    <Link href="/cerca" className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 hover:border-[var(--color-primary)] transition-colors group">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={post.post_type === "cerca_pilota" ? "accent" : "primary"}>
          {post.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
        </Badge>
      </div>
      <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{post.title}</h3>
      <p className="text-xs text-[var(--color-fg-muted)]">{formatDate(post.created_at)}</p>
    </Link>
  );
}


function FeatureBlock({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="group relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/60 transition-all duration-200 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(46,125,255,0.07), transparent 70%)" }} />
      <div className="text-4xl mb-4 leading-none">{emoji}</div>
      <h3 className="font-bold text-lg mb-2 text-white" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
      <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-[var(--color-primary)] transition-all duration-300" />
    </div>
  );
}

function StepBlock({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="relative p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden">
      <div className="absolute top-0 right-0 text-[120px] font-extrabold leading-none select-none pointer-events-none"
        style={{ color: "rgba(46,125,255,0.06)", fontFamily: "var(--font-heading)", lineHeight: 1, transform: "translate(10px,-10px)" }}>
        {num}
      </div>
      <div className="relative">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 mb-4">
          <span className="text-sm font-extrabold text-[var(--color-primary)]">{num}</span>
        </div>
        <h3 className="font-bold text-xl mb-2 text-white" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function AudienceBlock({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="group relative p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-accent)]/50 transition-all duration-200 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(0,220,170,0.06), transparent 70%)" }} />
      <div className="text-3xl mb-3 leading-none">{emoji}</div>
      <h3 className="font-bold text-base text-white mb-1" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
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
