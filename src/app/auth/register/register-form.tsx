"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  async function registerDiscord() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: "identify email" },
    });
    if (error) setError(error.message);
  }

  if (success) return (
    <div className="text-center space-y-4 py-2">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 mx-auto">
        <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
        Benvenuto in SimUniverse!
      </h2>
      <p className="text-sm text-white/70 leading-relaxed">
        Grazie per esserti registrato.<br />
        Clicca il link nell&apos;email per confermare il tuo account ed entrare in pista.
      </p>
      <p className="text-xs text-white/40 pt-1">Non trovi l&apos;email? Controlla la cartella spam.</p>
    </div>
  );

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
          <Checkbox
            checked={acceptedAge}
            onChange={(e) => setAcceptedAge((e.target as HTMLInputElement).checked)}
            label={<>Confermo di avere almeno <strong className="text-white">16 anni</strong>.</>}
          />
          <Checkbox
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms((e.target as HTMLInputElement).checked)}
            label={<>Ho letto e accetto i{" "}
              <a href="/info/termini" target="_blank" className="font-semibold underline underline-offset-2" style={{ color: "#60a5fa" }}>Termini di Servizio</a>{" "}
              e la{" "}
              <a href="/info/privacy" target="_blank" className="font-semibold underline underline-offset-2" style={{ color: "#60a5fa" }}>Privacy Policy</a>.
            </>}
          />
        </div>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading || !acceptedTerms || !acceptedAge}>
          {loading ? "Caricamento..." : "Crea account"}
        </Button>
      </form>
    </div>
  );
}
