"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const username = String(fd.get("username")).toLowerCase().replace(/[^a-z0-9_]/g, "");

    if (username.length < 3) {
      setError("Username deve avere almeno 3 caratteri (a-z, 0-9, _).");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  async function registerDiscord() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: "identify email" },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return (
      <div className="rounded border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 p-4 text-sm">
        Account creato. Controlla email per conferma se richiesta. Reindirizzamento...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="secondary" className="w-full" onClick={registerDiscord}>
        Continua con Discord
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[var(--color-bg)] px-2 text-[var(--color-fg-muted)] uppercase">Oppure</span>
        </div>
      </div>

      <form onSubmit={register} className="space-y-4">
        <div>
          <Label htmlFor="username">Username pilota</Label>
          <Input id="username" name="username" type="text" required minLength={3} pattern="[a-zA-Z0-9_]+" placeholder="es. fastlap_42" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Caricamento..." : "Crea account"}
        </Button>
      </form>
    </div>
  );
}
