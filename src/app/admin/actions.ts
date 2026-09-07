"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";

// Admin deletes must bypass owner-scoped RLS, so they run through the
// service-role client — but ONLY after requireAdmin() confirms the caller.
async function adminDelete(
  table: string,
  id: string,
  paths: string[],
): Promise<{ error?: string }> {
  const user = await requireAdmin();
  if (!user) return { error: "Non autorizzato" };

  const admin = createAdminClient();
  const { error } = await admin.from(table).delete().eq("id", id);
  if (error) {
    console.error(`adminDelete ${table} failed:`, error.message);
    return { error: "Eliminazione non riuscita. Riprova più tardi." };
  }
  for (const p of paths) revalidatePath(p);
  return {};
}

export async function adminDeleteSetup(id: string) {
  return adminDelete("setups", id, ["/assetti", "/admin", "/"]);
}

export async function adminDeleteEvent(id: string) {
  return adminDelete("events", id, ["/eventi", "/admin", "/"]);
}

export async function adminDeleteTeam(id: string) {
  return adminDelete("teams", id, ["/team", "/admin", "/"]);
}

export async function adminDeletePost(id: string) {
  return adminDelete("recruitment_posts", id, ["/cerca", "/admin", "/"]);
}

export async function adminDeleteGuide(id: string) {
  return adminDelete("guides", id, ["/guide", "/admin", "/"]);
}

// Assegna/revoca il ruolo creator (can_write_guides) a un utente.
// Service-role: bypassa la RLS che permette a un profilo di modificare solo se stesso.
export async function adminSetGuideWriter(
  userId: string,
  value: boolean,
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Non autorizzato" };

  const client = createAdminClient();
  const { error } = await client
    .from("profiles")
    .update({ can_write_guides: value })
    .eq("id", userId);
  if (error) {
    console.error("adminSetGuideWriter failed:", error.message);
    return { error: "Operazione non riuscita. Riprova più tardi." };
  }
  revalidatePath("/admin");
  return {};
}

// Autorizza un utente come creator cercandolo per username (case-insensitive).
export async function adminSetGuideWriterByUsername(
  username: string,
): Promise<{ error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Non autorizzato" };

  const uname = username.trim().toLowerCase().replace(/^@/, "");
  if (!uname) return { error: "Inserisci uno username." };

  const client = createAdminClient();
  const { data: profile, error: findErr } = await client
    .from("profiles")
    .select("id, can_write_guides")
    .ilike("username", uname)
    .maybeSingle();
  if (findErr) {
    console.error("adminSetGuideWriterByUsername lookup failed:", findErr.message);
    return { error: "Operazione non riuscita. Riprova più tardi." };
  }
  if (!profile) return { error: `Nessun utente con username "${uname}".` };
  if (profile.can_write_guides) return { error: "Questo utente è già un creator." };

  const { error } = await client
    .from("profiles")
    .update({ can_write_guides: true })
    .eq("id", profile.id);
  if (error) {
    console.error("adminSetGuideWriterByUsername update failed:", error.message);
    return { error: "Operazione non riuscita. Riprova più tardi." };
  }
  revalidatePath("/admin");
  return {};
}
