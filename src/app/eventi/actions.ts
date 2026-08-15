"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { awardXp, revokeXp } from "@/lib/xp";
import { text, oneOf, LIMITS, GENERIC_ERROR } from "@/lib/validation";
import { rateLimit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

const EVENT_TYPE_VALUES = ["torneo", "amichevole", "campionato", "endurance", "sprint"] as const;

// Parse a datetime-local / ISO string into a valid Date, or null.
function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

// max_participants: positive integer or null (no cap). Rejects negatives/zero.
function parseMaxParticipants(value: FormDataEntryValue | null): number | null {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.floor(n), 100000);
}

export async function createEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");
  if (!(await rateLimit("write", user.id))) throw new Error(RATE_LIMITED_MESSAGE);

  const title = text(formData.get("title"), LIMITS.title);
  const description = text(formData.get("description"), LIMITS.description);
  const game_slug = String(formData.get("game") || "");
  const event_type = oneOf(String(formData.get("event_type") || ""), EVENT_TYPE_VALUES);
  const track = text(formData.get("track"), LIMITS.short);
  const car_class = text(formData.get("car_class"), LIMITS.short);
  const start_at = String(formData.get("start_at") || "");
  const max_participants = parseMaxParticipants(formData.get("max_participants"));
  const format = text(formData.get("format"), LIMITS.short);

  if (!title || !start_at || !game_slug || !event_type) throw new Error("Campi obbligatori mancanti.");

  const startDate = parseDate(start_at);
  if (!startDate) throw new Error("Data di inizio non valida.");

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

  if (error) {
    console.error("createEvent failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

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

  const title = text(formData.get("title"), LIMITS.title);
  const event_type = oneOf(String(formData.get("event_type") || ""), EVENT_TYPE_VALUES);
  const track = text(formData.get("track"), LIMITS.short);
  const car_class = text(formData.get("car_class"), LIMITS.short);
  const start_at = String(formData.get("start_at") || "");
  const max_participants = parseMaxParticipants(formData.get("max_participants"));
  const format = text(formData.get("format"), LIMITS.short);
  const description = text(formData.get("description"), LIMITS.description);

  if (!title || !start_at || !event_type) return { error: "Campi obbligatori mancanti." };
  if (!parseDate(start_at)) return { error: "Data di inizio non valida." };

  // banner_url: presente solo se cambiato (nuovo upload o rimozione). Assente = invariato.
  const updateData: Record<string, unknown> = {
    title,
    event_type,
    track: track || null,
    car_class: car_class || null,
    start_at,
    max_participants,
    format: format || null,
    description: description || null,
  };
  if (formData.has("banner_url")) {
    updateData.banner_url = String(formData.get("banner_url") || "") || null;
  }

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) {
    console.error("updateEvent failed:", error.message);
    return { error: GENERIC_ERROR };
  }
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
  if (error) {
    console.error("deleteEvent failed:", error.message);
    return { error: GENERIC_ERROR };
  }

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

  // Validate the event allows this registration before inserting.
  const { data: event } = await supabase
    .from("events")
    .select("id, registration_open, max_participants, start_at, end_at")
    .eq("id", eventId)
    .single();
  if (!event) return { error: "Evento non trovato." };
  if (event.registration_open === false) return { error: "Le iscrizioni sono chiuse." };

  // Reject joining events that have already ended (or started, if no end date).
  const now = Date.now();
  const deadline = event.end_at ?? event.start_at;
  if (deadline && new Date(deadline).getTime() < now) {
    return { error: "L'evento è già terminato." };
  }

  // Already registered?
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) return { error: "Sei già iscritto a questo evento." };

  // Enforce participant cap (best-effort at app level; DB policy is the hard gate).
  if (event.max_participants) {
    const { count } = await supabase
      .from("event_participants")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId);
    if ((count ?? 0) >= event.max_participants) {
      return { error: "Posti esauriti." };
    }
  }

  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: user.id,
  });
  if (error) {
    console.error("joinEvent failed:", error.message);
    return { error: GENERIC_ERROR };
  }
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
  if (error) {
    console.error("leaveEvent failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  await revokeXp(user.id, "event_join", eventId);
  revalidatePath("/eventi");
  revalidatePath("/eventi/[slug]", "page");
  return { ok: true };
}
