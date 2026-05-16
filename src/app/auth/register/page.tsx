import Link from "next/link";
import { RegisterForm } from "./register-form";
import { Flag } from "lucide-react";

export const metadata = { title: "Registrati · SimUniverse" };

export default function RegisterPage() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link href="/" className="flex items-center gap-2 mb-6 justify-center">
          <Flag className="h-6 w-6 text-[var(--color-primary)]" />
          <span className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            Sim<span className="text-[var(--color-primary)]">World</span>
          </span>
        </Link>
        <h1
          className="text-3xl font-extrabold tracking-tight mb-2 text-center"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Crea account
        </h1>
        <p className="text-sm text-white/65 text-center mb-8">
          Entra in pista con la community italiana.
        </p>
        <RegisterForm />
        <p className="mt-6 text-sm text-center text-white/65">
          Hai già un account?{" "}
          <Link href="/auth/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
