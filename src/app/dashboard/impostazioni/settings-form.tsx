"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, deleteAccount } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { CountrySelect } from "@/components/ui/country-select";
import { GAMES, SKILL_LEVELS } from "@/lib/constants";
import { User as UserIcon, Upload, Trash2, Image as ImageIcon } from "lucide-react";

type Profile = {
  username: string | null;
  display_name: string | null;
  bio: string | null;
  country: string | null;
  hardware: string | null;
  discord_id: string | null;
  steam_id: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

export function SettingsForm({ profile, userGames }: { profile: Profile; userGames: { slug: string; skill: string }[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar_url || "");
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
  const [coverUrl, setCoverUrl] = useState<string>(profile.cover_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(userGames.map((g) => [g.slug, g.skill]))
  );

  function toggleGame(slug: string) {
    setSelected((s) => {
      const n = { ...s };
      if (n[slug]) delete n[slug];
      else n[slug] = "intermedio";
      return n;
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar max 2 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Non autorizzato."); setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setError("Errore upload: " + upErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${urlData.publicUrl}?v=${Date.now()}`);
    setUploading(false);
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Copertina max 4 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Non autorizzato."); setUploadingCover(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/cover.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setError("Errore upload copertina: " + upErr.message); setUploadingCover(false); return; }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    setCoverUrl(`${urlData.publicUrl}?v=${Date.now()}`);
    setUploadingCover(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    // override avatar_url + cover_url with the uploaded ones
    fd.set("avatar_url", avatarUrl);
    fd.set("cover_url", coverUrl);
    Object.keys(selected).forEach((s) => fd.append("games", s));
    fd.append("skills", JSON.stringify(selected));
    const res = await updateProfile(fd);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* COVER */}
      <div>
        <Label>Foto copertina (max 4 MB)</Label>
        <div
          onClick={() => coverRef.current?.click()}
          className="mt-2 relative h-40 sm:h-48 w-full rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors cursor-pointer overflow-hidden bg-[var(--color-bg-elev)]"
        >
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[var(--color-fg-muted)]">
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Carica copertina</span>
            </div>
          )}
          {coverPreview && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); coverRef.current?.click(); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/20 flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" /> {uploadingCover ? "..." : "Cambia"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCoverPreview(null); setCoverUrl(""); if (coverRef.current) coverRef.current.value = ""; }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-sm text-white border border-white/20"
              >
                Rimuovi
              </button>
            </div>
          )}
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* AVATAR */}
      <div>
        <Label>Foto profilo (max 2 MB)</Label>
        <div className="mt-2 flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="h-20 w-20 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors overflow-hidden shrink-0"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-8 w-8 text-[var(--color-fg-muted)]" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Caricamento..." : "Carica foto"}
            </Button>
            {avatarPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setAvatarPreview(null); setAvatarUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
              >
                Rimuovi
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <div>
        <Label htmlFor="username">Username (@)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] text-sm select-none">@</span>
          <Input
            id="username"
            name="username"
            defaultValue={profile.username || ""}
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={30}
            placeholder="il_tuo_username"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] mt-1">Solo lettere, numeri e _. Min 3 caratteri.</p>
      </div>

      <div>
        <Label htmlFor="display_name">Nome visualizzato</Label>
        <Input id="display_name" name="display_name" defaultValue={profile.display_name || ""} />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio || ""} placeholder="Raccontaci di te..." />
      </div>

      <div>
        <Label htmlFor="hardware">Hardware</Label>
        <Textarea
          id="hardware"
          name="hardware"
          rows={3}
          defaultValue={profile.hardware || ""}
          placeholder="es. Volante Fanatec CSL DD, pedaliera CSL LC, monitor 32''..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discord_id">Discord</Label>
          <Input id="discord_id" name="discord_id" defaultValue={profile.discord_id || ""} placeholder="nickname#0000" />
        </div>
        <div>
          <Label htmlFor="steam_id">Steam ID</Label>
          <Input id="steam_id" name="steam_id" defaultValue={profile.steam_id || ""} placeholder="76561198..." />
        </div>
      </div>

      <div>
        <Label>Giochi</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {GAMES.map((g) => {
            const isSel = !!selected[g.slug];
            return (
              <div
                key={g.slug}
                onClick={() => toggleGame(g.slug)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSel
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)]/40"
                }`}
              >
                <label className="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
                  <span className={`flex-shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
                    isSel
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-[var(--color-border-strong)] bg-transparent"
                  }`}>
                    {isSel && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {g.name}
                </label>
                {isSel && (
                  <Select
                    className="mt-2 h-8"
                    value={selected[g.slug]}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setSelected((s) => ({ ...s, [g.slug]: e.target.value }))}
                  >
                    {SKILL_LEVELS.map((sk) => (
                      <option key={sk.value} value={sk.value}>
                        {sk.label}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {saved && <p className="text-sm text-[var(--color-success)]">Impostazioni salvate.</p>}

      <Button type="submit" size="lg" className="w-full" disabled={saving || uploading}>
        {saving ? "Salvataggio..." : "Salva"}
      </Button>

      {/* ── ZONA PERICOLOSA ── */}
      <div className="mt-10 border-t border-[var(--color-border)] pt-8">
        <h3 className="text-base font-semibold text-[var(--color-fg)] mb-1">Zona pericolosa</h3>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          L'eliminazione dell'account è permanente e irreversibile. Tutti i tuoi dati, annunci,
          assetti e iscrizioni verranno cancellati.
        </p>
        <Button
          type="button"
          variant="outline"
          className="!border-[var(--color-danger)]/50 !text-[var(--color-danger)] hover:!bg-[var(--color-danger)]/10"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="h-4 w-4" />
          Elimina account
        </Button>
      </div>

      {/* ── MODALE CONFERMA ELIMINAZIONE ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-[var(--color-fg)] mb-2">Elimina account</h4>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4 leading-relaxed">
              Questa azione è <strong className="text-[var(--color-fg)]">permanente e irreversibile</strong>.
              Scrivi <strong className="text-[var(--color-danger)]">ELIMINA</strong> per confermare.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Scrivi ELIMINA"
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                disabled={deleting}
              >
                Annulla
              </Button>
              <Button
                type="button"
                className="flex-1 !bg-[var(--color-danger)] hover:!opacity-90"
                disabled={deleteConfirm !== "ELIMINA" || deleting}
                onClick={async () => {
                  setDeleting(true);
                  await deleteAccount();
                }}
              >
                {deleting ? "Eliminazione..." : "Elimina definitivamente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
