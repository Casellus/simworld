"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ALLOWED_EXT = ["json", "sto", "svm", "ini", "svm", "rcd", "txt", "xml", "zip"];
const ALLOWED_IMG_EXT = ["png", "jpg", "jpeg", "webp"];

export async function uploadSetupFull(formData: FormData): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorizzato" };

  const title = (formData.get("title") as string || "").trim();
  const game_slug = formData.get("game") as string;
  const car = (formData.get("car") as string || "").trim();
  const track = (formData.get("track") as string || "").trim();
  const conditions = (formData.get("conditions") as string || "").trim() || null;
  const notes = (formData.get("notes") as string || "").trim() || null;
  const setupFile = formData.get("file") as File | null;
  const imgFile = formData.get("preview_img") as File | null;

  if (!title || !game_slug || !car || !track) return { error: "Campi obbligatori mancanti." };

  const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
  if (!game) return { error: "Gioco non valido." };

  let file_url: string | null = null;
  if (setupFile && setupFile.size > 0) {
    if (setupFile.size > 5 * 1024 * 1024) return { error: "File assetto max 5MB." };
    const ext = setupFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXT.includes(ext)) return { error: `Estensione non supportata: .${ext}` };
    const path = `${user.id}/${Date.now()}-${setupFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await admin.storage.from("setups").upload(path, setupFile, { upsert: false });
    if (upErr) return { error: `Errore upload file: ${upErr.message}` };
    file_url = admin.storage.from("setups").getPublicUrl(path).data.publicUrl;
  }

  let preview_url: string | null = null;
  if (imgFile && imgFile.size > 0) {
    if (imgFile.size > 5 * 1024 * 1024) return { error: "Immagine max 5MB." };
    const ext = imgFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_IMG_EXT.includes(ext)) return { error: `Formato non supportato: .${ext}` };
    const path = `${user.id}/preview-${Date.now()}.${ext}`;
    const { error: upErr } = await admin.storage.from("setups").upload(path, imgFile, { upsert: false });
    if (upErr) return { error: `Errore upload immagine: ${upErr.message}` };
    preview_url = admin.storage.from("setups").getPublicUrl(path).data.publicUrl;
  }

  const { data: created, error: dbErr } = await supabase
    .from("setups")
    .insert({ user_id: user.id, game_id: game.id, title, car, track, conditions, notes, file_url, preview_url })
    .select("id")
    .single();

  if (dbErr) return { error: dbErr.message };

  revalidatePath("/assetti");
  return { id: created.id };
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

  const title = String(formData.get("title") || "").trim();
  const car = String(formData.get("car") || "").trim();
  const track = String(formData.get("track") || "").trim();
  const conditions = String(formData.get("conditions") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!title || !car || !track) return { error: "Campi obbligatori mancanti." };

  const { error } = await supabase
    .from("setups")
    .update({ title, car, track, conditions: conditions || null, notes: notes || null })
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
