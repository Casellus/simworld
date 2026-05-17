import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Nuova password · SimUniverse" };

export default function ResetPasswordPage() {
  return (
    <div className="auth-screen">
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
          Nuova password
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
          Scegli una nuova password sicura per il tuo account.
        </p>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
