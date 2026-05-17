"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);

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
    if (!acceptedAge || !acceptedTerms) {
      setError("Devi confermare età e accettare i Termini per continuare.");
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
      router.push("/");
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
      <div className="rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/15 p-4 text-sm text-white">
        Account creato. Controlla email per conferma se richiesta. Reindirizzamento...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="secondary"
        className="w-full !bg-white/10 !border-white/15 !text-white hover:!bg-white/15"
        onClick={registerDiscord}
      >
        <svg className="h-4 w-4" viewBox="0 0 71 55" fill="currentColor">
          <path d="M60.1 4.9A58.5 58.5 0 0 0 45.7 0c-.6 1.1-1.4 2.5-1.9 3.7a54.4 54.4 0 0 0-16.5 0C26.8 2.5 26 1.1 25.4 0a58.5 58.5 0 0 0-14.4 4.9C2 18.7-.4 32 .6 45.2A59 59 0 0 0 18.5 54c1.5-2 2.8-4.1 3.9-6.4-2.1-.8-4.2-1.8-6.1-3 .5-.4 1-.8 1.5-1.2a42 42 0 0 0 35.4 0c.5.4 1 .8 1.5 1.2-1.9 1.2-4 2.2-6.1 3 1.1 2.3 2.4 4.4 3.9 6.4a59 59 0 0 0 17.9-8.8C72 30.5 68.1 17.3 60.1 4.9zM23.7 37.2c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.6 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.2 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
        </svg>
        Continua con Discord
      </Button>

      <div className="auth-divider">Oppure</div>

      <form onSubmit={register} className="space-y-4">
        <div>
          <Label htmlFor="username" className="!text-white/90">Username pilota</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            pattern="[a-zA-Z0-9_]+"
            placeholder="es. fastlap_42"
            className="auth-input"
          />
        </div>
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
              minLength={6}
              autoComplete="new-password"
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
        </div>
        <div className="space-y-3 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedAge}
              onChange={(e) => setAcceptedAge(e.target.checked)}
              className="mt-0.5 shrink-0 accent-[var(--color-primary)]"
            />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
              Confermo di avere almeno <strong className="text-white">16 anni</strong>.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 shrink-0 accent-[var(--color-primary)]"
            />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
              Ho letto e accetto i{" "}
              <a href="/info/termini" target="_blank" className="text-[var(--color-primary)] underline underline-offset-2">
                Termini di Servizio
              </a>{" "}
              e la{" "}
              <a href="/info/privacy" target="_blank" className="text-[var(--color-primary)] underline underline-offset-2">
                Privacy Policy
              </a>.
            </span>
          </label>
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !acceptedTerms || !acceptedAge}>
          {loading ? "Caricamento..." : "Crea account"}
        </Button>
      </form>
    </div>
  );
}
