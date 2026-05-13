"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createRecruitmentPost(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const post_type = String(formData.get("post_type") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const game_slug = String(formData.get("game") || "");
  const team_slug = String(formData.get("team_slug") || "");

  if (!title || !description || !post_type) throw new Error("Campi obbligatori mancanti.");

  let game_id: string | null = null;
  if (game_slug) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (g) game_id = g.id;
  }

  let team_id: string | null = null;
  if (post_type === "cerca_pilota" && team_slug) {
    const { data: t } = await supabase
      .from("teams")
      .select("id, owner_id")
      .eq("slug", team_slug)
      .single();
    if (!t || t.owner_id !== user.id) throw new Error("Team non valido o non sei il proprietario.");
    team_id = t.id;
  }

  const { error } = await supabase.from("recruitment_posts").insert({
    post_type,
    user_id: post_type === "cerca_team" ? user.id : null,
    team_id,
    game_id,
    title,
    description,
    contact: contact || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/cerca");
  redirect("/cerca");
}

export async function closeRecruitmentPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };
  const { error } = await supabase.from("recruitment_posts").update({ active: false }).eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/cerca");
  return { ok: true };
}
