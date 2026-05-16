import Link from "next/link";
import { LoginForm } from "./login-form";
import { Flag } from "lucide-react";

export const metadata = { title: "Accedi · SimUniverse" };

export default function LoginPage() {
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
          Accedi
        </h1>
        <p className="text-sm text-white/65 text-center mb-8">
          Bentornato in pista.
        </p>
        <LoginForm />
        <p className="mt-6 text-sm text-center text-white/65">
          Non hai account?{" "}
          <Link href="/auth/register" className="text-[var(--color-primary)] font-semibold hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
