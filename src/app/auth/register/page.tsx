import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Registrati · SimUniverse" };

export default function RegisterPage() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <Link href="/" className="flex items-center justify-center mb-6">
          <span className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            Sim<span className="text-[var(--color-primary)]">Universe</span>
          </span>
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
}
