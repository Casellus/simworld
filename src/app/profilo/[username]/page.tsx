import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Pencil, Calendar, Cpu } from "lucide-react";
import { one } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile-avatar";
import { SocialLinks } from "@/components/social-links";
import { ProfileTabs } from "./profile-tabs";

export default async function ProfiloPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  // I social (discord/steam/twitch/instagram) sono pubblici: si mostrano come
  // icone cliccabili sul profilo, quindi rientrano nella select pubblica
  // (migration_social.sql riconcede la SELECT su queste colonne).
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, country, bio, avatar_url, cover_url, hardware, created_at, discord_id, steam_id, twitch, instagram")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: setups }, { data: eventParticipants }, { data: userGames }, viewerId] = await Promise.all([
    supabase
      .from("setups")
      .select("id, title, car, track, games(name)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("event_participants")
      .select("events(id, slug, title, start_at, event_type)")
      .eq("user_id", profile.id)
      .limit(20),
    supabase
      .from("user_games")
      .select("skill_level, games(name, slug)")
      .eq("user_id", profile.id),
    getUserId(),
  ]);

  const displayName = profile.display_name || profile.username;
  const isOwner = viewerId === profile.id;

  const events = (eventParticipants ?? [])
    .map((ep) => one<{ slug: string; title: string; event_type: string; start_at: string }>(ep.events))
    .filter(Boolean) as { slug: string; title: string; event_type: string; start_at: string }[];

  const setupsClean = (setups ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    car: s.car,
    track: s.track,
    games: one<{ name: string }>(s.games),
  }));

  const userGamesClean = (userGames ?? []).map((ug) => ({
    skill_level: ug.skill_level,
    games: one<{ name: string }>(ug.games),
  }));

  const hasSocials = !!(profile.discord_id || profile.steam_id || profile.twitch || profile.instagram);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      {/* COVER full-width */}
      <div className="relative h-40 sm:h-52 md:h-60 w-full rounded-2xl overflow-hidden">
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* LAYOUT 2 colonne */}
      <div className="grid gap-5 lg:grid-cols-[300px_1fr] items-start -mt-12 relative">
        {/* SIDEBAR */}
        <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden lg:sticky lg:top-5">
          {/* Avatar */}
          <div className="px-5">
            <div className="h-22 w-22 sm:h-24 sm:w-24 rounded-full bg-[var(--color-bg-elev-2)] border-4 border-[var(--color-bg-elev)] flex items-center justify-center overflow-hidden shrink-0 -mt-1" style={{ height: "88px", width: "88px" }}>
              <ProfileAvatar src={profile.avatar_url} />
            </div>
          </div>
          {/* Nome */}
          <div className="px-5 pt-3">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight break-words" style={{ fontFamily: "var(--font-heading)" }}>
              {displayName}
            </h1>
            <p className="text-sm text-[var(--color-fg-muted)]">@{profile.username}</p>
          </div>
          {/* CTA modifica */}
          {isOwner && (
            <div className="px-5 mt-4">
              <Link
                href="/dashboard/impostazioni"
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(90deg, var(--color-accent), #2b7fe0)" }}
              >
                <Pencil className="h-4 w-4" /> Modifica profilo
              </Link>
            </div>
          )}

          {/* Informazioni */}
          <div className="px-5 pt-5 mt-5 border-t border-[var(--color-border)]">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-3">Informazioni</p>
            <InfoRow icon={Calendar} title={`Membro dal ${formatDate(profile.created_at)}`} sub="Pilota SimUniverse" />
            {profile.hardware && <InfoRow icon={Cpu} title="Hardware" sub={profile.hardware} />}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="px-5 pt-5 mt-5 border-t border-[var(--color-border)]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-2">Bio</p>
              <p className="whitespace-pre-wrap text-sm font-semibold text-[var(--color-fg)] leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Social */}
          {hasSocials && (
            <div className="px-5 pt-5 mt-5 border-t border-[var(--color-border)]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-3">Social</p>
              <SocialLinks values={profile} />
            </div>
          )}

          {/* Giochi */}
          {userGamesClean.length > 0 && (
            <div className="px-5 pt-5 mt-5 pb-5 border-t border-[var(--color-border)]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-3">Giochi</p>
              <div className="space-y-2">
                {userGamesClean.map((ug, i) => (
                  <div key={i} className="flex items-center justify-between text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elev-2)] px-3 py-2.5">
                    <span className="font-medium">{ug.games?.name}</span>
                    {ug.skill_level && (
                      <span className="text-[11px] font-semibold rounded-full px-2 py-0.5 text-[var(--color-accent)] border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/12">
                        {ug.skill_level}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN: tab Assetti/Eventi */}
        <div className="lg:pt-14">
          <ProfileTabs setups={setupsClean} events={events} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-3.5 last:mb-0">
      <div className="h-9 w-9 rounded-[10px] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[var(--color-accent)]" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-[var(--color-fg)] break-words">{title}</div>
        <div className="text-[11.5px] text-[var(--color-fg-muted)] break-words">{sub}</div>
      </div>
    </div>
  );
}
