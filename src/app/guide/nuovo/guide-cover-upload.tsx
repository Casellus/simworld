"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IMAGE_ACCEPT, validateImageFile, safeImageExt } from "@/lib/upload";
import { ImageIcon, Upload, X } from "lucide-react";

// Upload copertina guida su storage (bucket event-banners, gia' esistente e
// pubblico). L'URL finisce in un hidden input "cover_url" letto dal server action.
export function GuideCoverUpload({ defaultUrl = "" }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const imgErr = validateImageFile(file);
    if (imgErr) { setError(imgErr); e.target.value = ""; return; }
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Non autorizzato."); setUploading(false); return; }

    // Primo segmento = uid: richiesto dalla storage RLS (storage_insert_own_folder).
    const ext = safeImageExt(file.name);
    const path = `${user.id}/guide-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("event-banners").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setError("Errore durante il caricamento."); setUploading(false); return; }

    const { data: pub } = supabase.storage.from("event-banners").getPublicUrl(path);
    setUrl(`${pub.publicUrl}?v=${Date.now()}`);
    setUploading(false);
  }

  return (
    <div>
      <input type="hidden" name="cover_url" value={url} />
      <label
        className="relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-elev)] transition-colors hover:border-[var(--color-primary)]"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--color-fg-muted)]">
            <ImageIcon className="h-7 w-7" />
            <span className="text-sm">Carica copertina (opzionale)</span>
            <span className="text-xs opacity-70">Se vuota, usa la miniatura del video</span>
          </div>
        )}
        {preview && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <Upload className="h-3.5 w-3.5" /> {uploading ? "..." : "Cambia"}
          </span>
        )}
        <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={onChange} />
      </label>
      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); setUrl(""); }}
          className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
        >
          <X className="h-3.5 w-3.5" /> Rimuovi copertina
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
