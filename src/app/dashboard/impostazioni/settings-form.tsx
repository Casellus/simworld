"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { GAMES, SKILL_LEVELS } from "@/lib/constants";
import { User as UserIcon, Upload } from "lucide-react";

type Profile = {
  display_name: string | null;
  bio: string | null;
  country: string | null;
  hardware: string | null;
  discord_id: string | null;
  steam_id: string | null;
  avatar_url: string | null;
};

export function SettingsForm({ profile, userGames }: { profile: Profile; userGames: { slug: string; skill: string }[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar_url || "");
  const [uploading, setUploading] = useState(false);

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
    setAvatarUrl(urlData.publicUrl);
    setUploading(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    // override avatar_url with the uploaded one
    fd.set("avatar_url", avatarUrl);
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
        <Label htmlFor="display_name">Nome visualizzato</Label>
        <Input id="display_name" name="display_name" defaultValue={profile.display_name || ""} />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio || ""} placeholder="Raccontaci di te..." />
      </div>

      <div>
        <Label htmlFor="country">Paese</Label>
        <Input id="country" name="country" defaultValue={profile.country || "IT"} maxLength={3} className="max-w-xs" />
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
                className={`p-3 rounded border cursor-pointer transition-colors ${
                  isSel
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-fg-muted)]"
                }`}
              >
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={isSel} onChange={() => toggleGame(g.slug)} />
                  {g.name}
                </label>
                {isSel && (
                  <Select
                    className="mt-2 h-8"
                    value={selected[g.slug]}
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
    </form>
  );
}
