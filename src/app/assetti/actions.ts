"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ALLOWED_EXT = ["json", "sto", "svm", "ini", "svm", "rcd", "txt", "xml", "zip"];
export async function createSetupRecord(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorizzato" };

    const setup_type = (formData.get("setup_type") as string || "auto").trim() as "auto" | "simulatore";
    const title      = (formData.get("title") as string || "").trim();
    const game_slug  = formData.get("game") as string;
    const car        = (formData.get("car") as string || "").trim() || null;
    const track      = (formData.get("track") as string || "").trim() || null;
    const conditions = (formData.get("conditions") as string || "").trim() || null;
    const category   = (formData.get("category") as string || "").trim() || null;
    const notes      = (formData.get("notes") as string || "").trim() || null;
    const file_url   = (formData.get("file_url") as string || "") || null;
    const photo_url  = (formData.get("photo_url") as string || "") || null;

    if (!title || !game_slug) return { error: "Campi obbligatori mancanti." };
    if (setup_type === "auto" && (!car || !track)) return { error: "Auto e tracciato sono obbligatori." };

    const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (!game) return { error: "Gioco non valido." };

    const { data: created, error: dbErr } = await supabase
      .from("setups")
      .insert({ user_id: user.id, game_id: game.id, setup_type, title, car, track, conditions, category, notes, file_url, photo_url })
      .select("id")
      .single();

    if (dbErr) return { error: dbErr.message };
    if (!created?.id) return { error: "Inserimento non riuscito." };

    revalidatePath("/assetti");
    revalidatePath("/");
    return { id: created.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore sconosciuto";
    return { error: `Errore server: ${msg}` };
  }
}

export async function uploadSetupFull(formData: FormData): Promise<{ error?: string; id?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorizzato" };

    const title = (formData.get("title") as string || "").trim();
    const game_slug = formData.get("game") as string;
    const car = (formData.get("car") as string || "").trim();
    const track = (formData.get("track") as string || "").trim();
    const conditions = (formData.get("conditions") as string || "").trim() || null;
    const notes = (formData.get("notes") as string || "").trim() || null;
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

    if (dbErr) return { error: dbErr.message };
    if (!created?.id) return { error: "Inserimento non riuscito." };

    revalidatePath("/assetti");
    revalidatePath("/");
    return { id: created.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore sconosciuto";
    return { error: `Errore server: ${msg}` };
  }
}

export async function uploadSetup(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autorizzato");

  const title = String(formData.get("title") || "").trim();
  const game_slug = String(formData.get("game") || "");
  const car = String(formData.get("car") || "").trim();
  const track = String(formData.get("track") || "").trim();
  const conditions = String(formData.get("conditions") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
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
    if (upErr) throw new Error(`Upload fallito: ${upErr.message}`);
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

  if (error) throw new Error(error.message);

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

  const title      = String(formData.get("title") || "").trim();
  const car        = String(formData.get("car") || "").trim() || null;
  const track      = String(formData.get("track") || "").trim() || null;
  const conditions = String(formData.get("conditions") || "").trim() || null;
  const category   = String(formData.get("category") || "").trim() || null;
  const notes      = String(formData.get("notes") || "").trim() || null;
  const photo_url  = String(formData.get("photo_url") || "").trim() || null;

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (setup_type === "auto" && (!car || !track)) return { error: "Auto e tracciato sono obbligatori." };

  const { error } = await supabase
    .from("setups")
    .update({ title, car, track, conditions, category, notes: notes || null, photo_url })
    .eq("id", setupId);

  if (error) return { error: error.message };
  revalidatePath(`/assetti/${setupId}`);
  revalidatePath("/assetti");
  return {};
}

export async function deleteSetup(setupId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const { data: setup } = await supabase.from("setups").select("id, user_id").eq("id", setupId).single();
  if (!setup || setup.user_id !== user.id) return { error: "Non autorizzato" };

  const { error } = await supabase.from("setups").delete().eq("id", setupId);
  if (error) return { error: error.message };

  revalidatePath("/assetti");
  revalidatePath("/");
  return {};
}

export async function voteSetup(setupId: string, value: 1 | -1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  await supabase.from("setup_votes").upsert(
    { setup_id: setupId, user_id: user.id, value },
    { onConflict: "setup_id,user_id" }
  );

  const { data: votes } = await supabase.from("setup_votes").select("value").eq("setup_id", setupId);
  const sum = (votes || []).reduce((a, v) => a + v.value, 0);
  const count = votes?.length || 0;
  await supabase.from("setups").update({ rating_sum: sum, rating_count: count }).eq("id", setupId);
  revalidatePath(`/assetti/${setupId}`);
  return { ok: true };
}

export async function incrementDownload(setupId: string) {
  const supabase = await createClient();
  const { data: s } = await supabase.from("setups").select("downloads").eq("id", setupId).single();
  if (s) await supabase.from("setups").update({ downloads: (s.downloads || 0) + 1 }).eq("id", setupId);
}
