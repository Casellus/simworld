import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminDeleteButton } from "./delete-button";
import { adminDeleteSetup, adminDeleteEvent, adminDeleteTeam, adminDeletePost } from "./actions";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin · SimUniverse" };

const ADMIN_EMAIL = "samuelcasella06@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const adminClient = createAdminClient();
  const { data: authData } = await adminClient.auth.admin.getUserById(user.id);
  if (authData?.user?.email !== ADMIN_EMAIL) redirect("/");

  const [
    { data: setups },
    { data: events },
    { data: teams },
    { data: posts },
  ] = await Promise.all([
    supabase.from("setups").select("id, title, car, track, created_at, user_id").order("created_at", { ascending: false }),
    supabase.from("events").select("id, slug, title, event_type, start_at, host_user_id").order("created_at", { ascending: false }),
    supabase.from("teams").select("id, slug, name, created_at, owner_id").order("created_at", { ascending: false }),
    supabase.from("recruitment_posts").select("id, title, post_type, active, created_at, user_id").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Pannello Admin</h1>
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
    </div>
  );
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-bold uppercase tracking-wider text-sm">{title}</h2>
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
