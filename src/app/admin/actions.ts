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
