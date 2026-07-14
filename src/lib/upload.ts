// Client-side image validation shared by upload forms.
// This is defense-in-depth / UX — the authoritative enforcement is the
// Supabase Storage bucket MIME/size restrictions + RLS (see
// supabase/security_migration.sql). SVG is intentionally excluded because it
// can carry executable <script> (stored XSS).

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export const ALLOWED_IMAGE_EXT = ["png", "jpg", "jpeg", "webp", "gif"] as const;
const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function imageExt(fileName: string): string {
  return (fileName.split(".").pop() ?? "").toLowerCase();
}

/**
 * Returns an error string if the file is not an allowed image, else null.
 * Checks extension, declared MIME type, and size.
 */
export function validateImageFile(file: File): string | null {
  const ext = imageExt(file.name);
  if (!ALLOWED_IMAGE_EXT.includes(ext as (typeof ALLOWED_IMAGE_EXT)[number])) {
    return "Formato immagine non supportato. Usa PNG, JPG, WEBP o GIF.";
  }
  if (file.type && !ALLOWED_IMAGE_MIME.includes(file.type as (typeof ALLOWED_IMAGE_MIME)[number])) {
    return "Tipo di file non valido.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Immagine troppo grande (max 5MB).";
  }
  return null;
}

/** Normalized, safe extension for building a storage path. */
export function safeImageExt(fileName: string): string {
  const ext = imageExt(fileName);
  return ALLOWED_IMAGE_EXT.includes(ext as (typeof ALLOWED_IMAGE_EXT)[number]) ? ext : "png";
}
