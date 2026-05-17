import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// React cache() deduplicates these within a single server render pass:
// Header + page no longer each round-trip to Supabase auth.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login");
  return profile;
}
