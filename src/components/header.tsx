import Link from "next/link";
import { headers } from "next/headers";
import { Logo } from "@/components/logo";
import { getProfile } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { RankBadge } from "@/components/rank-badge";
import { MobileHamburger } from "@/components/mobile-nav";
import { Calendar, Users, Settings2, Search, BookOpen } from "lucide-react";
import { NavLink } from "@/components/nav-link";
import { NavAuthButtons, MobileNavAuthButton } from "@/components/nav-auth-buttons";

export async function Header() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname === "/onboarding") return null;

  const profile = await getProfile();

  const nav = [
    { href: "/eventi", label: "Eventi", icon: Calendar },
    { href: "/team", label: "Team", icon: Users },
    { href: "/assetti", label: "Assetti", icon: Settings2 },
    { href: "/cerca", label: "Community", icon: Search },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="hidden md:flex h-14 items-center bg-[#0d0d12] border border-[var(--color-border-strong)] rounded-2xl px-5 my-3 shadow-[0_4px_32px_rgba(0,0,0,0.5)]">

        {/* LOGO */}
        <div className="shrink-0 flex-1">
          <Logo />
        </div>

        {/* DESKTOP NAV — centrato */}
        <nav className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
          {profile && <NotificationBell />}
          {profile && <RankBadge rank={profile.current_rank} />}
          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <NavAuthButtons />
          )}
        </div>

        </div>

        {/* MOBILE */}
        <div className="md:hidden flex w-full h-12 items-center justify-between bg-[#0d0d12] border border-[var(--color-border-strong)] rounded-2xl px-4 my-3 shadow-[0_4px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-1">
            {profile ? (
              <>
                <NotificationBell />
                <RankBadge rank={profile.current_rank} />
                <UserMenu profile={profile} />
              </>
            ) : (
              <MobileNavAuthButton />
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
