"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkEmailExists(email: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return !!data;
}
