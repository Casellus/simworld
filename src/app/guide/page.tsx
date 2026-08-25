import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SortSelect } from "@/components/ui/sort-select";
import { BookOpen, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";
import { Suspense } from "react";

export const revalidate = 60;
export const metadata = { title: "Guide · SimUniverse" };

type SP = Promise<{ ordina?: string }>;

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
  const [{ data: guides }, creator] = await Promise.all([
    supabase
      .from("guides")
      .select("id, slug, title, excerpt, category, cover_url, video_url, created_at, games(name)")
      .eq("published", true)
      .order(col, { ascending: asc }),
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
        <div className="flex items-center gap-2">
          {canWrite && (
            <Link href="/guide/nuovo">
              <Button><Plus className="h-4 w-4" /> Nuova guida</Button>
            </Link>
          )}
          <Suspense>
            <SortSelect options={SORT_OPTIONS} />
          </Suspense>
        </div>
      </div>

      {guides && guides.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => {
            const game = one<{ name: string }>(g.games);
            return (
            <Link key={g.id} href={`/guide/${g.slug}`}>
              <Card className="h-full hover:border-[var(--color-primary)] transition-colors">
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {g.category && <Badge variant="accent">{g.category}</Badge>}
                    {game?.name && <Badge>{game.name}</Badge>}
                  </div>
                  <h3 className="font-bold text-lg">{g.title}</h3>
                  {g.excerpt && <p className="text-sm text-[var(--color-fg-muted)] line-clamp-3">{g.excerpt}</p>}
                  <div className="text-xs text-[var(--color-fg-muted)]">{formatDate(g.created_at)}</div>
                </CardBody>
              </Card>
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
