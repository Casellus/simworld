"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { EVENT_TYPES } from "@/lib/constants";
import { Image as ImageIcon } from "lucide-react";
import { updateEvent } from "../../actions";

type Event = {
  id: string;
  host_user_id: string;
  title: string;
  event_type: string;
  track: string | null;
  car_class: string | null;
  start_at: string;
  max_participants: number | null;
  format: string | null;
  description: string | null;
  banner_url: string | null;
};

export default function ModificaEventoPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("events")
        .select("id, host_user_id, title, event_type, track, car_class, start_at, max_participants, format, description, banner_url")
        .eq("slug", params.slug)
        .single();

      if (!data || data.host_user_id !== user.id) { router.push("/eventi"); return; }

      setEvent(data);
      setPreview(data.banner_url);
      setFetching(false);
    }
    load();
  }, [params.slug, router]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Immagine max 5 MB."); e.target.value = ""; return; }
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!event) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    // gestione banner: nuovo upload, rimozione, o invariato
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const bannerFile = fileRef.current?.files?.[0];

    if (bannerFile && user) {
      const ext = bannerFile.name.split(".").pop();
      const path = `${user.id}/${params.slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("event-banners").upload(path, bannerFile, { upsert: true });
      if (upErr) { setError("Errore upload banner: " + upErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("event-banners").getPublicUrl(path);
      fd.set("banner_url", urlData.publicUrl);
    } else if (removed) {
      fd.set("banner_url", "");
    }
    // se nessuna delle due → non setto banner_url, updateEvent lascia invariato

    const res = await updateEvent(event.id, fd);
    if (res.error) { setError(res.error); setLoading(false); return; }
    router.push(`/eventi/${params.slug}`);
  }

  if (fetching) return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 text-[var(--color-fg-muted)]">Caricamento...</div>;
  if (!event) return null;

  // datetime-local needs format: "YYYY-MM-DDTHH:mm"
  const startLocal = event.start_at ? event.start_at.slice(0, 16) : "";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Modifica evento</h1>
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
                  onClick={() => {
                    setPreview(null);
                    setRemoved(true);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  Rimuovi
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required defaultValue={event.title} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_type">Tipo *</Label>
                <Select id="event_type" name="event_type" required defaultValue={event.event_type}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="start_at">Data e ora inizio *</Label>
                <Input id="start_at" name="start_at" type="datetime-local" required defaultValue={startLocal} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="track">Tracciato</Label>
                <Input id="track" name="track" defaultValue={event.track ?? ""} placeholder="es. Monza" />
              </div>
              <div>
                <Label htmlFor="car_class">Categoria auto</Label>
                <Input id="car_class" name="car_class" defaultValue={event.car_class ?? ""} placeholder="es. GT3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Formato</Label>
                <Input id="format" name="format" defaultValue={event.format ?? ""} placeholder="es. Q15 + R45 min" />
              </div>
              <div>
                <Label htmlFor="max_participants">Max partecipanti</Label>
                <Input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  min={2}
                  max={500}
                  defaultValue={event.max_participants ?? ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" rows={5} defaultValue={event.description ?? ""} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                {loading ? "Salvataggio..." : "Salva modifiche"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
                Annulla
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
