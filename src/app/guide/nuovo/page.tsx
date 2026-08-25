import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { GAMES, GUIDE_CATEGORIES } from "@/lib/constants";
import { createGuide } from "../actions";
import { GuideCoverUpload } from "./guide-cover-upload";

export const metadata = { title: "Nuova guida · SimUniverse" };

export default async function NuovaGuidaPage() {
  const userId = await getUserId();
  if (!userId) redirect("/auth/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("can_write_guides")
    .eq("id", userId)
    .single();

  // Solo i creator autorizzati accedono a questa pagina.
  if (!profile?.can_write_guides) redirect("/guide");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <BackButton href="/guide" label="Tutte le guide" />
      <h1 className="text-3xl font-extrabold tracking-tight mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        Nuova guida
      </h1>
      <p className="text-sm text-[var(--color-fg-muted)] mb-8">
        Condividi una guida con la community. Puoi allegare un video YouTube o Vimeo.
      </p>

      <form action={createGuide} className="space-y-5">
        <Field label="Titolo" required>
          <input name="title" required maxLength={140} className={inputCls} placeholder="es. Trail braking: la guida completa" />
        </Field>

        <Field label="Sottotitolo / estratto">
          <input name="excerpt" maxLength={200} className={inputCls} placeholder="Una riga che riassume la guida" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoria">
            <select name="category" className={inputCls} defaultValue="">
              <option value="">— Nessuna —</option>
              {GUIDE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Gioco">
            <select name="game" className={inputCls} defaultValue="">
              <option value="">— Nessuno —</option>
              {GAMES.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Link video (YouTube o Vimeo)">
          <input name="video_url" type="url" className={inputCls} placeholder="https://youtu.be/..." />
        </Field>

        <Field label="Copertina">
          <GuideCoverUpload />
        </Field>

        <Field label="Contenuto" required>
          <textarea name="body" required rows={12} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2.5 text-sm leading-relaxed focus:border-[var(--color-primary)] focus:outline-none resize-y" placeholder="Scrivi qui la guida..." />
        </Field>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded accent-[var(--color-primary)]" />
          Pubblica subito (altrimenti resta bozza)
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Crea guida
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">
        {label}{required && <span className="text-[var(--color-primary)]"> *</span>}
      </label>
      {children}
    </div>
  );
}
