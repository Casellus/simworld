import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/card";
import { MapPin, Cpu, Calendar, Settings2, Gamepad2, MessageCircle, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";
import { ProfileAvatar } from "@/components/profile-avatar";

export default async function ProfiloPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: setups }, { data: events }, { data: userGames }] = await Promise.all([
    supabase
      .from("setups")
      .select("id, title, car, track, games(name)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("event_participants")
      .select("events(id, slug, title, start_at, event_type)")
      .eq("user_id", profile.id)
      .limit(6),
    supabase
      .from("user_games")
      .select("skill_level, games(name, slug)")
      .eq("user_id", profile.id),
  ]);

  const displayName = profile.display_name || profile.username;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      {/* ── CARD HEADER (cover + avatar + tabs) ── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden">
        {/* COVER */}
        <div className="relative h-44 sm:h-60 md:h-72 w-full">
          {profile.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* AVATAR + NOME — sovrapposti alla cover */}
        <div className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 pb-4">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-[var(--color-bg-elev-2)] border-4 border-[var(--color-bg-elev)] flex items-center justify-center overflow-hidden shrink-0">
              <ProfileAvatar src={profile.avatar_url} />
            </div>
            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                {displayName}
              </h1>
              <p className="text-sm text-[var(--color-fg-muted)]">@{profile.username}</p>
            </div>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-6 border-t border-[var(--color-border)] -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto">
            <span className="py-3 text-sm font-semibold text-[var(--color-fg)] border-b-2 border-[var(--color-primary)] whitespace-nowrap">
              Profilo
            </span>
            <span className="py-3 text-sm font-medium text-[var(--color-fg-muted)] whitespace-nowrap">
              Assetti <span className="text-[var(--color-fg-muted)]/60">{setups?.length ?? 0}</span>
            </span>
            <span className="py-3 text-sm font-medium text-[var(--color-fg-muted)] whitespace-nowrap">
              Eventi <span className="text-[var(--color-fg-muted)]/60">{events?.length ?? 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── INFO ("About") ── */}
      <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
        <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "var(--font-heading)" }}>Informazioni</h2>
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          <InfoRow icon={Calendar} title={`Membro dal ${formatDate(profile.created_at)}`} sub="Pilota SimUniverse" />
          {profile.country && (
            <InfoRow icon={MapPin} title={profile.country} sub="Paese" />
          )}
          {profile.hardware && (
            <InfoRow icon={Cpu} title="Hardware" sub={profile.hardware} />
          )}
          {profile.discord_id && (
            <InfoRow icon={MessageCircle} title={profile.discord_id} sub="Discord" />
          )}
          {profile.steam_id && (
            <InfoRow icon={Gamepad2} title={profile.steam_id} sub="Steam ID" />
          )}
        </div>
        {profile.bio && (
          <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
            <p className="whitespace-pre-wrap text-sm text-[var(--color-fg-muted)] leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* ── GIOCHI ── */}
      {userGames && userGames.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Giochi</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {userGames.map((ug, i) => {
              const game = one<{ name: string }>(ug.games);
              return (
                <div key={i} className="flex items-center justify-between text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] px-4 py-3">
                  <span className="font-medium">{game?.name}</span>
                  {ug.skill_level && <Badge variant="primary">{ug.skill_level}</Badge>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ASSETTI ── */}
      {setups && setups.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Settings2 className="h-5 w-5 text-[var(--color-primary)]" /> Assetti pubblicati
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {setups.map((s) => {
              const game = one<{ name: string }>(s.games);
              return (
                <Link
                  key={s.id}
                  href={`/assetti/${s.id}`}
                  className="block p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="font-semibold text-sm">{s.title}</div>
                  <div className="text-xs text-[var(--color-fg-muted)] mt-1">
                    {s.car} · {s.track} · {game?.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── EVENTI ── */}
      {events && events.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Trophy className="h-5 w-5 text-[var(--color-accent)]" /> Eventi
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((ep, i) => {
              const ev = one<{ slug: string; title: string; event_type: string; start_at: string }>(ep.events);
              if (!ev) return null;
              return (
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
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
