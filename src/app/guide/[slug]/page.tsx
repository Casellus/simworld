import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Badge } from "@/components/ui/card";
import { VideoEmbed } from "@/components/video-embed";
import { GuideOwnerActions } from "./guide-owner-actions";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function GuidaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data: guide }, viewerId] = await Promise.all([
    supabase
      .from("guides")
      .select("*, games(name), profiles:author_id(username, display_name)")
      .eq("slug", slug)
      .single(),
    getUserId(),
  ]);

  // Guida non trovata, oppure bozza non del proprietario.
  if (!guide || (!guide.published && guide.author_id !== viewerId)) notFound();
  const isOwner = !!viewerId && viewerId === guide.author_id;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BackButton href="/guide" label="Tutte le guide" />
        {isOwner && <GuideOwnerActions guideId={guide.id} slug={guide.slug} />}
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-4 mt-2">
        {guide.category && <Badge variant="accent">{guide.category}</Badge>}
        {guide.games?.name && <Badge>{guide.games.name}</Badge>}
        {!guide.published && <Badge variant="primary">Bozza</Badge>}
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{guide.title}</h1>
      <p className="text-sm text-[var(--color-fg-muted)] mt-3">
        {guide.profiles?.display_name || guide.profiles?.username || "—"} · {formatDate(guide.created_at)}
      </p>

      {guide.video_url && (
        <div className="mt-8">
          <VideoEmbed url={guide.video_url} />
        </div>
      )}

      <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-[var(--color-fg)] leading-relaxed">
        {guide.body}
      </div>
    </article>
  );
}
