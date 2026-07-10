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

// Colonne pubbliche di profiles. discord_id/steam_id sono esclusi: dopo
// security_migration_2.sql il ruolo authenticated non ha la SELECT su quelle
// colonne, e un select("*") fallirebbe con 42501. Chi ha bisogno dei propri
// contatti usa getMyContacts().
const PROFILE_COLUMNS =
  "id, username, display_name, country, bio, avatar_url, cover_url, hardware, created_at, updated_at, monthly_xp, current_rank";

export const getProfile = cache(async () => {
  const userId = await getUserId();
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).single();
  return data;
});

/**
 * Contatti privati (discord/steam) del solo utente autenticato.
 * La funzione Postgres my_contacts() e' SECURITY DEFINER e filtra su
 * auth.uid(): non esiste modo di chiederli per un altro utente.
 */
export const getMyContacts = cache(async (): Promise<{ discord_id: string | null; steam_id: string | null }> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_contacts").maybeSingle();
  const row = data as { discord_id: string | null; steam_id: string | null } | null;
  return { discord_id: row?.discord_id ?? null, steam_id: row?.steam_id ?? null };
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
