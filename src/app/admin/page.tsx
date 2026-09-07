import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminDeleteButton } from "./delete-button";
import { GuideWriterToggle } from "./guide-writer-toggle";
import { GuideWriterAdd } from "./guide-writer-add";
import { adminDeleteSetup, adminDeleteEvent, adminDeleteTeam, adminDeletePost, adminDeleteGuide, adminSetGuideWriter, adminSetGuideWriterByUsername } from "./actions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Admin · SimUniverse" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const supabase = await createClient();

  const [
    { data: setups },
    { data: events },
    { data: teams },
    { data: posts },
    { data: guides },
    { data: writers },
  ] = await Promise.all([
    supabase.from("setups").select("id, title, car, track, created_at, user_id").order("created_at", { ascending: false }),
    supabase.from("events").select("id, slug, title, event_type, start_at, host_user_id").order("created_at", { ascending: false }),
    supabase.from("teams").select("id, slug, name, created_at, owner_id").order("created_at", { ascending: false }),
    supabase.from("recruitment_posts").select("id, title, post_type, active, created_at, user_id").order("created_at", { ascending: false }),
    supabase.from("guides").select("id, slug, title, category, published, created_at, author_id").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, username, display_name, can_write_guides").eq("can_write_guides", true).order("username"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Pannello Admin</h1>
        <p className="text-sm text-[var(--color-fg-muted)]">Accesso riservato. Gestisci tutti i contenuti della piattaforma.</p>
      </div>

      <AdminSection title={`Assetti (${setups?.length ?? 0})`}>
        {setups?.map((s) => (
          <Row
            key={s.id}
            label={s.title}
            sub={`${s.car} · ${s.track}`}
            meta={formatDate(s.created_at)}
            action={<AdminDeleteButton action={adminDeleteSetup.bind(null, s.id)} />}
          />
        ))}
      </AdminSection>

      <AdminSection title={`Eventi (${events?.length ?? 0})`}>
        {events?.map((e) => (
          <Row
            key={e.id}
            label={e.title}
            sub={e.event_type}
            meta={formatDate(e.start_at)}
            action={<AdminDeleteButton action={adminDeleteEvent.bind(null, e.id)} />}
          />
        ))}
      </AdminSection>

      <AdminSection title={`Team (${teams?.length ?? 0})`}>
        {teams?.map((t) => (
          <Row
            key={t.id}
            label={t.name}
            sub={`/team/${t.slug}`}
            meta={formatDate(t.created_at)}
            action={<AdminDeleteButton action={adminDeleteTeam.bind(null, t.id)} />}
          />
        ))}
      </AdminSection>

      <AdminSection title={`Annunci cerca pilota/team (${posts?.length ?? 0})`}>
        {posts?.map((p) => (
          <Row
            key={p.id}
            label={p.title}
            sub={p.post_type}
            meta={`${formatDate(p.created_at)} · ${p.active ? "Attivo" : "Chiuso"}`}
            action={<AdminDeleteButton action={adminDeletePost.bind(null, p.id)} />}
          />
        ))}
      </AdminSection>

      <AdminSection title={`Guide (${guides?.length ?? 0})`}>
        {guides?.map((g) => (
          <Row
            key={g.id}
            label={g.title}
            sub={`${g.category ?? "senza categoria"}${g.published === false ? " · bozza" : ""}`}
            meta={formatDate(g.created_at)}
            action={
              <div className="flex items-center gap-1">
                <Link
                  href={`/guide/${g.slug}/modifica`}
                  className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Modifica
                </Link>
                <AdminDeleteButton action={adminDeleteGuide.bind(null, g.id)} />
              </div>
            }
          />
        ))}
      </AdminSection>

      <AdminSection title={`Creator autorizzati (${writers?.length ?? 0})`}>
        <p className="pb-2 text-xs text-[var(--color-fg-muted)]">
          Chi ha il ruolo può creare e pubblicare guide. Autorizza un utente qui sotto tramite username.
        </p>
        {writers?.map((w) => (
          <Row
            key={w.id}
            label={w.display_name || w.username || w.id}
            sub={w.username ? `@${w.username}` : "senza username"}
            meta="creator"
            action={
              <GuideWriterToggle userId={w.id} enabled action={adminSetGuideWriter} />
            }
          />
        ))}
        <div className="pt-3">
          <GuideWriterAdd action={adminSetGuideWriterByUsername} />
        </div>
      </AdminSection>
    </div>
  );
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-bold text-sm">{title}</h2>
      </CardHeader>
      <CardBody>
        <div className="divide-y divide-[var(--color-border)]">{children}</div>
      </CardBody>
    </Card>
  );
}

function Row({ label, sub, meta, action }: { label: string; sub: string; meta: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{label}</div>
        <div className="text-xs text-[var(--color-fg-muted)] truncate">{sub} · {meta}</div>
      </div>
      {action}
    </div>
  );
}
