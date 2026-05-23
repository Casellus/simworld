"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

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
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  }

  if (success) return (
    <div className="text-center space-y-4 py-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 mx-auto">
        <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-extrabold text-white">Controlla la tua email!</h2>
      <p className="text-sm text-white/70 leading-relaxed">
        Ti abbiamo inviato un link di conferma.<br />
        Clicca il link per attivare il tuo account ed entrare in pista.
      </p>
      <p className="text-xs text-white/40">Non trovi l&apos;email? Controlla la cartella spam.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Crea account
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
          Entra in pista con la community italiana.
        </p>
      </div>
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
      <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
        Hai già un account?{" "}
        <Link href="/auth/login" className="text-[var(--color-primary)] font-bold hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
