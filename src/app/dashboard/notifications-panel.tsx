"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationsPanel({ notifications: initial }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  async function markAllRead() {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).in("id", notifications.map((n) => n.id));
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--color-primary)]" />
          Notifiche
          {unread > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold">
              {unread}
            </span>
          )}
        </h2>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
          >
            Segna tutte come lette
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-[var(--color-fg-muted)]">Nessuna notifica.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-3 rounded-lg border text-sm transition-colors ${
                n.read
                  ? "border-[var(--color-border)] bg-[var(--color-bg-elev)]"
                  : "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {n.link ? (
                    <Link
                      href={n.link}
                      className="font-medium hover:text-[var(--color-primary)]"
                      onClick={() => !n.read && markRead(n.id)}
                    >
                      {n.title}
                    </Link>
                  ) : (
                    <span className="font-medium">{n.title}</span>
                  )}
                  {n.body && <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">{n.body}</p>}
                  <p className="text-xs text-[var(--color-fg-muted)] mt-1">{formatDate(n.created_at)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] shrink-0"
                  >
                    ✓
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
