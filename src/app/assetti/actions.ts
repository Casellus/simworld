"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { awardXp, revokeXp } from "@/lib/xp";
import { text, textOrNull, oneOf, storageUrlOrNull, LIMITS, GENERIC_ERROR } from "@/lib/validation";

const ALLOWED_EXT = ["json", "sto", "svm", "ini", "rcd", "txt", "xml", "zip"];
const SETUP_TYPES = ["auto", "simulatore"] as const;
export async function createSetupRecord(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorizzato" };

    const setup_type = oneOf(String(formData.get("setup_type") || "auto"), SETUP_TYPES) ?? "auto";
    const title      = text(formData.get("title"), LIMITS.title);
    const game_slug  = formData.get("game") as string;
    const car        = textOrNull(formData.get("car"), LIMITS.short);
    const track      = textOrNull(formData.get("track"), LIMITS.short);
    const conditions = textOrNull(formData.get("conditions"), LIMITS.short);
    const category   = textOrNull(formData.get("category"), LIMITS.short);
    const notes      = textOrNull(formData.get("notes"), LIMITS.notes);
    const file_url   = storageUrlOrNull(formData.get("file_url"));
    const photo_url  = storageUrlOrNull(formData.get("photo_url"));

    if (!title || !game_slug) return { error: "Campi obbligatori mancanti." };
    if (setup_type === "auto" && (!car || !track)) return { error: "Auto e tracciato sono obbligatori." };

    const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (!game) return { error: "Gioco non valido." };

    const { data: created, error: dbErr } = await supabase
      .from("setups")
      .insert({ user_id: user.id, game_id: game.id, setup_type, title, car, track, conditions, category, notes, file_url, photo_url })
      .select("id")
      .single();

    if (dbErr) {
      console.error("createSetupRecord failed:", dbErr.message);
      return { error: GENERIC_ERROR };
    }
    if (!created?.id) return { error: "Inserimento non riuscito." };

    await awardXp(user.id, "setup_create", created.id);

    revalidatePath("/assetti");
    revalidatePath("/");
    return { id: created.id };
  } catch (e) {
    console.error("createSetupRecord threw:", e);
    return { error: GENERIC_ERROR };
  }
}

