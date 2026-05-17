import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pagina non trovata · SimUniverse" };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl font-extrabold text-[var(--color-primary)] leading-none mb-4"
         style={{ fontFamily: "var(--font-heading)" }}>
        404
      </p>
      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}>
        Pagina non trovata
      </h1>
      <p className="text-[var(--color-fg-muted)] mb-8 max-w-sm">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Torna alla home
        </Link>
        <Link
          href="/eventi"
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-bg-elev)] transition-colors"
        >
          Vedi gli eventi
        </Link>
      </div>
    </div>
  );
}
