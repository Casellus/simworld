"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { GAMES, SKILL_LEVELS } from "@/lib/constants";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    Object.keys(selected).forEach((s) => fd.append("games", s));
    fd.append("skills", JSON.stringify(selected));
    const res = await updateProfile(fd);
    setSaving(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="display_name">Nome visualizzato</Label>
        <Input id="display_name" name="display_name" defaultValue={profile.display_name || ""} />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio || ""} placeholder="Raccontaci di te..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Paese</Label>
          <Input id="country" name="country" defaultValue={profile.country || "IT"} maxLength={3} />
        </div>
        <div>
          <Label htmlFor="avatar_url">URL avatar</Label>
          <Input id="avatar_url" name="avatar_url" type="url" defaultValue={profile.avatar_url || ""} />
        </div>
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

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving ? "Salvataggio..." : "Salva"}
      </Button>
    </form>
  );
}
