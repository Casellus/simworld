import { notFound } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Mail, ExternalLink, User as UserIcon, Flag } from "lucide-react";
import { PostActions } from "../post-actions";
import { one } from "@/lib/types";
import { getUserId } from "@/lib/auth";

export default async function AnnuncioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("recruitment_posts")
    .select("*, games(name, slug), teams(name, slug)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const [{ data: author }, userId] = await Promise.all([
    supabase.from("profiles").select("username, display_name, avatar_url, cover_url").eq("id", post.user_id).maybeSingle(),
    getUserId(),
  ]);

  const game = one<{ name: string; slug: string }>(post.games);
  const team = one<{ name: string; slug: string }>(post.teams);
  const isOwner = !!userId && userId === post.user_id;
  const isPilota = post.post_type === "cerca_pilota";
  const authorName = author?.display_name || author?.username || "Utente";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <BackButton href="/cerca" label="Tutti gli annunci" />

      <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elev)] shadow-xl">
        {/* Cover del profilo (o gradiente racing) */}
        <div className="relative h-36 sm:h-44 overflow-hidden">
          {author?.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#0d1b3e] via-[#1a1a2e] to-[#050507]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-elev)] to-transparent" />
          {/* badge tipo */}
          <span className={`absolute top-4 right-4 z-[2] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
            isPilota
              ? "bg-blue-500/25 text-blue-200 border border-blue-500/40"
              : "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40"
          }`}>
            {isPilota ? <Flag className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
            {isPilota ? "Team cerca pilota" : "Pilota cerca team"}
          </span>
        </div>

        {/* Avatar che sborda + azioni owner */}
        <div className="px-6 relative">
          <div className="absolute -top-9 h-[72px] w-[72px] rounded-full overflow-hidden border-4 border-[var(--color-bg-elev)] bg-[var(--color-bg-elev-2)] flex items-center justify-center text-lg font-bold text-[var(--color-primary)] z-[2]">
            {author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={author.avatar_url} alt={authorName} className="object-cover w-full h-full" />
            ) : (
              authorName.slice(0, 2).toUpperCase()
            )}
          </div>
          {isOwner && (
            <div className="absolute right-6 top-3 z-[2]">
              <PostActions postId={post.id} />
            </div>
          )}
        </div>

        {/* Contenuto */}
        <div className="px-6 pt-12 pb-6 space-y-5">
          {/* Autore + meta */}
          <div>
            <p className="font-bold text-lg text-white leading-tight" style={{ fontFamily: "var(--font-heading)" }}>{authorName}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-fg-muted)] mt-1">
              {team && (
                <Link href={`/team/${team.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {team.name}
                </Link>
              )}
              {team && <span>·</span>}
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          {/* Gioco + titolo */}
          <div>
            {game?.name && (
              <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wide">{game.name}</span>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mt-1">
              {post.title}
            </h1>
          </div>

          {/* Descrizione */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
          </div>

          {/* Contatto */}
          {post.contact && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-3">
                Contatto
              </h2>
              <ContactDisplay contact={post.contact} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactDisplay({ contact }: { contact: string }) {
  const isUrl = /^https?:\/\//i.test(contact.trim());
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());

  if (isUrl) {
    const label = contact.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return (
      <a
        href={contact.trim()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-sm font-semibold hover:bg-[var(--color-primary)]/20 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        {label}
      </a>
    );
  }

  if (isEmail) {
    return (
      <a
        href={`mailto:${contact.trim()}`}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        <Mail className="h-4 w-4" />
        {contact.trim()}
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
      <Mail className="h-3.5 w-3.5 text-[var(--color-primary)]" />
      {contact}
    </span>
  );
}
