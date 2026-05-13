import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";
import { MobileNav } from "@/components/mobile-nav";
import { Flag, Calendar, Users, Settings2, Search, BookOpen } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let notifications: { id: string; title: string; body: string | null; link: string | null; read: boolean; created_at: string }[] = [];
  if (user) {
    const [{ data: profileData }, { data: notifData }] = await Promise.all([
      supabase.from("profiles").select("username, display_name, avatar_url").eq("id", user.id).single(),
      supabase.from("notifications").select("id, title, body, link, read, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    profile = profileData;
    notifications = notifData ?? [];
  }

  const nav = [
    { href: "/eventi", label: "Eventi", icon: Calendar },
    { href: "/team", label: "Team", icon: Users },
    { href: "/assetti", label: "Assetti", icon: Settings2 },
    { href: "/cerca", label: "Cerca", icon: Search },
    { href: "/guide", label: "Guide", icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <Flag className="h-6 w-6 text-[var(--color-primary)] group-hover:rotate-12 transition-transform" />
              <span className="text-lg font-black tracking-tight uppercase">
                Sim<span className="text-[var(--color-primary)]">Universe</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 text-sm font-medium uppercase tracking-wider text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev)] rounded transition-colors flex items-center gap-2"
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {profile && <NotificationBell initial={notifications} />}
              {profile ? (
                <UserMenu profile={profile} />
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Accedi</Button>
                  </Link>
                  <Link href="/auth/register" className="hidden sm:block">
                    <Button size="sm">Registrati</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* bottom nav mobile */}
      <MobileNav />
    </>
  );
}
