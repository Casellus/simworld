import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Settings2, BookOpen, Search, Shield, Zap, Heart, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Chi siamo — SimUniverse",
  description: "SimUniverse è l'hub italiano del sim racing: tornei, team, assetti e guide in un'unica community.",
};

const FEATURES = [
  { icon: Trophy,    title: "Eventi & Tornei",     desc: "Organizza o partecipa a gare su tutti i sim principali. Iscrizioni, gestione partecipanti e risultati in un click." },
  { icon: Users,     title: "Team",                desc: "Crea il tuo team, gestisci il roster e recluta nuovi piloti tramite la bacheca pubblica." },
  { icon: Settings2, title: "Assetti",             desc: "Condividi e scarica setup per ogni tracciato. Trova il bilanciamento perfetto grazie alla community." },
  { icon: BookOpen,  title: "Guide",               desc: "Tutoriali, analisi di traiettorie e consigli tecnici per ogni livello di esperienza." },
  { icon: Search,    title: "Trova compagni",      desc: "Pubblica il tuo profilo o cerca il partner ideale con il sistema di recruiting integrato." },
  { icon: Globe,     title: "100% Italiano",       desc: "Una piattaforma pensata per la community italiana: lingua, fuso orario, mentalità." },
];

const VALUES = [
  { icon: Shield, color: "from-blue-500/20 to-blue-600/10",  border: "border-blue-500/30", title: "Rispetto",    desc: "Tolleranza zero per comportamenti tossici. La piattaforma è uno spazio sicuro per tutti." },
  { icon: Trophy, color: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/30", title: "Fair play",  desc: "La sportività è nel DNA di questa community. Corriamo duro ma pulito." },
  { icon: Zap,    color: "from-cyan-500/20 to-cyan-600/10",  border: "border-cyan-500/30",  title: "Condivisione", desc: "Assetti, guide e consigli: la conoscenza cresce quando si condivide." },
  { icon: Heart,  color: "from-pink-500/20 to-pink-600/10",  border: "border-pink-500/30",  title: "Inclusività", desc: "Benvenuti principianti e veterani, da ogni angolo d'Italia e non solo." },
];

const GAMES = ["ACC", "iRacing", "LMU", "AC EVO", "F1 25", "AMS2", "rFactor 2"];

const STATS = [
  { value: "7+",   label: "Sim supportati" },
  { value: "100%", label: "Italiano" },
  { value: "Free", label: "Per sempre" },
];

export default function ChiSiamoPage() {
  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <video
          src="/video-homepage.mp4"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/60 via-[#050507]/50 to-[#050507]" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-4">Chi siamo</p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}>
            La community<br />
            <span style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              italiana del sim
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            SimUniverse nasce per riunire piloti, team e appassionati in un'unica piattaforma pensata per il sim racing italiano.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center p-6 rounded-2xl bg-[var(--color-bg-elev)] border border-[var(--color-border)]">
              <div className="text-4xl sm:text-5xl font-extrabold text-[var(--color-primary)] mb-1"
                style={{ fontFamily: "var(--font-heading)" }}>{s.value}</div>
              <div className="text-xs font-semibold tracking-widest uppercase text-[var(--color-fg-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #050507 60%, #0d1220 100%)" }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(46,125,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,224,255,0.2) 0%, transparent 50%)" }} />
            <div className="relative p-8 sm:p-14">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-6">La nostra missione</p>
              <blockquote className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white mb-8"
                style={{ fontFamily: "var(--font-heading)" }}>
                &ldquo;Riunire la community italiana del sim racing in un unico spazio — senza dispersioni, senza barriere.&rdquo;
              </blockquote>
              <p className="text-[var(--color-fg-muted)] text-base leading-relaxed max-w-2xl">
                La community italiana era frammentata tra decine di Discord, gruppi Facebook e forum separati. SimUniverse è la risposta: un hub dove trovare compagni, organizzare campionati, condividere assetti e crescere insieme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">Cosa offriamo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Tutto il sim racing,<br />in un posto solo
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/60 transition-all duration-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at top left, rgba(46,125,255,0.08), transparent 70%)" }} />
                <div className="h-11 w-11 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">I nostri valori</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Corriamo con stile
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, color, border, title, desc }) => (
              <div key={title} className={`p-6 rounded-2xl border bg-gradient-to-br ${color} ${border}`}>
                <Icon className="h-8 w-8 mb-4 text-white/80" />
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
                <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES ── */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">Giochi supportati</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-10" style={{ fontFamily: "var(--font-heading)" }}>
            I sim che ami
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {GAMES.map((g) => (
              <span key={g} className="px-5 py-2.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elev)] text-sm font-semibold text-[var(--color-fg-muted)] hover:text-white hover:border-[var(--color-primary)] transition-colors">
                {g}
              </span>
            ))}
            <span className="px-5 py-2.5 rounded-full border border-dashed border-[var(--color-border)] text-sm font-semibold text-[var(--color-fg-muted)] italic">
              e altri in arrivo…
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl p-10 sm:p-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0b2460 0%, #050e2a 50%, #05100d 100%)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(46,125,255,0.35) 0%, transparent 55%), radial-gradient(circle at 75% 70%, rgba(0,224,255,0.18) 0%, transparent 55%)" }} />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Pronto a scendere in pista?
              </h2>
              <p className="text-[var(--color-fg-muted)] mb-8 text-base">
                Unisciti gratis a SimUniverse. Crea il tuo profilo, trova compagni e inizia a correre.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="px-8">Crea account gratis</Button>
                </Link>
                <Link href="/eventi">
                  <Button size="lg" variant="outline" className="px-8 !bg-white/10 !border-white/20 hover:!bg-white/20">
                    Esplora eventi
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-xs text-[var(--color-fg-muted)]">
                Domande? Scrivici a{" "}
                <a href="mailto:ciao@simuniverse.it" className="text-[var(--color-primary)] hover:underline">
                  ciao@simuniverse.it
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
