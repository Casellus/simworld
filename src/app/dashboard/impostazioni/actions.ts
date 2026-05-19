"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const display_name = String(formData.get("display_name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const country = String(formData.get("country") || "IT").trim();
  const hardware = String(formData.get("hardware") || "").trim();
  const discord_id = String(formData.get("discord_id") || "").trim();
  const steam_id = String(formData.get("steam_id") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();
  const cover_url = String(formData.get("cover_url") || "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      bio: bio || null,
      country: country || "IT",
      hardware: hardware || null,
      discord_id: discord_id || null,
      steam_id: steam_id || null,
      avatar_url: avatar_url || null,
      cover_url: cover_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  const gameSlugs = formData.getAll("games").map(String);
  const skills = JSON.parse(String(formData.get("skills") || "{}")) as Record<string, string>;

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

  // Delete profile data (cascades to related rows via DB FK)
  await supabase.from("profiles").delete().eq("id", user.id);
  // Sign out before deleting the auth user
  await supabase.auth.signOut();
  // Delete auth user (requires service role — falls back to data-only deletion)
  await supabase.auth.admin?.deleteUser(user.id).catch(() => null);

  redirect("/");
}
