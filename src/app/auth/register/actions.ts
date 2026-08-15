"use server";

import { rateLimitByIp, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

// Il signUp resta client (serve il flusso di conferma email nel browser),
// ma prima passiamo da qui per un gate per IP: 3 registrazioni/ora impedisce
// la creazione di account di massa.
export async function checkRegisterAllowed(): Promise<{ error?: string }> {
  if (!(await rateLimitByIp("register"))) {
    return { error: RATE_LIMITED_MESSAGE };
  }
  return {};
}
