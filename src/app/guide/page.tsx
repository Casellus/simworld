import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/ui/sort-select";
import { FilterChip } from "@/components/ui/filter-chip";
import { BookOpen, Plus, PlayCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";
import { GAMES, GUIDE_CATEGORIES } from "@/lib/constants";
import { likePattern } from "@/lib/validation";
import { videoThumbnail } from "@/components/video-embed";
import { Suspense } from "react";

export const revalidate = 60;
export const metadata = { title: "Guide · SimUniverse" };

type SP = Promise<{ ordina?: string; categoria?: string; gioco?: string; q?: string }>;

const SORT_OPTIONS = [
  { value: "recenti", label: "Più recenti" },
  { value: "vecchi",  label: "Meno recenti" },
  { value: "az",      label: "A → Z" },
];

const ORDER_MAP: Record<string, { col: string; asc: boolean }> = {
  recenti: { col: "created_at", asc: false },
  vecchi:  { col: "created_at", asc: true  },
  az:      { col: "title",      asc: true  },
};

export default async function GuidePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ordina = sp.ordina ?? "recenti";
  const { col, asc } = ORDER_MAP[ordina] ?? ORDER_MAP.recenti;

  const supabase = await createClient();
  const userId = await getUserId();

  // Filtro gioco per slug -> id
  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  let q = supabase
    .from("guides")
    .select("id, slug, title, excerpt, category, cover_url, video_url, created_at, games(name), profiles:author_id(username, display_name, avatar_url)")
    .eq("published", true)
    .order(col, { ascending: asc });
  if (sp.categoria) q = q.eq("category", sp.categoria);
  if (gameId) q = q.eq("game_id", gameId);
  if (sp.q) q = q.ilike("title", likePattern(sp.q));

  const [{ data: guides }, creator] = await Promise.all([
    q,
    userId
      ? supabase.from("profiles").select("can_write_guides").eq("id", userId).single()
      : Promise.resolve({ data: null }),
  ]);
  const canWrite = !!(creator?.data?.can_write_guides);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Guide</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Consigli, tutorial, FFB, hardware, tecniche di guida.</p>
        </div>
        {canWrite && (
          <Link href="/guide/nuovo">
            <Button><Plus className="h-4 w-4" /> Nuova guida</Button>
          </Link>
        )}
      </div>

      {/* RICERCA + ORDINAMENTO */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <form action="/guide" method="get" className="flex flex-1 gap-2 min-w-0">
          {sp.categoria && <input type="hidden" name="categoria" value={sp.categoria} />}
          {sp.gioco && <input type="hidden" name="gioco" value={sp.gioco} />}
          {sp.ordina && <input type="hidden" name="ordina" value={sp.ordina} />}
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="Cerca guide..."
            className="min-w-0 flex-1 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          />
          <Button type="submit" variant="secondary" className="shrink-0">Cerca</Button>
        </form>
        <Suspense>
          <SortSelect options={SORT_OPTIONS} />
        </Suspense>
      </div>

      {/* FILTRI */}
      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/guide" paramKey="categoria" value={null} label="Tutte" />
          {GUIDE_CATEGORIES.map((c) => (
            <FilterChip key={c.value} baseHref="/guide" paramKey="categoria" value={c.value} label={c.label} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterChip baseHref="/guide" paramKey="gioco" value={null} label="Tutti i giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/guide" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
      </Suspense>

      {guides && guides.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => {
            const game = one<{ name: string }>(g.games);
            const author = one<{ username: string; display_name: string | null; avatar_url: string | null }>(g.profiles);
            const authorName = author?.display_name || author?.username || "Autore";
            const catLabel = GUIDE_CATEGORIES.find((c) => c.value === g.category)?.label ?? g.category;
            // Cover: quella caricata, altrimenti la thumbnail del video YouTube.
            const cover = g.cover_url || videoThumbnail(g.video_url);
            return (
            <Link key={g.id} href={`/guide/${g.slug}`} className="group block h-full">
              <div className="h-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-primary)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                {/* Cover */}
                <div className="relative h-40 overflow-hidden shrink-0">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-elev)] to-transparent" />
                  {catLabel && (
                    <span className="absolute top-3 left-3 z-[2] rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[var(--color-accent)]/25 text-blue-100 border border-[var(--color-accent)]/40 backdrop-blur-sm">
                      {catLabel}
                    </span>
                  )}
                  {g.video_url && (
                    <span className="absolute top-3 right-3 z-[2] flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold bg-black/50 text-white border border-white/20 backdrop-blur-sm">
                      <PlayCircle className="h-3.5 w-3.5" /> Video
                    </span>
                  )}
                </div>
                {/* Body */}
                <div className="flex flex-col flex-1 px-4 py-3 gap-1.5">
                  {game?.name && <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">{game.name}</span>}
                  <h3 className="font-bold text-base text-white leading-snug">{g.title}</h3>
                  {g.excerpt && <p className="text-sm text-[var(--color-fg-muted)] line-clamp-2">{g.excerpt}</p>}
                </div>
                {/* Autore */}
                <div className="flex items-center gap-2 px-4 pb-3.5 pt-1 mt-auto border-t border-[var(--color-border)]">
                  <span className="h-6 w-6 rounded-full overflow-hidden bg-[var(--color-bg-elev-2)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent)] shrink-0">
                    {author?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={author.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : authorName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--color-fg-muted)] truncate">{authorName}</span>
                  <span className="text-xs text-[var(--color-fg-muted)]/60 ml-auto shrink-0">{formatDate(g.created_at)}</span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <BookOpen className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold mb-1">Guide in arrivo</h3>
            <p className="text-sm text-[var(--color-fg-muted)]">Le prime guide saranno disponibili a breve.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
