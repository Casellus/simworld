"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, Settings } from "lucide-react";

export function UserMenu({ profile }: { profile: { username: string; display_name: string | null; avatar_url: string | null } }) {
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-white/[0.08] transition-colors"
      >
        <div className="h-7 w-7 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center overflow-hidden">
          {profile.avatar_url && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <User className="h-4 w-4 text-[var(--color-primary)]" />
          )}
        </div>
        <span className="hidden sm:inline text-sm font-medium">{profile.display_name || profile.username}</span>
      </button>

      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-56 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] py-1 shadow-xl z-50">
          <Link
            href={`/profilo/${profile.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-elev-2)]"
          >
            <User className="h-4 w-4" /> Profilo
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-elev-2)]"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/dashboard/impostazioni"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg-elev-2)]"
          >
            <Settings className="h-4 w-4" /> Impostazioni
          </Link>
          <div className="border-t border-[var(--color-border)] my-1" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-elev-2)]"
          >
            <LogOut className="h-4 w-4" /> Esci
          </button>
        </div>
      )}
    </div>
  );
}
