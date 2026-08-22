import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { one } from "@/lib/types";
import { ProfileAvatar } from "@/components/profile-avatar";
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

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      {/* ── CARD HEADER ── */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)]">
        {/* COVER */}
        <div className="relative h-44 sm:h-60 md:h-72 w-full rounded-t-2xl overflow-hidden">
          {profile.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* AVATAR + NOME */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-end gap-3 -mt-10 sm:-mt-12">
            <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full bg-[var(--color-bg-elev-2)] border-4 border-[var(--color-bg-elev)] flex items-center justify-center overflow-hidden shrink-0 relative z-10">
              <ProfileAvatar src={profile.avatar_url} />
            </div>
          </div>
          <div className="flex items-start justify-between gap-3 mt-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight break-words" style={{ fontFamily: "var(--font-heading)" }}>
                {displayName}
              </h1>
              <p className="text-sm text-[var(--color-fg-muted)]">@{profile.username}</p>
            </div>
            {isOwner && (
              <Link href="/dashboard/impostazioni" className="shrink-0 mt-1">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Modifica profilo</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* TABS — fuori dalla card header */}
      <ProfileTabs
        profile={{
          country: profile.country,
          hardware: profile.hardware,
          // Social pubblici: mostrati come icone cliccabili.
          discord_id: profile.discord_id,
          steam_id: profile.steam_id,
          twitch: profile.twitch,
          instagram: profile.instagram,
          bio: profile.bio,
          created_at: profile.created_at,
        }}
        setups={setupsClean}
        events={events}
        userGames={userGamesClean}
      />
    </div>
  );
}
