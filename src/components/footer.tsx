import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elev)] mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-3">
            <Logo href="/" />
          </div>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Hub italiano del sim racing. Tornei, team, assetti, guide.
          </p>
        </div>
        <FooterCol
          title="Community"
          links={[
            { href: "/eventi", label: "Eventi" },
            { href: "/team", label: "Team" },
            { href: "/cerca", label: "Cerca pilota / team" },
          ]}
        />
        <FooterCol
          title="Risorse"
          links={[
            { href: "/assetti", label: "Assetti" },
            { href: "/guide", label: "Guide" },
          ]}
        />
        <FooterCol
          title="Info"
          links={[
            { href: "/info/chi-siamo", label: "Chi siamo" },
            { href: "/info/privacy", label: "Privacy" },
            { href: "/info/termini", label: "Termini" },
          ]}
        />
      </div>
      <div className="border-t border-[var(--color-border)] py-4 text-center text-xs text-[var(--color-fg-muted)]">
        © {new Date().getFullYear()} SimUniverse — Tutte le piste, una community.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-[var(--color-fg)] mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
