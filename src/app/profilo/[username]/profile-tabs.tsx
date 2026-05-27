"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/card";
import { Settings2, Trophy, MapPin, Cpu, Calendar, Gamepad2, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FlagImg, COUNTRIES } from "@/components/ui/country-select";

type Game = { name: string } | null;
type Setup = { id: string; title: string; car: string; track: string; games: Game };
type EventRow = { slug: string; title: string; event_type: string; start_at: string };
type UserGame = { skill_level: string | null; games: { name: string } | null };

type ProfileData = {
  country: string | null;
  hardware: string | null;
  discord_id: string | null;
  steam_id: string | null;
  bio: string | null;
  created_at: string;
};

type Props = {
  profile: ProfileData;
  setups: Setup[];
  events: EventRow[];
  userGames: UserGame[];
};

const TABS = ["Profilo", "Assetti", "Eventi"] as const;
type Tab = (typeof TABS)[number];

export function ProfileTabs({ profile, setups, events, userGames }: Props) {
  const [tab, setTab] = useState<Tab>("Profilo");

  return (
    <>
      {/* TABS BAR */}
      <div className="flex items-center border-b border-[var(--color-border)] mt-5 overflow-x-auto gap-1 sm:gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "text-[var(--color-fg)] border-[var(--color-primary)] font-semibold"
                : "text-[var(--color-fg-muted)] border-transparent hover:text-[var(--color-fg)]"
            }`}
          >
            {t}
            {t === "Assetti" && (
              <span className="ml-1 text-[var(--color-fg-muted)]/60">{setups.length}</span>
            )}
            {t === "Eventi" && (
              <span className="ml-1 text-[var(--color-fg-muted)]/60">{events.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: PROFILO */}
      {tab === "Profilo" && (
        <div className="mt-5 space-y-5 pb-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
            <h2 className="text-lg font-bold mb-5">Informazioni</h2>
            <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
              <InfoRow icon={Calendar} title={`Membro dal ${formatDate(profile.created_at)}`} sub="Pilota SimUniverse" />
              {profile.country && (
                <InfoRow
                  icon={MapPin}
                  title={
                    <span className="flex items-center gap-1.5">
                      <FlagImg code={profile.country} size={16} />
                      {COUNTRIES.find(c => c.code === profile.country)?.name ?? profile.country}
                    </span>
                  }
                  sub="Paese"
                />
              )}
              {profile.hardware && <InfoRow icon={Cpu} title="Hardware" sub={profile.hardware} />}
              {profile.discord_id && <InfoRow icon={MessageCircle} title={profile.discord_id} sub="Discord" />}
              {profile.steam_id && <InfoRow icon={Gamepad2} title={profile.steam_id} sub="Steam ID" />}
            </div>
            {profile.bio && (
              <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
                <p className="whitespace-pre-wrap text-sm text-[var(--color-fg-muted)] leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>

          {userGames.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
              <h2 className="text-lg font-bold mb-4">Giochi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {userGames.map((ug, i) => (
                  <div key={i} className="flex items-center justify-between text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] px-4 py-3">
                    <span className="font-medium">{ug.games?.name}</span>
                    {ug.skill_level && <Badge variant="primary">{ug.skill_level}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: ASSETTI */}
      {tab === "Assetti" && (
        <div className="mt-5 mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-[var(--color-primary)]" /> Assetti pubblicati
          </h2>
          {setups.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {setups.map((s) => (
                <Link
                  key={s.id}
                  href={`/assetti/${s.id}`}
                  className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="font-semibold text-sm">{s.title}</div>
                  <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                    {s.car} · {s.track} · {s.games?.name}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-fg-muted)]">Nessun assetto pubblicato.</p>
          )}
        </div>
      )}

      {/* TAB: EVENTI */}
      {tab === "Eventi" && (
        <div className="mt-5 mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[var(--color-accent)]" /> Eventi
          </h2>
          {events.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {events.map((ev, i) => (
                <Link
                  key={i}
                  href={`/eventi/${ev.slug}`}
                  className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="font-semibold text-sm">{ev.title}</div>
                  <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                    {ev.event_type} · {formatDate(ev.start_at)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-fg-muted)]">Nessun evento partecipato.</p>
          )}
        </div>
      )}
    </>
  );
}

function InfoRow({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: React.ReactNode; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[var(--color-fg)] break-words">{title}</div>
        <div className="text-xs text-[var(--color-fg-muted)] break-words">{sub}</div>
      </div>
    </div>
  );
}
