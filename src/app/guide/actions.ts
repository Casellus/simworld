"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { text, textOrNull, storageUrlOrNull, LIMITS, GENERIC_ERROR } from "@/lib/validation";
import { isEmbeddableVideo } from "@/components/video-embed";

// Verifica che l'utente sia un creator autorizzato (can_write_guides).
async function requireCreator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("can_write_guides")
    .eq("id", user.id)
    .single();
  return data?.can_write_guides ? user : null;
}

export async function createGuide(formData: FormData): Promise<void> {
  const user = await requireCreator();
  if (!user) throw new Error("Non autorizzato");

  const supabase = await createClient();

  const title = text(formData.get("title"), LIMITS.title);
  const excerpt = textOrNull(formData.get("excerpt"), LIMITS.short);
  const body = text(formData.get("body"), LIMITS.notes);
  const category = textOrNull(formData.get("category"), LIMITS.short);
  const cover_url = storageUrlOrNull(formData.get("cover_url"));
  const game_slug = String(formData.get("game") || "");
  const rawVideo = String(formData.get("video_url") || "").trim();
  const published = formData.get("published") === "on";

  if (!title || !body) throw new Error("Titolo e contenuto sono obbligatori.");

  // Il video, se presente, deve essere un link YouTube/Vimeo valido.
  let video_url: string | null = null;
  if (rawVideo) {
    if (!isEmbeddableVideo(rawVideo)) {
      throw new Error("Il link video deve essere di YouTube o Vimeo.");
    }
    video_url = rawVideo;
  }

  let game_id: string | null = null;
  if (game_slug) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (g) game_id = g.id;
  }

  // slug univoco dal titolo
  const base = slugify(title);
  let slug = base;
  let i = 0;
  while (true) {
    const { data } = await supabase.from("guides").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    i++;
    slug = `${base}-${i}`;
  }

  const { error } = await supabase.from("guides").insert({
    slug,
    title,
    excerpt,
    body,
    category,
    game_id,
    cover_url,
    video_url,
    author_id: user.id,
    published,
  });
  if (error) {
    console.error("createGuide failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  revalidatePath("/guide");
  redirect(published ? `/guide/${slug}` : "/guide");
}

export async function updateGuide(guideId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  // Solo l'autore della guida.
  const { data: guide } = await supabase.from("guides").select("id, slug, author_id").eq("id", guideId).single();
  if (!guide || guide.author_id !== user.id) throw new Error("Non autorizzato");

  const title = text(formData.get("title"), LIMITS.title);
  const excerpt = textOrNull(formData.get("excerpt"), LIMITS.short);
  const body = text(formData.get("body"), LIMITS.notes);
  const category = textOrNull(formData.get("category"), LIMITS.short);
  const cover_url = storageUrlOrNull(formData.get("cover_url"));
  const game_slug = String(formData.get("game") || "");
  const rawVideo = String(formData.get("video_url") || "").trim();
  const published = formData.get("published") === "on";

  if (!title || !body) throw new Error("Titolo e contenuto sono obbligatori.");

  let video_url: string | null = null;
  if (rawVideo) {
    if (!isEmbeddableVideo(rawVideo)) throw new Error("Il link video deve essere di YouTube o Vimeo.");
    video_url = rawVideo;
  }

  let game_id: string | null = null;
  if (game_slug) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (g) game_id = g.id;
  }

  const { error } = await supabase
    .from("guides")
    .update({ title, excerpt, body, category, game_id, cover_url, video_url, published })
    .eq("id", guideId);
  if (error) {
    console.error("updateGuide failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  revalidatePath("/guide");
  revalidatePath(`/guide/${guide.slug}`);
  redirect(published ? `/guide/${guide.slug}` : "/guide");
}

export async function deleteGuide(guideId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: guide } = await supabase.from("guides").select("id, author_id").eq("id", guideId).single();
  if (!guide || guide.author_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase.from("guides").delete().eq("id", guideId);
  if (error) {
    console.error("deleteGuide failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  revalidatePath("/guide");
  return {};
}