export async function uploadSetupFull(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorizzato" };

    const title = text(formData.get("title"), LIMITS.title);
    const game_slug = formData.get("game") as string;
    const car = text(formData.get("car"), LIMITS.short);
    const track = text(formData.get("track"), LIMITS.short);
    const conditions = textOrNull(formData.get("conditions"), LIMITS.short);
    const notes = textOrNull(formData.get("notes"), LIMITS.notes);
    const setupFile = formData.get("file") as File | null;

    if (!title || !game_slug || !car || !track) return { error: "Campi obbligatori mancanti." };

    const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (!game) return { error: "Gioco non valido." };

    let file_url: string | null = null;
    if (setupFile && setupFile.size > 0) {
      if (setupFile.size > 5 * 1024 * 1024) return { error: "File assetto max 5MB." };
      const ext = setupFile.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXT.includes(ext)) return { error: `Estensione non supportata: .${ext}` };
      if (!process.env.SUPABASE_SECRET_KEY) return { error: "Server non configurato per upload file. Riprova senza allegare un file." };

      const admin = createAdminClient();
      const path = `${user.id}/${Date.now()}-${setupFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await admin.storage.from("setups").upload(path, setupFile, { upsert: false });
      if (upErr) return { error: `Errore upload file: ${upErr.message}` };
      file_url = admin.storage.from("setups").getPublicUrl(path).data.publicUrl;
    }

    const { data: created, error: dbErr } = await supabase
      .from("setups")
      .insert({ user_id: user.id, game_id: game.id, title, car, track, conditions, notes, file_url })
      .select("id")
      .single();

    if (dbErr) {
      console.error("uploadSetupFull failed:", dbErr.message);
      return { error: GENERIC_ERROR };
    }
    if (!created?.id) return { error: "Inserimento non riuscito." };

    await awardXp(user.id, "setup_create", created.id);

    revalidatePath("/assetti");
    revalidatePath("/");
    return { id: created.id };
  } catch (e) {
    console.error("uploadSetupFull threw:", e);
    return { error: GENERIC_ERROR };
  }
}

export async function uploadSetup(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const title = text(formData.get("title"), LIMITS.title);
  const game_slug = String(formData.get("game") || "");
  const car = text(formData.get("car"), LIMITS.short);
  const track = text(formData.get("track"), LIMITS.short);
  const conditions = textOrNull(formData.get("conditions"), LIMITS.short);
  const notes = textOrNull(formData.get("notes"), LIMITS.notes);
  const file = formData.get("file") as File | null;

  if (!title || !game_slug || !car || !track) throw new Error("Campi obbligatori mancanti.");

  const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
  if (!game) throw new Error("Gioco non valido.");

  let file_url: string | null = null;
  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) throw new Error("File max 5MB.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXT.includes(ext)) throw new Error(`Estensione non supportata: ${ext}`);

    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("setups").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) {
      console.error("uploadSetup storage failed:", upErr.message);
      throw new Error("Caricamento file non riuscito. Riprova.");
    }
    const { data: pub } = supabase.storage.from("setups").getPublicUrl(path);
    file_url = pub.publicUrl;
  }

  const { data: created, error } = await supabase
    .from("setups")
    .insert({
      user_id: user.id,
      game_id: game.id,
      title,
      car,
      track,
      conditions: conditions || null,
      notes: notes || null,
      file_url,
    })
    .select("id")
    .single();

  if (error) {
    console.error("uploadSetup insert failed:", error.message);
    throw new Error(GENERIC_ERROR);
  }

  revalidatePath("/assetti");
  redirect(`/assetti/${created.id}`);
}

export async function updateSetup(setupId: string, formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: setup } = await supabase.from("setups").select("id, user_id").eq("id", setupId).single();
  if (!setup || setup.user_id !== user.id) return { error: "Non autorizzato" };

  const { data: existing } = await supabase.from("setups").select("setup_type").eq("id", setupId).single();
  const setup_type = existing?.setup_type ?? "auto";

  const title      = text(formData.get("title"), LIMITS.title);
  const car        = textOrNull(formData.get("car"), LIMITS.short);
  const track      = textOrNull(formData.get("track"), LIMITS.short);
  const conditions = textOrNull(formData.get("conditions"), LIMITS.short);
  const category   = textOrNull(formData.get("category"), LIMITS.short);
  const notes      = textOrNull(formData.get("notes"), LIMITS.notes);
  const photo_url  = storageUrlOrNull(formData.get("photo_url"));

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (setup_type === "auto" && (!car || !track)) return { error: "Auto e tracciato sono obbligatori." };

  const { error } = await supabase
    .from("setups")
    .update({ title, car, track, conditions, category, notes, photo_url })
    .eq("id", setupId);

  if (error) {
    console.error("updateSetup failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  revalidatePath(`/assetti/${setupId}`);
  revalidatePath("/assetti");
  return {};
}

export async function deleteSetup(setupId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: setup } = await supabase.from("setups").select("id, user_id, file_url").eq("id", setupId).single();
  if (!setup || setup.user_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase.from("setups").delete().eq("id", setupId);
  if (error) {
    console.error("deleteSetup failed:", error.message);
    return { error: GENERIC_ERROR };
  }

  // Best-effort: remove the orphaned storage object so deleted setups don't
  // leave files behind forever. Uses admin client (bucket may be private).
  const path = storagePathFromUrl(setup.file_url, "setups");
  if (path && process.env.SUPABASE_SECRET_KEY) {
    const admin = createAdminClient();
    await admin.storage.from("setups").remove([path]).catch(() => {});
  }

  await revokeXp(setup.user_id, "setup_create", setupId);

  revalidatePath("/assetti");
  revalidatePath("/");
  return {};
}

// Extracts the storage object path from a Supabase public/sign URL for a bucket.
// e.g. https://x.supabase.co/storage/v1/object/public/setups/uid/file.zip -> uid/file.zip
function storagePathFromUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null;
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

export async function voteSetup(setupId: string, value: 1 | -1 | 0) {
  // Runtime guard: the TS union is compile-time only; a direct call could
  // pass any number. Reject anything outside {1, 0, -1}.
  if (![1, 0, -1].includes(value)) return { error: "Voto non valido" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  if (value === 0) {
    await supabase.from("setup_votes").delete().eq("setup_id", setupId).eq("user_id", user.id);
    await revokeXp(user.id, "like_given", `${setupId}:${user.id}`);
    const { data: setupRow } = await supabase
      .from("setups")
      .select("user_id")
      .eq("id", setupId)
      .single();
    if (setupRow?.user_id && setupRow.user_id !== user.id) {
      await revokeXp(setupRow.user_id, "like_received", `${setupId}:${user.id}`);
    }
  } else {
    await supabase.from("setup_votes").upsert(
      { setup_id: setupId, user_id: user.id, value },
      { onConflict: "setup_id,user_id" }
    );
    if (value === -1) {
      await revokeXp(user.id, "like_given", `${setupId}:${user.id}`);
      const { data: setupRow } = await supabase
        .from("setups")
        .select("user_id")
        .eq("id", setupId)
        .single();
      if (setupRow?.user_id && setupRow.user_id !== user.id) {
        await revokeXp(setupRow.user_id, "like_received", `${setupId}:${user.id}`);
      }
    }
  }

  if (value === 1) {
    await awardXp(user.id, "like_given", `${setupId}:${user.id}`);
    const { data: setupRow } = await supabase
      .from("setups")
      .select("user_id")
      .eq("id", setupId)
      .single();
    if (setupRow?.user_id && setupRow.user_id !== user.id) {
      await awardXp(setupRow.user_id, "like_received", `${setupId}:${user.id}`);
    }
  }

  const { data: votes } = await supabase.from("setup_votes").select("value").eq("setup_id", setupId);
  const sum = (votes || []).reduce((a, v) => a + v.value, 0);
  const count = votes?.length || 0;
  await supabase.from("setups").update({ rating_sum: sum, rating_count: count }).eq("id", setupId);
  revalidatePath(`/assetti/${setupId}`);
  return { ok: true };
}

export async function incrementDownload(setupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  // Atomic server-side increment (no read-modify-write race). Defined in
  // supabase/security_migration.sql as increment_download(uuid).
  const { error } = await supabase.rpc("increment_download", { p_setup_id: setupId });
  if (error) {
    console.error("incrementDownload failed:", error.message);
    return { error: GENERIC_ERROR };
  }
  return { ok: true };
}
