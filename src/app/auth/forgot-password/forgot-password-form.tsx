"use client";

import { useState } from "react";
import { requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email"));

    // Server action con rate limit per IP (3/min). L'esito e' sempre lo
    // stesso a prescindere dall'esistenza dell'email (no enumeration),
    // tranne quando si supera il limite.
    const { error } = await requestPasswordReset(
      email,
      `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    );
    setLoading(false);
    if (error) { setError(error); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-[var(--color-success)]" />
        <p className="text-sm text-white/90 leading-relaxed">
          Email inviata! Controlla la tua casella e clicca sul link per reimpostare la password.
          Il link scade in 1 ora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Invio in corso..." : "Invia link di reset"}
      </Button>
    </form>
  );
}
