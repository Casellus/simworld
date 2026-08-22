"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { text, LIMITS, storageUrlOrNull, GENERIC_ERROR } from "@/lib/validation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const username = String(formData.get("username") || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, LIMITS.username);
  const display_name = text(formData.get("display_name"), LIMITS.name);
  const bio = text(formData.get("bio"), LIMITS.bio);
  const country = String(formData.get("country") || "IT").trim().slice(0, 2).toUpperCase() || "IT";
  const hardware = text(formData.get("hardware"), LIMITS.hardware);
  const discord_id = text(formData.get("discord_id"), LIMITS.handle);
  const steam_id = text(formData.get("steam_id"), LIMITS.handle);
  const twitch = text(formData.get("twitch"), LIMITS.handle);
  const instagram = text(formData.get("instagram"), LIMITS.handle);
  const avatar_url = storageUrlOrNull(formData.get("avatar_url"));
  const cover_url = storageUrlOrNull(formData.get("cover_url"));

  if (username && username.length < 3) return { error: "Username deve avere almeno 3 caratteri." };

  if (username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();
    if (existing) return { error: "Username già in uso. Scegline un altro." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(username ? { username } : {}),
      display_name: display_name || null,
      bio: bio || null,
      country: country || "IT",
      hardware: hardware || null,
      discord_id: discord_id || null,
      steam_id: steam_id || null,
      twitch: twitch || null,
      instagram: instagram || null,
      avatar_url,
      cover_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  const gameSlugs = formData.getAll("games").map(String);
  // Guard JSON.parse — malformed input must not crash the action.
  let skills: Record<string, string> = {};
  try {
    const parsed = JSON.parse(String(formData.get("skills") || "{}"));
    if (parsed && typeof parsed === "object") skills = parsed as Record<string, string>;
  } catch {
    skills = {};
  }

  await supabase.from("user_games").delete().eq("user_id", user.id);
  if (gameSlugs.length > 0) {
    const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
    if (games) {
      await supabase.from("user_games").insert(
        games.map((g) => ({
          user_id: user.id,
          game_id: g.id,
          skill_level: skills[g.slug] || "intermedio",
        }))
      );
    }
  }

  revalidatePath("/dashboard/impostazioni");
  revalidatePath(`/profilo`);
  return { ok: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const admin = createAdminClient();

  // Delete profile data (cascades to related rows via DB FK)
  await supabase.from("profiles").delete().eq("id", user.id);
  // Sign out the user first
  await supabase.auth.signOut();
  // Delete auth user via admin client (service role)
  await admin.auth.admin.deleteUser(user.id);

  redirect("/");
}
