import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/auth";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Car, MapPin, User as UserIcon, Pencil, Cpu } from "lucide-react";
import { SIM_CATEGORIES } from "@/lib/constants";
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
    .select("id, user_id, title, car, track, conditions, notes, file_url, photo_url, rating_sum, rating_count, downloads, created_at, setup_type, category, games(name)")
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

  const userId = await getUserId();

  let myVote = 0;
  if (userId) {
    const { data } = await supabase
      .from("setup_votes")
      .select("value")
      .eq("setup_id", id)
      .eq("user_id", userId)
      .maybeSingle();
    myVote = data?.value || 0;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <Link href="/assetti" className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] mb-4 inline-block">
        ← Tutti gli assetti
      </Link>

      {setup.photo_url && (
        <div className="mb-8 rounded-xl overflow-hidden w-full relative h-80">
          <Image src={setup.photo_url} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" priority />
        </div>
      )}

      <div className="mb-8">
        <Badge className="mb-3">{game?.name}</Badge>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{setup.title}</h1>
            <p className="text-sm text-[var(--color-fg-muted)] mt-2">
              di{" "}
              <Link
                href={`/profilo/${author?.username}`}
                className="text-[var(--color-fg)] font-medium hover:text-[var(--color-primary)]"
              >
                {author?.username || author?.display_name}
              </Link>
              {" · "}
              {formatDate(setup.created_at)}
            </p>
          </div>
          {userId && userId === setup.user_id && (
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
              {setup.setup_type === "simulatore" ? (
                setup.category && (
                  <InfoRow
                    icon={Cpu}
                    label="Categoria"
                    value={SIM_CATEGORIES.find((c) => c.value === setup.category)?.label ?? setup.category}
                  />
                )
              ) : (
                <>
                  <InfoRow icon={Car} label="Auto" value={setup.car} />
                  <InfoRow icon={MapPin} label="Tracciato" value={setup.track} />
                  {setup.conditions && <InfoRow icon={UserIcon} label="Condizioni" value={setup.conditions} />}
                </>
              )}
            </CardBody>
          </Card>

          {setup.notes && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-bold">Note</h2>
              </CardHeader>
              <CardBody className="relative">
                {userId ? (
                  <p className="whitespace-pre-wrap text-sm">{setup.notes}</p>
                ) : (
                  // Notes must NOT be sent to the client for anonymous visitors —
                  // rendering them (even blurred) leaks them in the HTML source.
                  // Show a locked placeholder with fixed height instead.
                  <div className="relative min-h-24">
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-bg-elev)]/70 rounded-b-xl gap-3">
                      <p className="text-sm font-semibold text-[var(--color-fg)]">Accedi per leggere le note</p>
                      <div className="flex gap-2">
                        <Link href="/auth/login"><Button size="sm">Accedi</Button></Link>
                        <Link href="/auth/register"><Button size="sm" variant="outline">Registrati</Button></Link>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-[var(--color-success)]" /> Mi piace
                </span>
                <span className="font-bold">{setup.rating_sum > 0 ? setup.rating_sum : 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-[var(--color-danger)]" /> Non mi piace
                </span>
                <span className="font-bold">{setup.rating_sum < 0 ? -setup.rating_sum : 0}</span>
              </div>
              <div className="pt-3 border-t border-[var(--color-border)] space-y-2">
                {setup.file_url && <DownloadButton setupId={setup.id} fileUrl={setup.file_url} />}
                <VoteButtons setupId={setup.id} myVote={myVote} isLogged={!!userId} />
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
      <div className="text-xs font-semibold text-[var(--color-fg-muted)] flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
