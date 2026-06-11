import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Registrati · SimUniverse" };

export default function RegisterPage() {
  return (
    <div className="auth-screen">
      <div className="w-full" style={{ maxWidth: "26rem" }}>
      <Link href="/auth/login" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-3">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Indietro
      </Link>
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
          Crea account
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
          Entra in pista con la community italiana.
        </p>
        <RegisterForm />
        <p className="mt-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
          Hai già un account?{" "}
          <Link href="/auth/login" className="text-[var(--color-primary)] font-bold hover:underline">
            Accedi
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
