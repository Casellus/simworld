"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  async function markAllRead() {
    const supabase = createClient();
    const ids = notifications.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center h-9 w-9 rounded hover:bg-[var(--color-bg-elev)] transition-colors"
        aria-label="Notifiche"
      >
        <Bell className="h-5 w-5 text-[var(--color-fg-muted)]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-80 max-w-[90vw] rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] shadow-xl z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-bold uppercase tracking-wider">Notifiche</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
            {notifications.length === 0 ? (
              <li className="px-3 py-4 text-sm text-[var(--color-fg-muted)] text-center">Nessuna notifica.</li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-3 py-2.5 text-sm transition-colors ${
                    n.read ? "" : "bg-[var(--color-primary)]/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link
                          href={n.link}
                          className="font-medium hover:text-[var(--color-primary)] block truncate"
                          onClick={() => { if (!n.read) markRead(n.id); setOpen(false); }}
                        >
                          {n.title}
                        </Link>
                      ) : (
                        <span className="font-medium block truncate">{n.title}</span>
                      )}
                      {n.body && <p className="text-xs text-[var(--color-fg-muted)] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{formatDate(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] shrink-0 mt-0.5"
                        title="Segna come letta"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-[var(--color-border)] px-3 py-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              Vedi tutte nella dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
