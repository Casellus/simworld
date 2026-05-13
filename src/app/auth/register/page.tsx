import Link from "next/link";
import { RegisterForm } from "./register-form";
import { Flag } from "lucide-react";

export const metadata = { title: "Registrati · SimUniverse" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
      <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
        <Flag className="h-6 w-6 text-[var(--color-primary)]" />
        <span className="text-lg font-black uppercase">
          Sim<span className="text-[var(--color-primary)]">World</span>
        </span>
      </Link>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-center">Crea account</h1>
      <p className="text-sm text-[var(--color-fg-muted)] text-center mb-8">
        Entra in pista con la community italiana.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-center text-[var(--color-fg-muted)]">
        Hai già un account?{" "}
        <Link href="/auth/login" className="text-[var(--color-primary)] hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
