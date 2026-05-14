import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ThumbsUp, ThumbsDown, Car, MapPin, User as UserIcon, Pencil } from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { DownloadButton } from "./download-button";
import { SetupDeleteButton } from "./delete-button";
import { formatDate } from "@/lib/utils";
import { one } from "@/lib/types";

export default async function SetupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: setup } = await supabase
    .from("setups")
    .select("*, games(name)")
    .eq("id", id)
    .single();

  if (!setup) notFound();

  const game = one<{ name: string }>(setup.games);

  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", setup.user_id)
    .maybeSingle();
  const author = authorProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myVote = 0;
  if (user) {
    const { data } = await supabase
      .from("setup_votes")
      .select("value")
      .eq("setup_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    myVote = data?.value || 0;
  }

  const { data: comments } = await supabase
    .from("setup_comments")
    .select("id, body, created_at, user_id")
    .eq("setup_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Link href="/assetti" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4 inline-block">
        ← Tutti gli assetti
      </Link>

      <div className="mb-8">
        <Badge className="mb-3">{game?.name}</Badge>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{setup.title}</h1>
            <p className="text-sm text-[var(--color-fg-muted)] mt-2">
              di{" "}
              <Link
                href={`/profilo/${author?.username}`}
                className="text-[var(--color-fg)] font-medium hover:text-[var(--color-primary)]"
              >
                {author?.display_name || author?.username}
              </Link>
              {" · "}
              {formatDate(setup.created_at)}
            </p>
          </div>
          {user && user.id === setup.user_id && (
            <div className="flex gap-2 shrink-0">
              <Link href={`/assetti/${setup.id}/modifica`}>
                <Button variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" /> Modifica
                </Button>
              </Link>
              <SetupDeleteButton setupId={setup.id} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardBody className="grid grid-cols-2 gap-4">
              <InfoRow icon={Car} label="Auto" value={setup.car} />
              <InfoRow icon={MapPin} label="Tracciato" value={setup.track} />
              {setup.conditions && <InfoRow icon={UserIcon} label="Condizioni" value={setup.conditions} />}
            </CardBody>
          </Card>

          {setup.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold uppercase tracking-wider">Note</h2>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm">{setup.notes}</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-sm font-bold uppercase tracking-wider">Commenti ({comments?.length || 0})</h2>
            </CardHeader>
            <CardBody>
              {comments && comments.length > 0 ? (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="text-sm border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="text-xs text-[var(--color-fg-muted)] mb-1">
                        {formatDate(c.created_at)}
                      </div>
                      <p className="whitespace-pre-wrap">{c.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-fg-muted)]">Nessun commento ancora.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-[var(--color-primary)]" /> Download
                </span>
                <span className="font-bold">{setup.downloads}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-[var(--color-success)]" /> Up
                </span>
                <span className="font-bold">{setup.rating_sum > 0 ? setup.rating_sum : 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-[var(--color-danger)]" /> Down
                </span>
                <span className="font-bold">{setup.rating_sum < 0 ? -setup.rating_sum : 0}</span>
              </div>
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                {setup.file_url && <DownloadButton setupId={setup.id} fileUrl={setup.file_url} />}
                <VoteButtons setupId={setup.id} myVote={myVote} isLogged={!!user} />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
