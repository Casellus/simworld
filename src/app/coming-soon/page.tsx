import Image from "next/image";
import { Logo } from "@/components/logo";

export const metadata = { title: "Coming Soon — SimUniverse" };

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* bg glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 900px 500px at 50% 30%, rgba(46,125,255,0.18), transparent 70%)" }} />

      <div className="mb-10">
        <Logo href="/" />
      </div>

      <h1
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1] mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Stiamo arrivando.<br />
        <span className="text-accent-glow">Presto in pista.</span>
      </h1>

      <p className="text-base sm:text-lg text-[var(--color-fg-muted)] max-w-md leading-relaxed mb-12">
        SimUniverse è in fase di lancio. La community italiana del sim racing
        aprirà presto i battenti — tieniti pronto.
      </p>

      {/* sponsor */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
          Partner ufficiale
        </p>
        <a href="https://www.igpclan.it" target="_blank" rel="noopener noreferrer">
          <Image
            src="/sponsors/igp.png"
            alt="IGP"
            width={1176}
            height={429}
            className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
            style={{ height: "2.5rem", width: "auto" }}
          />
        </a>
      </div>
    </div>
  );
}
