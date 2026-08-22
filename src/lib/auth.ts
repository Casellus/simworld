import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// React cache() deduplicates these within a single server render pass:
// Header + page no longer each round-trip to Supabase auth.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Returns the authenticated user id by verifying the JWT locally (getClaims),
// avoiding a network round-trip to the Supabase auth server on every page render.
export const getUserId = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
});

// Colonne del profilo lette dal proprietario. I social (discord/steam/twitch/
// instagram) sono pubblici (migration_social.sql), quindi inclusi qui.
const PROFILE_COLUMNS =
  "id, username, display_name, country, bio, avatar_url, cover_url, hardware, created_at, updated_at, monthly_xp, current_rank, discord_id, steam_id, twitch, instagram";

export const getProfile = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).single();
  return data;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login");
  return profile;
}
