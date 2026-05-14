import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Settings2, Plus, Settings, Bell } from "lucide-react";
import { NotificationsPanel } from "./notifications-panel";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard · SimUniverse" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: myEvents }, { data: myTeams }, { data: mySetups }, { data: myPosts }, { data: myNotifications }] = await Promise.all([
    supabase
      .from("events")
      .select("id, slug, title, start_at, event_type")
      .eq("host_user_id", profile.id)
      .order("start_at", { ascending: false })
      .limit(5),
    supabase.from("teams").select("id, slug, name, recruiting").eq("owner_id", profile.id),
    supabase
      .from("setups")
      .select("id, title, car, track, downloads")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("recruitment_posts")
      .select("id, title, post_type, active, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, title, body, link, read, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-[var(--color-fg-muted)] mt-1">Benvenuto, {profile.display_name || profile.username}.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/profilo/${profile.username}`}>
            <Button variant="outline" size="sm">
              Vedi profilo pubblico
            </Button>
          </Link>
          <Link href="/dashboard/impostazioni">
            <Button variant="secondary" size="sm">
              <Settings className="h-4 w-4" /> Impostazioni
            </Button>
          </Link>
        </div>
      </div>

      {myNotifications && myNotifications.length > 0 && (
        <div className="mb-8 border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-elev)]">
          <NotificationsPanel notifications={myNotifications} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="I miei eventi"
          icon={Calendar}
          createHref="/eventi/nuovo"
          createLabel="Nuovo evento"
          empty="Nessun evento creato."
        >
          {myEvents?.map((e) => (
            <Link key={e.id} href={`/eventi/${e.slug}`}>
              <Card className="hover:border-[var(--color-primary)]">
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm">{e.title}</h4>
                    <p className="text-xs text-[var(--color-fg-muted)]">{formatDate(e.start_at)}</p>
                  </div>
                  <Badge variant="primary">{e.event_type}</Badge>
                </CardBody>
              </Card>
            </Link>
          ))}
        </Section>

        <Section
          title="I miei team"
          icon={Users}
          createHref="/team/nuovo"
          createLabel="Nuovo team"
          empty="Nessun team."
        >
          {myTeams?.map((t) => (
            <Link key={t.id} href={`/team/${t.slug}`}>
              <Card className="hover:border-[var(--color-primary)]">
                <CardBody className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  {t.recruiting && <Badge variant="success">Recluta</Badge>}
                </CardBody>
              </Card>
            </Link>
          ))}
        </Section>

        <Section
          title="I miei assetti"
          icon={Settings2}
          createHref="/assetti/carica"
          createLabel="Carica"
          empty="Nessun assetto."
        >
          {mySetups?.map((s) => (
            <Link key={s.id} href={`/assetti/${s.id}`}>
              <Card className="hover:border-[var(--color-primary)]">
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm">{s.title}</h4>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {s.car} · {s.track}
                    </p>
                  </div>
                  <Badge>{s.downloads} DL</Badge>
                </CardBody>
              </Card>
            </Link>
          ))}
        </Section>

        <Section
          title="I miei annunci"
          icon={Users}
          createHref="/cerca/nuovo"
          createLabel="Nuovo annuncio"
          empty="Nessun annuncio."
        >
          {myPosts?.map((p) => (
            <Card key={p.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm">{p.title}</h4>
                  <p className="text-xs text-[var(--color-fg-muted)]">{formatDate(p.created_at)}</p>
                </div>
                <Badge variant={p.active ? "success" : "default"}>{p.active ? "Attivo" : "Chiuso"}</Badge>
              </CardBody>
            </Card>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  createHref,
  createLabel,
  empty,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  createHref: string;
  createLabel: string;
  empty: string;
  children: React.ReactNode;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const hasChildren = arr.filter(Boolean).length > 0;
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Icon className="h-4 w-4" /> {title}
        </h2>
        <Link href={createHref}>
          <Button size="sm" variant="ghost">
            <Plus className="h-3 w-3" /> {createLabel}
          </Button>
        </Link>
      </CardHeader>
      <CardBody>
        {hasChildren ? <div className="space-y-2">{children}</div> : <p className="text-sm text-[var(--color-fg-muted)]">{empty}</p>}
      </CardBody>
    </Card>
  );
}
