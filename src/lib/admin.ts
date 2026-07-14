import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

// Normalize an email for comparison: lowercase + trim.
// Gmail dot/plus tricks are intentionally NOT collapsed here — the allowlist
// must contain the exact address(es) Supabase stores.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Admin identity comes from env (ADMIN_EMAILS, comma-separated) instead of a
// hardcoded address in source. RBAC via app_metadata.role === "admin" is also
// honored so we can move off email checks entirely over time.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function isAdminUser(user: Pick<User, "email" | "app_metadata"> | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === "admin") return true;
  const email = user.email ? normalizeEmail(user.email) : "";
  return !!email && adminEmails().includes(email);
}

/**
 * Verifies the current session belongs to an admin.
 * Uses getUser() (network-verified) + the service-role client to read the
 * authoritative email/metadata, so a forged JWT claim can't grant admin.
 * Returns the user on success, null otherwise.
 */
export async function requireAdmin(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(user.id);
  if (!isAdminUser(data?.user)) return null;
  return data.user;
}
