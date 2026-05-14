import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { MobileHamburger } from "@/components/mobile-nav";
import { Calendar, Users, Settings2, Search, BookOpen } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const nav = [
    { href: "/eventi", label: "Eventi", icon: Calendar },
    { href: "/team", label: "Team", icon: Users },
    { href: "/assetti", label: "Assetti", icon: Settings2 },
    { href: "/cerca", label: "Cerca", icon: Search },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* DESKTOP */}
        <div className="hidden md:flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Sim<span className="text-[var(--color-primary)]">Universe</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-2 text-sm font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-elev)] rounded-lg transition-colors flex items-center gap-2"
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
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
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-1 w-20">
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

          <Link href="/" className="flex items-center gap-1.5 group absolute left-1/2 -translate-x-1/2">
            <span className="text-base font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Sim<span className="text-[var(--color-primary)]">Universe</span>
            </span>
          </Link>

          <div className="flex justify-end w-20">
            <MobileHamburger />
          </div>
        </div>

      </div>
    </header>
  );
}
