import Link from "next/link";
import { LoginForm } from "./login-form";
import { Flag } from "lucide-react";

export const metadata = { title: "Accedi · SimWorld" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
        <Flag className="h-6 w-6 text-[var(--color-primary)]" />
        <span className="text-lg font-black uppercase">
          Sim<span className="text-[var(--color-primary)]">World</span>
        </span>
      </Link>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-center">Accedi</h1>
      <p className="text-sm text-[var(--color-fg-muted)] text-center mb-8">
        Bentornato in pista.
      </p>
      <LoginForm />
      <p className="mt-6 text-sm text-center text-[var(--color-fg-muted)]">
        Non hai account?{" "}
        <Link href="/auth/register" className="text-[var(--color-primary)] hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}
