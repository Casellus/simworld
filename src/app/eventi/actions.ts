"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { awardXp, revokeXp } from "@/lib/xp";

export async function createEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const game_slug = String(formData.get("game") || "");
  const event_type = String(formData.get("event_type") || "");
  const track = String(formData.get("track") || "").trim();
  const car_class = String(formData.get("car_class") || "").trim();
  const start_at = String(formData.get("start_at") || "");
  const max_participants = Number(formData.get("max_participants") || 0) || null;
  const format = String(formData.get("format") || "").trim();

  if (!title || !start_at || !game_slug || !event_type) throw new Error("Campi obbligatori mancanti.");

  const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
  if (!game) throw new Error("Gioco non valido.");

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let i = 0;
  while (true) {
    const { data } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    i++;
    slug = `${baseSlug}-${i}`;
  }

  const { data: created, error } = await supabase
    .from("events")
    .insert({
      slug,
      title,
      description,
      host_user_id: user.id,
      game_id: game.id,
      event_type,
      track: track || null,
      car_class: car_class || null,
      start_at,
      max_participants,
      format: format || null,
    })
    .select("id, slug")
    .single();

  if (error) throw new Error(error.message);

  await awardXp(user.id, "event_create", created.id);

  revalidatePath("/eventi");
  redirect(`/eventi/${created.slug}`);
}

export async function updateEvent(eventId: string, formData: FormData): Promise<{ error?: string; slug?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: event } = await supabase.from("events").select("id, slug, host_user_id").eq("id", eventId).single();
  if (!event || event.host_user_id !== user.id) return { error: "Non autorizzato" };

  const title = String(formData.get("title") || "").trim();
  const event_type = String(formData.get("event_type") || "");
  const track = String(formData.get("track") || "").trim();
  const car_class = String(formData.get("car_class") || "").trim();
  const start_at = String(formData.get("start_at") || "");
  const max_participants = Number(formData.get("max_participants") || 0) || null;
  const format = String(formData.get("format") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title || !start_at || !event_type) return { error: "Campi obbligatori mancanti." };

  const { error } = await supabase
    .from("events")
    .update({
      title,
      event_type,
      track: track || null,
      car_class: car_class || null,
      start_at,
      max_participants,
      format: format || null,
      description: description || null,
    })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath(`/eventi/${event.slug}`);
  revalidatePath("/eventi");
  return { slug: event.slug };
}

export async function deleteEvent(eventId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: event } = await supabase.from("events").select("id, host_user_id").eq("id", eventId).single();
  if (!event || event.host_user_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  await revokeXp(event.host_user_id, "event_create", eventId);

  revalidatePath("/eventi");
  revalidatePath("/");
  return {};
}

export async function joinEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: user.id,
  });
  if (error) return { error: error.message };
  await awardXp(user.id, "event_join", eventId);
  revalidatePath("/eventi");
  revalidatePath("/eventi/[slug]", "page");
  return { ok: true };
}

export async function leaveEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  await revokeXp(user.id, "event_join", eventId);
  revalidatePath("/eventi");
  revalidatePath("/eventi/[slug]", "page");
  return { ok: true };
}
