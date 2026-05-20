"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient as createClientBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";
import { Flag, Upload } from "lucide-react";
import { slugify } from "@/lib/utils";

export default function NuovoTeamPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [recruiting, setRecruiting] = useState(true);

  function toggleGame(slug: string) {
    setSelectedGames((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo max 2 MB.");
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClientBrowser();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Accedi prima."); setLoading(false); return; }

    const name = String(fd.get("name") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const recruiting = fd.get("recruiting") === "on";
    const gameSlugs = fd.getAll("games").map(String);

    if (!name) { setError("Nome obbligatorio."); setLoading(false); return; }

    // unique slug
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let i = 0;
    while (true) {
      const { data } = await supabase.from("teams").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      i++;
      slug = `${baseSlug}-${i}`;
    }

    // upload logo if provided
    let logo_url: string | null = null;
    const logoFile = fileRef.current?.files?.[0];
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const path = `${user.id}/${slug}.${ext}`;
      const { error: upErr } = await supabase.storage.from("Team-assets").upload(path, logoFile, { upsert: true });
      if (upErr) { setError("Errore upload logo: " + upErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("Team-assets").getPublicUrl(path);
      logo_url = urlData.publicUrl;
    }

    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .insert({ slug, name, description: description || null, owner_id: user.id, recruiting, logo_url })
      .select("id, slug")
      .single();

    if (teamErr) { setError(teamErr.message); setLoading(false); return; }

    if (gameSlugs.length > 0) {
      const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
      if (games && games.length > 0) {
        await supabase.from("team_games").insert(games.map((g: { id: string }) => ({ team_id: team.id, game_id: g.id })));
      }
    }

    router.push(`/team/${team.slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Crea team</h1>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* LOGO */}
            <div>
              <Label>Logo team (opzionale, max 2 MB)</Label>
              <div className="mt-2 flex items-center gap-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="h-20 w-20 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden shrink-0"
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Flag className="h-8 w-8 text-[var(--color-fg-muted)]" />
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Scegli immagine
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome team *</Label>
              <Input id="name" name="name" required placeholder="es. Apex Hunters" />
            </div>

            <div>
              <Label>Giochi praticati</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {GAMES.map((g) => (
                  <div
                    key={g.slug}
                    onClick={() => toggleGame(g.slug)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                      selectedGames.includes(g.slug)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
                      <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                        selectedGames.includes(g.slug)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-border-strong)] bg-transparent"
                      }`}>
                        {selectedGames.includes(g.slug) && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <input type="checkbox" name="games" value={g.slug} checked={selectedGames.includes(g.slug)} onChange={() => {}} className="sr-only" />
                      </span>
                      {g.short}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" rows={5} placeholder="Chi siete, obiettivi, requisiti..." />
            </div>

            <div
              onClick={() => setRecruiting((v) => !v)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                recruiting
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
              }`}
            >
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
                <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                  recruiting
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : "border-[var(--color-border-strong)] bg-transparent"
                }`}>
                  {recruiting && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <input type="checkbox" name="recruiting" checked={recruiting} onChange={() => {}} className="sr-only" />
                </span>
                Aperto al reclutamento
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creazione..." : "Crea team"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
