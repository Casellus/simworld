"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { checkLoginAllowed } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailConfirmed = searchParams.get("message") === "email_confirmed";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function loginEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    // Rate limit per IP (5/min) prima del login. Il signIn resta client-side
    // cosi' il browser client sincronizza la sessione (campanella, onAuthState).
    const gate = await checkLoginAllowed();
    if (gate.error) { setError(gate.error); setLoading(false); return; }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) {
      // Messaggio generico: non distingue email inesistente da password errata.
      setError("Email o password non corretti.");
      return;
    }
    router.push("/");
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
      {emailConfirmed && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 text-center">
          Email confermata! Accedi per entrare in pista.
        </div>
      )}
      <Button
        type="button"
        variant="secondary"
        className="w-full !bg-white/10 !border-white/15 !text-white hover:!bg-white/15"
        onClick={loginDiscord}
      >
        <svg className="h-4 w-4" viewBox="0 0 71 55" fill="currentColor">
          <path d="M60.1 4.9A58.5 58.5 0 0 0 45.7 0c-.6 1.1-1.4 2.5-1.9 3.7a54.4 54.4 0 0 0-16.5 0C26.8 2.5 26 1.1 25.4 0a58.5 58.5 0 0 0-14.4 4.9C2 18.7-.4 32 .6 45.2A59 59 0 0 0 18.5 54c1.5-2 2.8-4.1 3.9-6.4-2.1-.8-4.2-1.8-6.1-3 .5-.4 1-.8 1.5-1.2a42 42 0 0 0 35.4 0c.5.4 1 .8 1.5 1.2-1.9 1.2-4 2.2-6.1 3 1.1 2.3 2.4 4.4 3.9 6.4a59 59 0 0 0 17.9-8.8C72 30.5 68.1 17.3 60.1 4.9zM23.7 37.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
        </svg>
        Continua con Discord
      </Button>

      <div className="auth-divider">Oppure</div>

      <form onSubmit={loginEmail} className="space-y-4">
        <div>
          <Label htmlFor="email" className="!text-white/90">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="auth-input"
          />
        </div>
        <div>
          <Label htmlFor="password" className="!text-white/90">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              className="auth-input pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <Link href="/auth/forgot-password" className="text-xs text-[var(--color-primary)] font-bold hover:underline">
              Password dimenticata?
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Caricamento..." : "Accedi"}
        </Button>
      </form>
    </div>
  );
}
