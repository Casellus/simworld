// Shared server-side input validation helpers.
// Keep these dependency-free so they can be imported by any server action.

export const LIMITS = {
  title: 140,
  name: 80,
  username: 30,
  short: 200,
  contact: 200,
  description: 5000,
  bio: 2000,
  notes: 10000,
  hardware: 500,
  handle: 100,
  message: 2000,
} as const;

/** Trim and hard-cap a text field. Empty string -> null when allowNull. */
export function text(value: FormDataEntryValue | null, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export function textOrNull(value: FormDataEntryValue | null, max: number): string | null {
  const t = text(value, max);
  return t || null;
}

/** Returns value only if present in the allowed set, else null. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/**
 * Validates a user-supplied URL is safe to store/render.
 * Allows only https to the Supabase storage host (or an explicit allowlist),
 * plus http(s) generic links where noted. Rejects javascript:, data:, etc.
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSupabaseStorageUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (base) {
      const host = new URL(base).host;
      return u.host === host;
    }
    return u.host.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

/** Sanitizes a stored URL field: keep only Supabase storage URLs, else null. */
export function storageUrlOrNull(value: FormDataEntryValue | null): string | null {
  const v = String(value ?? "").trim();
  if (!v) return null;
  return isSupabaseStorageUrl(v) ? v : null;
}

/** Escapes a string for safe interpolation into HTML (emails, etc). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Generic message returned to clients instead of raw DB/infra errors. */
export const GENERIC_ERROR = "Operazione non riuscita. Riprova più tardi.";

/**
 * Escapes LIKE/ILIKE wildcards so user input is matched literally.
 * Without this a query of "%" matches every row and "_" matches any char.
 * PostgREST additionally rewrites "*" to "%" in like/ilike patterns, so "*"
 * is stripped rather than escaped (a backslash would not survive that rewrite).
 */
export function escapeLike(value: string): string {
  return value.replace(/\*/g, "").replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Builds a safe `%term%` pattern for .ilike(), capped in length. */
export function likePattern(value: string, max = 100): string {
  return `%${escapeLike(value.trim().slice(0, max))}%`;
}
