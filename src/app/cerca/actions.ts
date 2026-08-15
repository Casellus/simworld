"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { awardXp, revokeXp } from "@/lib/xp";
import { text, textOrNull, oneOf, LIMITS, GENERIC_ERROR } from "@/lib/validation";
import { rateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

const POST_TYPES = ["cerca_team", "cerca_pilota"] as const;

export async function createRecruitmentPost(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");
  if (!(await rateLimit("write", user.id))) throw new Error(RATE_LIMITED_MESSAGE);

  const post_type = oneOf(String(formData.get("post_type") || ""), POST_TYPES);
  const title = text(formData.get("title"), LIMITS.title);
  const description = text(formData.get("description"), LIMITS.description);
  const contact = textOrNull(formData.get("contact"), LIMITS.contact);
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

  const { data: createdPost, error } = await supabase.from("recruitment_posts").insert({
    post_type,
    user_id: user.id,
    team_id,
    game_id,
    title,
    description,
    contact,
  }).select("id").single();
  if (error) {
    console.error("createRecruitmentPost failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  if (createdPost?.id) {
    await awardXp(user.id, "post_create", createdPost.id);
  }

  revalidatePath("/cerca");
  redirect("/cerca");
}

export async function updateRecruitmentPost(postId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const { data: post } = await supabase.from("recruitment_posts").select("user_id").eq("id", postId).single();
  if (!post || post.user_id !== user.id) throw new Error("Non autorizzato");

  const title = text(formData.get("title"), LIMITS.title);
  const description = text(formData.get("description"), LIMITS.description);
  const contact = textOrNull(formData.get("contact"), LIMITS.contact);
  const game_slug = String(formData.get("game") || "");

  if (!title || !description) throw new Error("Campi obbligatori mancanti.");

  let game_id: string | null = null;
  if (game_slug) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (g) game_id = g.id;
  }

  const { error } = await supabase.from("recruitment_posts").update({
    title,
    description,
    contact,
    game_id,
  }).eq("id", postId);
  if (error) {
    console.error("updateRecruitmentPost failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  revalidatePath("/cerca");
  redirect("/cerca");
}

export async function deleteRecruitmentPost(postId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: post } = await supabase.from("recruitment_posts").select("id, user_id, team_id, teams(owner_id)").eq("id", postId).single();
  if (!post) return { error: "Post non trovato" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOwner = post.user_id === user.id || (post as any).teams?.owner_id === user.id;
  if (!isOwner) return { error: "Non autorizzato" };

  const { error } = await supabase.from("recruitment_posts").delete().eq("id", postId);
  if (error) {
    console.error("deleteRecruitmentPost failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  await revokeXp(post.user_id, "post_create", postId);

  revalidatePath("/cerca");
  revalidatePath("/");
  return {};
}

export async function closeRecruitmentPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  // Ownership check: only the post author or the owning team's owner may close it.
  const { data: post } = await supabase
    .from("recruitment_posts")
    .select("id, user_id, team_id, teams(owner_id)")
    .eq("id", postId)
    .single();
  if (!post) return { error: "Post non trovato" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOwner = post.user_id === user.id || (post as any).teams?.owner_id === user.id;
  if (!isOwner) return { error: "Non autorizzato" };

  const { error } = await supabase.from("recruitment_posts").update({ active: false }).eq("id", postId);
  if (error) {
    console.error("closeRecruitmentPost failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/cerca");
  return { ok: true };
}
