"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSetupRecord } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";
import { ImageIcon, Upload } from "lucide-react";

const ALLOWED_EXT = ["json", "sto", "svm", "ini", "rcd", "txt", "xml", "zip"];

export default function CaricaAssettoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Foto max 5MB."); e.target.value = ""; return; }
    setError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Non autorizzato."); setUploadingPhoto(false); return; }

    const ext = file.name.split(".").pop();
    const path = `photos/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("setups").upload(path, file, { upsert: false });
    if (upErr) { setError("Errore upload foto: " + upErr.message); setUploadingPhoto(false); return; }

    const { data: urlData } = supabase.storage.from("setups").getPublicUrl(path);
    setPhotoUrl(`${urlData.publicUrl}?v=${Date.now()}`);
    setUploadingPhoto(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const title = (form.querySelector('[name="title"]') as HTMLInputElement).value.trim();
    const game = (form.querySelector('[name="game"]') as HTMLSelectElement).value;
    const car = (form.querySelector('[name="car"]') as HTMLInputElement).value.trim();
    const track = (form.querySelector('[name="track"]') as HTMLInputElement).value.trim();
    const conditions = (form.querySelector('[name="conditions"]') as HTMLInputElement).value.trim();
    const notes = (form.querySelector('[name="notes"]') as HTMLTextAreaElement).value.trim();
    const fileInput = form.querySelector('[name="file"]') as HTMLInputElement;
    const setupFile = fileInput?.files?.[0] ?? null;

    if (!title || !game || !car || !track) {
      setError("Compila tutti i campi obbligatori.");
      setLoading(false);
      return;
    }

    let file_url: string | null = null;

    if (setupFile && setupFile.size > 0) {
      if (setupFile.size > 5 * 1024 * 1024) { setError("File assetto max 5MB."); setLoading(false); return; }
      const ext = setupFile.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXT.includes(ext)) { setError(`Estensione non supportata: .${ext}`); setLoading(false); return; }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Devi essere autenticato."); setLoading(false); return; }

      const path = `${user.id}/${Date.now()}-${setupFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("setups").upload(path, setupFile, { upsert: false });
      if (upErr) { setError(`Errore upload file: ${upErr.message}`); setLoading(false); return; }
      file_url = supabase.storage.from("setups").getPublicUrl(path).data.publicUrl;
    }

    const fd = new FormData();
    fd.set("title", title);
    fd.set("game", game);
    fd.set("car", car);
    fd.set("track", track);
    fd.set("conditions", conditions);
    fd.set("notes", notes);
    if (file_url) fd.set("file_url", file_url);
    if (photoUrl) fd.set("photo_url", photoUrl);

    let res: { error?: string; id?: string };
    try {
      res = await createSetupRecord(fd);
    } catch (err) {
      setError(`Eccezione: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
      return;
    }

    if (res.error || !res.id) { setError(res.error || "Errore sconosciuto. Riprova."); setLoading(false); return; }

    router.push(`/assetti/${res.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Carica assetto</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required placeholder="es. Monza GT3 asciutto - quali" />
            </div>

            <div>
              <Label htmlFor="game">Gioco *</Label>
              <Select id="game" name="game" required defaultValue="">
                <option value="" disabled>Seleziona...</option>
                {GAMES.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="car">Auto *</Label>
                <Input id="car" name="car" required placeholder="es. Ferrari 296 GT3" />
              </div>
              <div>
                <Label htmlFor="track">Tracciato *</Label>
                <Input id="track" name="track" required placeholder="es. Monza" />
              </div>
            </div>

            <div>
              <Label htmlFor="conditions">Condizioni</Label>
              <Input id="conditions" name="conditions" placeholder="es. Asciutto 25°C - qualifying" />
            </div>

            <div>
              <Label htmlFor="file">File assetto (opzionale)</Label>
              <Input id="file" name="file" type="file" accept=".json,.sto,.svm,.ini,.rcd,.txt,.xml,.zip" />
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">.json (ACC), .sto (rF2/LMU), .svm, .ini, .rcd, .xml, .zip · max 5MB</p>
            </div>

            <div>
              <Label htmlFor="notes">Note / configurazione</Label>
              <Textarea id="notes" name="notes" rows={6} placeholder="Stile guida, settaggi consigliati, FFB, TC/ABS..." />
            </div>

            {/* FOTO */}
            <div>
              <Label>Foto assetto (opzionale)</Label>
              <div className="mt-2 flex items-center gap-4">
                <div
                  onClick={() => photoRef.current?.click()}
                  className="h-24 w-40 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden shrink-0"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-[var(--color-fg-muted)]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}>
                    <Upload className="h-4 w-4" /> {uploadingPhoto ? "Caricamento..." : "Carica foto"}
                  </Button>
                  {photoPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setPhotoPreview(null); setPhotoUrl(null); if (photoRef.current) photoRef.current.value = ""; }}>
                      Rimuovi
                    </Button>
                  )}
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading || uploadingPhoto}>
              {loading ? "Pubblicazione..." : "Pubblica assetto"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
