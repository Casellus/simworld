import Link from "next/link";
import { Logo } from "@/components/logo";
import { getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { MobileHamburger } from "@/components/mobile-nav";
import { Calendar, Users, Settings2, Search, BookOpen } from "lucide-react";
import { NavLink } from "@/components/nav-link";

export async function Header() {
  const profile = await getProfile();

  const nav = [
    { href: "/eventi", label: "Eventi", icon: Calendar },
    { href: "/team", label: "Team", icon: Users },
    { href: "/assetti", label: "Assetti", icon: Settings2 },
    { href: "/cerca", label: "Cerca", icon: Search },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 pt-4 pb-3 px-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">

        {/* LOGO */}
        <div className="hidden md:block shrink-0">
          <Logo />
        </div>

        {/* DESKTOP PILL NAV */}
        <nav className="hidden md:flex items-center gap-0 bg-[#111118] rounded-full px-2 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-white/[0.06]">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {profile && <NotificationBell />}
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Accedi</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrati</Button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex w-full h-12 items-center justify-between">
          <div className="flex items-center gap-1">
            {profile ? (
              <>
                <NotificationBell />
                <UserMenu profile={profile} />
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Accedi</Button>
              </Link>
            )}
          </div>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Logo size="sm" href={null} />
          </Link>
          <MobileHamburger isLoggedIn={!!profile} />
        </div>

      </div>
    </header>
  );
}
