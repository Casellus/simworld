"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";
import { updateSetup } from "../../actions";
import { ImageIcon, Upload } from "lucide-react";

type Setup = {
  id: string;
  user_id: string;
  title: string;
  car: string;
  track: string;
  conditions: string | null;
  notes: string | null;
  photo_url: string | null;
  game_slug: string;
};

export default function ModificaAssettoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("setups")
        .select("id, user_id, title, car, track, conditions, notes, photo_url, games(slug)")
        .eq("id", params.id)
        .single();

      if (!data || data.user_id !== user.id) { router.push("/assetti"); return; }

      const gameSlug = Array.isArray(data.games)
        ? (data.games[0] as { slug: string })?.slug ?? ""
        : (data.games as { slug: string } | null)?.slug ?? "";

      setSetup({ ...data, game_slug: gameSlug });
      setPhotoPreview(data.photo_url);
      setPhotoUrl(data.photo_url);
      setFetching(false);
    }
    load();
  }, [params.id, router]);

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
    if (!setup) return;
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("photo_url", photoUrl ?? "");
    const res = await updateSetup(setup.id, fd);
    if (res.error) { setError(res.error); setLoading(false); return; }
    router.push(`/assetti/${setup.id}`);
  }

  if (fetching) return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 text-[var(--color-fg-muted)]">Caricamento...</div>;
  if (!setup) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Modifica assetto</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input id="title" name="title" required defaultValue={setup.title} />
            </div>

            <div>
              <Label htmlFor="game">Gioco</Label>
              <Select id="game" name="game" defaultValue={setup.game_slug} disabled>
                {GAMES.map((g) => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </Select>
              <p className="text-xs text-[var(--color-fg-muted)] mt-1">Il gioco non può essere modificato.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="car">Auto *</Label>
                <Input id="car" name="car" required defaultValue={setup.car} />
              </div>
              <div>
                <Label htmlFor="track">Tracciato *</Label>
                <Input id="track" name="track" required defaultValue={setup.track} />
              </div>
            </div>

            <div>
              <Label htmlFor="conditions">Condizioni</Label>
              <Input id="conditions" name="conditions" defaultValue={setup.conditions ?? ""} />
            </div>

            <div>
              <Label htmlFor="notes">Note / configurazione</Label>
              <Textarea id="notes" name="notes" rows={6} defaultValue={setup.notes ?? ""} />
            </div>

            {/* FOTO */}
            <div>
              <Label>Foto assetto</Label>
              <div className="mt-2 flex items-center gap-4">
                <div
                  onClick={() => photoRef.current?.click()}
                  className="h-24 w-40 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden shrink-0"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-[var(--color-fg-muted)]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}>
                    <Upload className="h-4 w-4" /> {uploadingPhoto ? "Caricamento..." : photoPreview ? "Cambia foto" : "Carica foto"}
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1" disabled={loading || uploadingPhoto}>
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
