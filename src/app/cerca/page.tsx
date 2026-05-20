import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChip } from "@/components/ui/filter-chip";
import { Search, Plus, Mail, ExternalLink } from "lucide-react";
import { GAMES } from "@/lib/constants";
import { Suspense } from "react";
import { PostActions } from "./post-actions";
import { SortSelect } from "@/components/ui/sort-select";

export const metadata = { title: "Community · SimUniverse" };
export const revalidate = 30;

type SP = Promise<{ tipo?: string; gioco?: string; ordina?: string }>;

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

export default async function CercaPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ordina = sp.ordina ?? "recenti";
  const { col, asc } = ORDER_MAP[ordina] ?? ORDER_MAP.recenti;
  const supabase = await createClient();

  let gameId: string | null = null;
  if (sp.gioco) {
    const { data: g } = await supabase.from("games").select("id").eq("slug", sp.gioco).single();
    gameId = g?.id ?? null;
  }

  let q = supabase
    .from("recruitment_posts")
    .select("id, post_type, title, description, contact, created_at, user_id, team_id, games(name, slug)")
    .eq("active", true)
    .order(col, { ascending: asc })
    .limit(50);

  if (sp.tipo) q = q.eq("post_type", sp.tipo);
  if (gameId) q = q.eq("game_id", gameId);

  const { data: posts } = await q;
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Cerca pilota o team con cui correre.</p>
        </div>
        <Link href="/cerca/nuovo">
          <Button><Plus className="h-4 w-4" /> Pubblica annuncio</Button>
        </Link>
      </div>

      <Suspense>
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterChip baseHref="/cerca" paramKey="tipo" value={null} label="Tutti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_pilota" label="Team cerca piloti" />
          <FilterChip baseHref="/cerca" paramKey="tipo" value="cerca_team" label="Piloti cercano team" />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip baseHref="/cerca" paramKey="gioco" value={null} label="Tutti giochi" />
          {GAMES.map((g) => (
            <FilterChip key={g.slug} baseHref="/cerca" paramKey="gioco" value={g.slug} label={g.short} />
          ))}
        </div>
        <div className="flex justify-end mb-6">
          <SortSelect options={SORT_OPTIONS} />
        </div>
      </Suspense>

      {posts && posts.length > 0 ? (
        <div className="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const isOwner = user && p.user_id === user.id;
            const contactIsUrl = p.contact ? /^https?:\/\//i.test(p.contact.trim()) : false;
            const isPilota = p.post_type === "cerca_pilota";
            return (
              <div key={p.id} className="rounded-2xl overflow-hidden h-full flex flex-col shadow-xl hover:scale-[1.02] transition-transform duration-200 relative">
                <Link href={`/cerca/${p.id}`} className="absolute inset-0 z-[1]" aria-label={p.title} />
                {/* Immagine / gradient */}
                <div className="relative h-44 shrink-0"
                  style={{ background: isPilota
                    ? "linear-gradient(135deg, #0d2a1a, #0a1a2e, #050507)"
                    : "linear-gradient(135deg, #0d1b3e, #1a1a2e, #050507)" }}>
                  {/* Badge tipo in alto a destra */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1 shadow-md">
                    <span className="text-sm leading-none">{isPilota ? "🏁" : "🧑‍✈️"}</span>
                    <span className="text-xs font-bold text-gray-800 leading-none">
                      {isPilota ? "Cerca pilota" : "Cerca team"}
                    </span>
                  </div>
                  {isOwner && (
                    <div className="absolute top-3 left-3 z-[2]">
                      <PostActions postId={p.id} />
                    </div>
                  )}
                </div>
                {/* Pannello info */}
                <div className="flex flex-col flex-1 px-4 py-3 bg-[var(--color-bg-elev)]">
                  <h3 className="font-bold text-base text-white leading-tight">{p.title}</h3>
                  <p className="text-sm text-[var(--color-fg-muted)] mt-0.5 truncate">{p.description}</p>
                  {p.contact && (
                    <span className="flex items-center gap-1 text-[var(--color-fg-muted)] text-xs mt-2 z-[2] relative">
                      {contactIsUrl
                        ? <ExternalLink className="h-3 w-3 text-[var(--color-primary)]" />
                        : <Mail className="h-3 w-3 text-[var(--color-primary)]" />}
                      {contactIsUrl ? "Link" : p.contact}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="text-center py-16">
            <Search className="h-12 w-12 text-[var(--color-fg-muted)] mx-auto mb-3" />
            <h3 className="font-bold mb-1">Nessun annuncio</h3>
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">Pubblica il primo.</p>
            <Link href="/cerca/nuovo"><Button>Pubblica annuncio</Button></Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
