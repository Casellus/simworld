import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = { title: "Password dimenticata · SimUniverse" };

export default function ForgotPasswordPage() {
  return (
    <div className="auth-screen">
      <div className="w-full" style={{ maxWidth: "26rem" }}>
      <BackButton href="/auth/login" label="Indietro" />
      <div className="auth-card">
        <Link href="/" className="flex items-center justify-center mb-6">
          <span className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            Sim<span className="text-[var(--color-primary)]">Universe</span>
          </span>
        </Link>
        <h1
          className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Password dimenticata
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
          Inserisci la tua email e ti mandiamo il link per reimpostarla.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
          Ricordi la password?{" "}
          <Link href="/auth/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Accedi
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
