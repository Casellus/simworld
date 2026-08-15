"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimitByIp, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

/**
 * Login con rate limit per IP (5/min) davanti a Supabase Auth.
 * Il messaggio d'errore e' volutamente generico: non distingue tra
 * email inesistente e password errata (no user enumeration).
 */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ error?: string }> {
  if (!(await rateLimitByIp("login"))) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("login failed:", error.message);
    return { error: "Email o password non corretti." };
  }
  return {};
}
