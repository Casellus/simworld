"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function loginDiscord() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "identify email",
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="secondary" className="w-full" onClick={loginDiscord}>
        <svg className="h-4 w-4" viewBox="0 0 71 55" fill="currentColor">
          <path d="M60.1 4.9A58.5 58.5 0 0 0 45.7 0c-.6 1.1-1.4 2.5-1.9 3.7a54.4 54.4 0 0 0-16.5 0C26.8 2.5 26 1.1 25.4 0a58.5 58.5 0 0 0-14.4 4.9C2 18.7-.4 32 .6 45.2A59 59 0 0 0 18.5 54c1.5-2 2.8-4.1 3.9-6.4-2.1-.8-4.2-1.8-6.1-3 .5-.4 1-.8 1.5-1.2a42 42 0 0 0 35.4 0c.5.4 1 .8 1.5 1.2-1.9 1.2-4 2.2-6.1 3 1.1 2.3 2.4 4.4 3.9 6.4a59 59 0 0 0 17.9-8.8C72 30.5 68.1 17.3 60.1 4.9zM23.7 37.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
        </svg>
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

      <form onSubmit={loginEmail} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" minLength={6} />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Caricamento..." : "Accedi"}
        </Button>
      </form>
    </div>
  );
}
