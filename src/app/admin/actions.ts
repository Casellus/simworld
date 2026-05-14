"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "samuelcasella06@gmail.com";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(user.id);
  if (data?.user?.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function adminDeleteSetup(id: string): Promise<{ error?: string }> {
  const user = await requireAdmin();
  if (!user) return { error: "Non autorizzato" };
  const supabase = await createClient();
  const { error } = await supabase.from("setups").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/assetti");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}

export async function adminDeleteEvent(id: string): Promise<{ error?: string }> {
  const user = await requireAdmin();
  if (!user) return { error: "Non autorizzato" };
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/eventi");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}

export async function adminDeleteTeam(id: string): Promise<{ error?: string }> {
  const user = await requireAdmin();
  if (!user) return { error: "Non autorizzato" };
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/team");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}

export async function adminDeletePost(id: string): Promise<{ error?: string }> {
  const user = await requireAdmin();
  if (!user) return { error: "Non autorizzato" };
  const supabase = await createClient();
  const { error } = await supabase.from("recruitment_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/cerca");
  revalidatePath("/admin");
  revalidatePath("/");
  return {};
}
