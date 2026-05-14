"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";

const ALLOWED_SETUP_EXT = ["json", "sto", "svm", "ini", "rcd", "txt", "xml", "zip"];
const ALLOWED_IMG_EXT = ["png", "jpg", "jpeg", "webp"];

export default function CaricaAssettoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = (fd.get("title") as string).trim();
    const game_slug = fd.get("game") as string;
    const car = (fd.get("car") as string).trim();
    const track = (fd.get("track") as string).trim();
    const conditions = (fd.get("conditions") as string | null)?.trim() || null;
    const notes = (fd.get("notes") as string | null)?.trim() || null;
    const setupFile = fd.get("file") as File | null;
    const imgFile = fd.get("preview_img") as File | null;

    if (!title || !game_slug || !car || !track) {
      setError("Compila tutti i campi obbligatori.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Devi essere loggato."); setLoading(false); return; }

    const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (!game) { setError("Gioco non valido."); setLoading(false); return; }

    // upload file assetto
    let file_url: string | null = null;
    if (setupFile && setupFile.size > 0) {
      if (setupFile.size > 5 * 1024 * 1024) { setError("File assetto max 5MB."); setLoading(false); return; }
      const ext = setupFile.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_SETUP_EXT.includes(ext)) { setError(`Estensione non supportata: .${ext}`); setLoading(false); return; }
      const path = `${user.id}/${Date.now()}-${setupFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("setups").upload(path, setupFile, { upsert: false });
      if (upErr) { setError(`Errore upload file: ${upErr.message}`); setLoading(false); return; }
      file_url = supabase.storage.from("setups").getPublicUrl(path).data.publicUrl;
    }

    // upload immagine preview
    let preview_url: string | null = null;
    if (imgFile && imgFile.size > 0) {
      if (imgFile.size > 5 * 1024 * 1024) { setError("Immagine max 5MB."); setLoading(false); return; }
      const ext = imgFile.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_IMG_EXT.includes(ext)) { setError(`Formato immagine non supportato: .${ext}`); setLoading(false); return; }
      const path = `${user.id}/preview-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("setups").upload(path, imgFile, { upsert: false });
      if (upErr) { setError(`Errore upload immagine: ${upErr.message}`); setLoading(false); return; }
      preview_url = supabase.storage.from("setups").getPublicUrl(path).data.publicUrl;
    }

    const { data: created, error: dbErr } = await supabase
      .from("setups")
      .insert({ user_id: user.id, game_id: game.id, title, car, track, conditions, notes, file_url, preview_url })
      .select("id")
      .single();

    if (dbErr) { setError(dbErr.message); setLoading(false); return; }

    router.push(`/assetti/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Carica assetto</h1>
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
              <Label htmlFor="preview_img">Immagine preview (opzionale)</Label>
              <Input id="preview_img" name="preview_img" type="file" accept=".png,.jpg,.jpeg,.webp" />
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">PNG, JPG, JPEG, WEBP · max 5MB</p>
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

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Pubblicazione..." : "Pubblica assetto"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
