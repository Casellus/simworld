import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV = [
  {
    title: "Community",
    links: [
      { href: "/eventi", label: "Eventi" },
      { href: "/team", label: "Team" },
      { href: "/cerca", label: "Cerca pilota / team" },
    ],
  },
  {
    title: "Risorse",
    links: [
      { href: "/assetti", label: "Assetti" },
      { href: "/guide", label: "Guide" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/info/chi-siamo", label: "Chi siamo" },
      { href: "/info/privacy", label: "Privacy Policy" },
      { href: "/info/cookie", label: "Cookie Policy" },
      { href: "/info/termini", label: "Termini di servizio" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16">
      <div className="bg-[var(--color-bg-elev)] border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1 space-y-4">
              <Logo href="/" />
              <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed max-w-56">
                L&apos;hub italiano del sim racing. Tornei, team, assetti e guide in un&apos;unica community.
              </p>
            </div>

            {/* Nav columns */}
            {NAV.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-fg-muted)] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-[var(--color-fg-muted)]">
              © {new Date().getFullYear()} SimUniverse — Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
