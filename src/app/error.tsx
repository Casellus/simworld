"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Next.js already strips the message in production (only `digest` survives),
    // but don't log to the browser console there either.
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-6xl font-extrabold text-[var(--color-danger)] leading-none mb-4"
         style={{ fontFamily: "var(--font-heading)" }}>
        500
      </p>
      <h1 className="text-2xl font-bold text-[var(--color-fg)] mb-2"
          style={{ fontFamily: "var(--font-heading)" }}>
        Qualcosa è andato storto
      </h1>
      <p className="text-[var(--color-fg-muted)] mb-8 max-w-sm">
        Si è verificato un errore imprevisto. Riprova tra qualche istante.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Riprova
      </button>
    </div>
  );
}
