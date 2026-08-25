import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { BackButton } from "@/components/back-button";
import { GAMES, GUIDE_CATEGORIES } from "@/lib/constants";
import { one } from "@/lib/types";
import { updateGuide } from "../../actions";
import { GuideCoverUpload } from "../../nuovo/guide-cover-upload";

export const metadata = { title: "Modifica guida · SimUniverse" };

export default async function ModificaGuidaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await getUserId();
  if (!userId) redirect("/auth/login");

  const supabase = await createClient();
  const { data: guide } = await supabase
    .from("guides")
    .select("id, title, excerpt, body, category, video_url, cover_url, author_id, published, games(slug)")
    .eq("slug", slug)
    .single();

  if (!guide) notFound();
  if (guide.author_id !== userId) redirect(`/guide/${slug}`);

  const gameSlug = one<{ slug: string }>(guide.games)?.slug ?? "";
  const action = updateGuide.bind(null, guide.id);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <BackButton href={`/guide/${slug}`} label="Torna alla guida" />
      <h1 className="text-3xl font-extrabold tracking-tight mb-8" style={{ fontFamily: "var(--font-heading)" }}>
        Modifica guida
      </h1>

      <form action={action} className="space-y-5">
        <Field label="Titolo" required>
          <input name="title" required maxLength={140} defaultValue={guide.title} className={inputCls} />
        </Field>
        <Field label="Sottotitolo / estratto">
          <input name="excerpt" maxLength={200} defaultValue={guide.excerpt ?? ""} className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Categoria">
            <select name="category" className={inputCls} defaultValue={guide.category ?? ""}>
              <option value="">— Nessuna —</option>
              {GUIDE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Gioco">
            <select name="game" className={inputCls} defaultValue={gameSlug}>
              <option value="">— Nessuno —</option>
              {GAMES.map((g) => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Link video (YouTube o Vimeo)">
          <input name="video_url" type="url" defaultValue={guide.video_url ?? ""} className={inputCls} />
        </Field>

        <Field label="Copertina">
          <GuideCoverUpload defaultUrl={guide.cover_url ?? ""} />
        </Field>
        <Field label="Contenuto" required>
          <textarea name="body" required rows={12} defaultValue={guide.body} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 py-2.5 text-sm leading-relaxed focus:border-[var(--color-primary)] focus:outline-none resize-y" />
        </Field>
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="published" defaultChecked={guide.published !== false} className="h-4 w-4 rounded accent-[var(--color-primary)]" />
          Pubblicata
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Salva modifiche
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
