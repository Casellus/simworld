"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES, EVENT_TYPES } from "@/lib/constants";
import { Image as ImageIcon } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function NuovoEventoPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Immagine max 5 MB."); e.target.value = ""; return; }
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Accedi prima."); setLoading(false); return; }

    const title = String(fd.get("title") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const game_slug = String(fd.get("game") || "");
    const event_type = String(fd.get("event_type") || "");
    const track = String(fd.get("track") || "").trim();
    const car_class = String(fd.get("car_class") || "").trim();
    const start_at = String(fd.get("start_at") || "");
    const max_participants = Number(fd.get("max_participants") || 0) || null;
    const format = String(fd.get("format") || "").trim();

    if (!title || !start_at || !game_slug || !event_type) {
      setError("Compila i campi obbligatori.");
      setLoading(false);
      return;
    }

    const { data: game } = await supabase.from("games").select("id").eq("slug", game_slug).single();
    if (!game) { setError("Gioco non valido."); setLoading(false); return; }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let i = 0;
    while (true) {
      const { data } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      i++;
      slug = `${baseSlug}-${i}`;
    }

    // upload banner
    let banner_url: string | null = null;
    const bannerFile = fileRef.current?.files?.[0];
    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      const path = `${user.id}/${slug}.${ext}`;
      const { error: upErr } = await supabase.storage.from("event-banners").upload(path, bannerFile, { upsert: true });
      if (upErr) { setError("Errore upload banner: " + upErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
      banner_url = urlData.publicUrl;
    }

    const { data: created, error: evErr } = await supabase
      .from("events")
      .insert({
        slug, title, description: description || null,
        host_user_id: user.id, game_id: game.id, event_type,
        track: track || null, car_class: car_class || null,
        start_at, max_participants, format: format || null,
        banner_url,
      })
      .select("slug")
      .single();

    if (evErr) { setError(evErr.message); setLoading(false); return; }

    router.push(`/eventi/${created.slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Crea evento</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* BANNER */}
            <div>
              <Label>Banner evento (opzionale, max 5 MB)</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full h-40 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="banner preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-[var(--color-fg-muted)]">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <span className="text-sm">Clicca per aggiungere un banner</span>
                  </div>
                )}
              </div>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1"
                  onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                >
                  Rimuovi
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required placeholder="es. Coppa Italia ACC — Tappa 1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="game">Gioco *</Label>
                <Select id="game" name="game" required defaultValue="">
                  <option value="" disabled>Seleziona...</option>
                  {GAMES.map((g) => (
                    <option key={g.slug} value={g.slug}>{g.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="event_type">Tipo *</Label>
                <Select id="event_type" name="event_type" required defaultValue="">
                  <option value="" disabled>Seleziona...</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="start_at">Data e ora inizio *</Label>
              <Input id="start_at" name="start_at" type="datetime-local" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="track">Tracciato</Label>
                <Input id="track" name="track" placeholder="es. Monza" />
              </div>
              <div>
                <Label htmlFor="car_class">Categoria auto</Label>
                <Input id="car_class" name="car_class" placeholder="es. GT3, LMP2..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Formato</Label>
                <Input id="format" name="format" placeholder="es. Q15 + R45 min" />
              </div>
              <div>
                <Label htmlFor="max_participants">Max partecipanti</Label>
                <Input id="max_participants" name="max_participants" type="number" min={2} max={500} />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" rows={5} placeholder="Regolamento, requisiti, contatti..." />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creazione..." : "Crea evento"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
