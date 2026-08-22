import { notFound } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, Badge } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Mail, ExternalLink, User as UserIcon } from "lucide-react";
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
    supabase.from("profiles").select("username, display_name").eq("id", post.user_id).maybeSingle(),
    getUserId(),
  ]);

  const game = one<{ name: string; slug: string }>(post.games);
  const team = one<{ name: string; slug: string }>(post.teams);
  const isOwner = !!userId && userId === post.user_id;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <BackButton href="/cerca" label="Tutti gli annunci" />

      <Card>
        <CardBody className="space-y-5 p-6">
          {/* Badge + owner actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={post.post_type === "cerca_pilota" ? "accent" : "primary"}>
                {post.post_type === "cerca_pilota" ? "Team cerca pilota" : "Pilota cerca team"}
              </Badge>
              {game?.name && <Badge>{game.name}</Badge>}
            </div>
            {isOwner && (
              <div className="relative z-[2]">
                <PostActions postId={post.id} />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-fg-muted)]">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              {author?.display_name || author?.username || "Utente"}
            </span>
            {team && (
              <Link
                href={`/team/${team.slug}`}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                · {team.name}
              </Link>
            )}
            <span>· {formatDate(post.created_at)}</span>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
          </div>

          {/* Contact */}
          {post.contact && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)] mb-3">
                Contatto
              </h2>
              <ContactDisplay contact={post.contact} />
            </div>
          )}
        </CardBody>
      </Card>
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
