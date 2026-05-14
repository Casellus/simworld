import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Guide · SimUniverse" };

export default async function GuidePage() {
  const supabase = await createClient();
  const { data: guides } = await supabase
    .from("guides")
    .select("id, slug, title, excerpt, category, cover_url, created_at, games(name)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Guide</h1>
        <p className="text-[var(--color-fg-muted)] mt-1">Consigli, tutorial, FFB, hardware, tecniche di guida.</p>
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
            <h3 className="font-bold uppercase mb-1">Guide in arrivo</h3>
            <p className="text-sm text-[var(--color-fg-muted)]">Le prime guide saranno disponibili a breve.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
