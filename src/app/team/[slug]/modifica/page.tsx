"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { GAMES } from "@/lib/constants";
import { Flag, Upload } from "lucide-react";

type Team = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  recruiting: boolean;
  logo_url: string | null;
  owner_id: string;
};

type GameRow = { slug: string };

export default function ModificaTeamPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [team, setTeam] = useState<Team | null>(null);
  const [currentGames, setCurrentGames] = useState<string[]>([]);
  const [recruitingState, setRecruitingState] = useState(false);

  function toggleGame(slug: string) {
    setCurrentGames((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }
  const [preview, setPreview] = useState<string | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: t } = await supabase
        .from("teams")
        .select("id, name, slug, description, recruiting, logo_url, owner_id")
        .eq("slug", params.slug)
        .single();

      if (!t || t.owner_id !== user.id) { router.push("/team"); return; }

      const { data: tg } = await supabase
        .from("team_games")
        .select("games(slug)")
        .eq("team_id", t.id);

      setTeam(t);
      setRecruitingState(t.recruiting);
      setCurrentGames(tg?.map((r) => {
        const g = Array.isArray(r.games) ? r.games[0] : r.games;
        return (g as GameRow | null)?.slug ?? "";
      }).filter(Boolean) ?? []);
      setFetching(false);
    }
    load();
  }, [params.slug, router]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Logo max 2 MB."); e.target.value = ""; return; }
    setPreview(URL.createObjectURL(file));
    setClearLogo(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!team) return;
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const supabase = createClient();

    const name = String(fd.get("name") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const recruiting = fd.get("recruiting") === "on";
    const gameSlugs = fd.getAll("games").map(String);

    if (!name) { setError("Nome obbligatorio."); setLoading(false); return; }

    let logo_url = team.logo_url;

    if (clearLogo) {
      logo_url = null;
    } else if (fileRef.current?.files?.[0]) {
      const logoFile = fileRef.current.files[0];
      const ext = logoFile.name.split(".").pop();
      const path = `${team.owner_id}/${team.slug}.${ext}`;
      const { error: upErr } = await supabase.storage.from("Team-assets").upload(path, logoFile, { upsert: true });
      if (upErr) { setError("Errore upload logo: " + upErr.message); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("Team-assets").getPublicUrl(path);
      logo_url = urlData.publicUrl;
    }

    const { error: upErr2 } = await supabase
      .from("teams")
      .update({ name, description: description || null, recruiting, logo_url })
      .eq("id", team.id);

    if (upErr2) { setError(upErr2.message); setLoading(false); return; }

    await supabase.from("team_games").delete().eq("team_id", team.id);
    if (gameSlugs.length > 0) {
      const { data: games } = await supabase.from("games").select("id, slug").in("slug", gameSlugs);
      if (games && games.length > 0) {
        await supabase.from("team_games").insert(games.map((g: { id: string }) => ({ team_id: team.id, game_id: g.id })));
      }
    }

    router.push(`/team/${team.slug}`);
  }

  if (fetching) {
    return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 text-[var(--color-fg-muted)]">Caricamento...</div>;
  }
  if (!team) return null;

  const logoSrc = preview ?? (clearLogo ? null : team.logo_url);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Modifica team</h1>
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
                  {logoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoSrc} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <Flag className="h-8 w-8 text-[var(--color-fg-muted)]" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Cambia immagine
                  </Button>
                  {(team.logo_url || preview) && !clearLogo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setClearLogo(true); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    >
                      Rimuovi logo
                    </Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nome team *</Label>
              <Input id="name" name="name" required defaultValue={team.name} />
            </div>

            <div>
              <Label>Giochi praticati</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                {GAMES.map((g) => (
                  <div
                    key={g.slug}
                    onClick={() => toggleGame(g.slug)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                      currentGames.includes(g.slug)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
                      <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                        currentGames.includes(g.slug)
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-border-strong)] bg-transparent"
                      }`}>
                        {currentGames.includes(g.slug) && (
                          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <input type="checkbox" name="games" value={g.slug} checked={currentGames.includes(g.slug)} onChange={() => {}} className="sr-only" />
                      </span>
                      {g.short}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" name="description" rows={5} defaultValue={team.description ?? ""} />
            </div>

            <div
              onClick={() => setRecruitingState((v) => !v)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                recruitingState
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
              }`}
            >
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
                <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                  recruitingState
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                    : "border-[var(--color-border-strong)] bg-transparent"
                }`}>
                  {recruitingState && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <input type="checkbox" name="recruiting" checked={recruitingState} onChange={() => {}} className="sr-only" />
                </span>
                Aperto al reclutamento
              </label>
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
