import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HeroVideo } from "@/components/hero-video";
import { RankingTop3 } from "@/components/ranking-top3";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Calendar, Settings2, ArrowRight, LayoutDashboard, ChevronRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const userId = await getUserId();

  const [
    { data: upcomingEvents },
    { data: topSetups },
    { data: recentPosts },
    { data: profileRaw },
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
    userId
      ? supabase.from("profiles").select("display_name, username").eq("id", userId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile: { display_name: string | null; username: string } | null = ((profileRaw as any)?.data ?? profileRaw) ?? null;

  const displayName = profile?.display_name || profile?.username || "Pilota";

  return (
    <>
      {/* ── CINEMATIC HERO ── */}
      <section className="hero-fullscreen" style={{ marginTop: "calc(-56px - 1.5rem)" }}>
        <HeroVideo />
        <div className="hero-video-overlay" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 w-full" style={{ paddingTop: "calc(56px + 1.5rem)" }}>
            <div className="flex flex-col items-center text-center">
              {userId ? (
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
              <SponsorMarqueeInline />
            </div>
        </div>

      </section>

      {/* ── TOP 3 PILOTI DEL MESE ── */}
      <RankingTop3 />

      {userId ? (
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
          <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Chi siamo</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                  L&apos;Hub Italiano del<br />
                  <span className="text-accent-glow">Sim Racing.</span>
                </h2>
                <p className="text-base sm:text-lg text-[var(--color-fg-muted)] leading-relaxed">
                  SimUniverse è l&apos;hub definitivo per la community italiana del sim racing: una piattaforma unica,
                  progettata per chi ha la passione della pista. Qui ogni millesimo conta, la telemetria si fa conversazione
                  e la competizione diventa condivisione. Allacciati le cinture, scendi in pista con noi e vivi il sim racing
                  senza compromessi.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FeatureBlock img="/home/eventi.jpg"   icon="flag"     kicker="Eventi"      title="Organizza eventi" desc="Tornei, campionati, gare endurance. Crea, gestisci iscrizioni e raduna piloti in pochi clic." />
                <FeatureBlock img="/home/team.jpg"     icon="group"    kicker="Team"        title="Costruisci il tuo team" desc="Logo, lineup, descrizione. Recluta nuovi piloti tramite la bacheca pubblica." />
                <FeatureBlock img="/home/assetti.jpg"  icon="wheel"    kicker="Assetti"     title="Condividi assetti" desc="Setup per ogni auto e tracciato. Vota, scarica, contribuisci alla libreria della community." />
                <FeatureBlock img="/home/sim.jpg"      icon="monitor"  kicker="Simulatori"  title="Tutti i sim principali" desc="ACC, iRacing, LMU, Assetto Corsa, AC EVO, F1 25. Un solo profilo, tutti i tuoi sim." />
                <FeatureBlock img="/home/compagni.jpg" icon="handshake" kicker="Community"  title="Trova compagni" desc="Cerca piloti del tuo livello o team aperti al reclutamento. Niente più gare in solitaria." />
                <FeatureBlock img="/home/guide.jpg"    icon="book"     kicker="Guide"       title="Guide & Tutorial" desc="Tecniche di guida, setup spiegati passo per passo, configurazione hardware. Impara dai piloti più esperti." />
              </div>
            </div>
          </section>

          {/* ── COME FUNZIONA ── */}
          <section style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.04))" }}>
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
          <section>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-4">Per chi è</p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                    Dal principiante<br />
                    <span className="text-accent-glow">al professionista.</span>
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--color-fg-muted)] leading-relaxed">
                    Non serve essere un professionista. SimUniverse è aperto a chiunque ami il sim racing:
                    da chi ha appena acceso il volante per la prima volta a chi è già esperto nel settore.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AudienceBlock img="/home/principianti.jpg" title="Principianti" desc="Trova team, primi tornei, guide per iniziare." />
                  <AudienceBlock img="/home/amatori.jpg" title="Amatori" desc="Gare settimanali, assetti condivisi, community attiva." />
                  <AudienceBlock img="/home/competitivi.jpg" title="Competitivi" desc="Campionati seri, lineup di team, sfide ad alto livello." />
                  <AudienceBlock img="/home/pro.jpg" title="Professionista" desc="Esports, endurance, eventi premium e visibilità." />
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA FINALE ── */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at center, rgba(46,125,255,0.15), transparent 70%)" }} />
            <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 sm:py-32 text-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-5">È il momento</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1] mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Sei pronto a<br />
                <span className="text-accent-glow">scendere in pista?</span>
              </h2>
              <p className="text-base sm:text-lg text-[var(--color-fg-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
                Unisciti a SimUniverse. Crea il tuo profilo, trova compagni di gara
                e inizia a correre con la community italiana del sim racing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8 py-4 text-base w-full sm:w-auto">
                    Registrati <ArrowRight className="h-5 w-5" />
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

// Sponsor/partner: aggiungi qui. `src` = file in public/sponsors/, `width`/`height` = ratio del logo.
const SPONSORS: { name: string; src: string; width: number; height: number; href?: string }[] = [
  { name: "IGP", src: "/sponsors/igp.png", width: 1176, height: 429, href: "https://www.igpclan.it" },
];

function SponsorMarqueeInline() {
  if (SPONSORS.length === 0) return null;
  const min = SPONSORS.length < 4 ? Array.from({ length: Math.ceil(4 / SPONSORS.length) }, () => SPONSORS).flat() : SPONSORS;
  const items = [...min, ...min];
  return (
    <div className="mt-12 w-full max-w-xl mx-auto">
      <p className="text-center text-xs font-semibold tracking-widest uppercase text-white/60 mb-4">
        I nostri partner
      </p>
      <div className="sponsor-marquee">
        <div className="sponsor-track">
          {items.map((s, i) => {
            const content = (
              <Image
                src={s.src}
                alt={s.name}
                width={s.width}
                height={s.height}
                className="h-12 w-auto object-contain"
                style={{ height: "3rem", width: "auto" }}
              />
            );
            return (
              <div key={i} className="sponsor-item" aria-hidden={i >= min.length}>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, title, link, children }: { eyebrow: string; title: string; link: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section>
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



const FEATURE_ICONS: Record<string, string> = {
  flag: "M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9M5 21v-7",
  group: "M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0 -8M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2",
  wheel: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M12 14v7M10 12l-6.75 -2M14 12l6.75 -2",
  monitor: "M3 4a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1zM7 20h10M9 16v4M15 16v4",
  handshake: "M12 5.5l-1.5 -1.5a3.5 3.5 0 0 0 -5 5l6.5 6.5l6.5 -6.5a3.5 3.5 0 0 0 -5 -5z",
  book: "M12 7v14M3 18a1 1 0 0 1 -1 -1V4a1 1 0 0 1 1 -1h5a4 4 0 0 1 4 4a4 4 0 0 1 4 -4h5a1 1 0 0 1 1 1v13a1 1 0 0 1 -1 1h-6a3 3 0 0 0 -3 3a3 3 0 0 0 -3 -3z",
};

function FeatureBlock({ img, icon, kicker, title, desc }: { img: string; icon: string; kicker: string; title: string; desc: string }) {
  return (
    <div
      className="group relative h-60 rounded-2xl overflow-hidden border border-[var(--color-border)] flex flex-col justify-end p-5 transition-transform duration-300 hover:-translate-y-1 bg-cover bg-center"
      style={{ backgroundImage: `url('${img}')` }}
    >
      {/* overlay scuro (piu' scuro per far risaltare testo e icona) */}
      <div className="absolute inset-0 transition-all duration-300 bg-gradient-to-t from-[#06060a]/97 via-[#06060a]/78 to-[#06060a]/45 group-hover:from-[#06060a]/97 group-hover:via-[#06060a]/82" />
      {/* icona sopra il titolo */}
      <span className="relative mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={FEATURE_ICONS[icon]} />
        </svg>
      </span>
      <span className="relative text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)] mb-1.5">
        {kicker}
      </span>
      <h3 className="relative font-bold text-xl text-white leading-tight" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
      <p className="relative text-sm text-[#cfcfd6] leading-relaxed mt-1.5">
        {desc}
      </p>
      {/* linea accento */}
      <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full bg-[var(--color-accent)] transition-all duration-300" />
    </div>
  );
}

function StepBlock({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="group relative p-7 sm:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden transition-all duration-300 hover:border-[var(--color-accent)]/60 hover:-translate-y-1">
      {/* numero gigante di sfondo che si accende all'hover */}
      <div
        className="absolute -top-6 right-1 text-[130px] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
        style={{ color: "rgba(59,157,255,0.06)", fontFamily: "var(--font-heading)" }}
      >
        {num}
      </div>
      <div className="relative">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-5 transition-all duration-300 group-hover:bg-[var(--color-accent)] group-hover:border-[var(--color-accent)]">
          <span className="text-base font-extrabold text-[var(--color-accent)] transition-colors duration-300 group-hover:text-white" style={{ fontFamily: "var(--font-heading)" }}>{num}</span>
        </div>
        <h3 className="font-bold text-xl mb-2 text-white" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full bg-[var(--color-accent)] transition-all duration-300" />
    </div>
  );
}

function AudienceBlock({ img, title, desc }: { img: string; title: string; desc: string }) {
  return (
    <div
      className="group relative h-60 rounded-2xl overflow-hidden border border-[var(--color-border)] flex flex-col justify-end p-5 transition-transform duration-300 hover:-translate-y-1 bg-cover bg-center"
      style={{ backgroundImage: `url('${img}')` }}
    >
      {/* overlay piu' scuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06060a]/97 via-[#06060a]/78 to-[#06060a]/45 transition-all duration-300 group-hover:via-[#06060a]/82" />
      <h3 className="relative font-bold text-xl text-white" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
      <p className="relative text-sm text-[#cfcfd6] leading-relaxed mt-1.5">
        {desc}
      </p>
      <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full bg-[var(--color-accent)] transition-all duration-300" />
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
