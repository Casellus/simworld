import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

// Limiti per bucket: [max richieste, finestra in secondi].
// Allineati alle raccomandazioni dell'audit (H1).
export const RATE_LIMITS = {
  login: [5, 60], // 5/min per IP
  register: [3, 3600], // 3/ora per IP (anti account di massa)
  forgot_password: [3, 60], // 3/min per IP (l'email e' l'oracolo, l'IP il gate)
  upload: [10, 60], // 10/min per utente
  download: [30, 60], // 30/min per utente
  write: [20, 60], // create generici (setup/evento/team/post) per utente
} as const;

type Bucket = keyof typeof RATE_LIMITS;

/** IP del client dietro il proxy Vercel. Fallback su "unknown". */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Ritorna true se la richiesta e' entro il limite, false se va bloccata.
 * Usa il client service_role: funziona anche per flussi anonimi (login).
 * Fail-open: se la RPC fallisce (DB giu'), NON blocca l'utente legittimo —
 * il rate limit e' una difesa, non deve diventare un self-DoS.
 */
export async function rateLimit(bucket: Bucket, identifier: string): Promise<boolean> {
  const [max, windowSecs] = RATE_LIMITS[bucket];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_bucket: bucket,
      p_identifier: identifier,
      p_max: max,
      p_window_secs: windowSecs,
    });
    if (error) {
      console.error("rateLimit rpc error:", bucket, error.message);
      return true; // fail-open
    }
    return data === true;
  } catch (e) {
    console.error("rateLimit threw:", e);
    return true; // fail-open
  }
}

/** Come rateLimit ma usando l'IP del client come identificatore. */
export async function rateLimitByIp(bucket: Bucket): Promise<boolean> {
  return rateLimit(bucket, await clientIp());
}

/** Messaggio uniforme quando il limite e' superato. */
export const RATE_LIMITED_MESSAGE =
  "Troppi tentativi. Attendi qualche istante e riprova.";
