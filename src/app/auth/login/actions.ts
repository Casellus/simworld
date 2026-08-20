"use server";

import { rateLimitByIp, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

/**
 * Pre-check del rate limit per IP (5/min) prima del login.
 * Il signInWithPassword resta lato client (browser Supabase client), cosi'
 * la sessione viene sincronizzata nel browser e onAuthStateChange scatta —
 * un login via server action lascerebbe il client browser senza sessione
 * fino a un reload completo (campanella notifiche non si attiva).
 */
export async function checkLoginAllowed(): Promise<{ error?: string }> {
  if (!(await rateLimitByIp("login"))) {
    return { error: RATE_LIMITED_MESSAGE };
  }
  return {};
}
