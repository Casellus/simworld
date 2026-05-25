import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";
import { Car } from "lucide-react";

export const metadata = { title: "Crea il tuo profilo · SimUniverse" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-[var(--color-bg)] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 mb-4">
            <Car className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Prima di iniziare</h1>
          <p className="text-[var(--color-fg-muted)] mt-2">Crea il tuo profilo per entrare nella community.</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] p-6 sm:p-8 shadow-2xl">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
