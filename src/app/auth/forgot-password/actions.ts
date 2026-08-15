"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimitByIp, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

/**
 * Invio email di reset con rate limit per IP (3/min).
 * Ritorna sempre lo stesso esito a prescindere dall'esistenza dell'email
 * (no user enumeration): l'unico errore possibile e' il rate limit.
 */
export async function requestPasswordReset(
  email: string,
  redirectTo: string,
): Promise<{ error?: string }> {
  if (!(await rateLimitByIp("forgot_password"))) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  const supabase = await createClient();
  // Non controlliamo l'esito: un fallimento non deve rivelare nulla.
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return {};
}
