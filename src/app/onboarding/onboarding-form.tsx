"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/dashboard/impostazioni/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { GAMES, SKILL_LEVELS } from "@/lib/constants";
import { User as UserIcon, Upload, ArrowRight } from "lucide-react";

export function OnboardingForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.set("avatar_url", avatarUrl);
    fd.set("cover_url", "");
    Object.keys(selected).forEach((s) => fd.append("games", s));
    fd.append("skills", JSON.stringify(selected));
    const res = await updateProfile(fd);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* AVATAR */}
      <div>
        <Label>Foto profilo (opzionale, max 2 MB)</Label>
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

      {/* USERNAME */}
      <div>
        <Label htmlFor="username">Username (@)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] text-sm select-none">@</span>
          <Input
            id="username"
            name="username"
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={30}
            placeholder="il_tuo_username"
            className="pl-7"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] mt-1">Solo lettere, numeri e _. Min 3 caratteri.</p>
      </div>

      {/* NOME */}
      <div>
        <Label htmlFor="display_name">Nome visualizzato</Label>
        <Input id="display_name" name="display_name" placeholder="Come vuoi essere chiamato?" />
      </div>

      {/* BIO */}
      <div>
        <Label htmlFor="bio">Bio (opzionale)</Label>
        <Textarea id="bio" name="bio" rows={3} placeholder="Raccontaci di te..." />
      </div>

      {/* GIOCHI */}
      <div>
        <Label>Giochi che usi</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {GAMES.map((g) => {
            const isSel = !!selected[g.slug];
            return (
              <div
                key={g.slug}
                onClick={() => toggleGame(g.slug)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSel
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elev-2)] hover:border-[var(--color-primary)]/40"
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

      <Button type="submit" size="lg" className="w-full" disabled={saving || uploading}>
        {saving ? "Salvataggio..." : <><ArrowRight className="h-4 w-4" /> Inizia</>}
      </Button>
    </form>
  );
}
