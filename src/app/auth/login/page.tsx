import Link from "next/link";
import { LoginForm } from "./login-form";
import { BackButton } from "@/components/back-button";

export const metadata = { title: "Accedi · SimUniverse" };

export default function LoginPage() {
  return (
    <div className="auth-screen">
      <div className="w-full" style={{ maxWidth: "26rem" }}>
      <BackButton href="/" label="Indietro" />
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
          Accedi
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "rgba(255,255,255,0.85)" }}>
          Bentornato in pista.
        </p>
        <LoginForm />
        <p className="mt-6 text-sm text-center" style={{ color: "rgba(255,255,255,0.85)" }}>
          Non hai account?{" "}
          <Link href="/auth/register" className="text-[var(--color-primary)] font-bold hover:underline">
            Registrati
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
