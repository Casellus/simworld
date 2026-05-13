"use client";

import { useState } from "react";
import { Users, User as UserIcon, Pencil } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KickButton } from "./kick-button";

type Member = {
  user_id: string;
  role: string;
  profiles: { username: string; display_name: string | null; avatar_url: string | null }[];
};

export function RosterCard({
  members,
  teamId,
  ownerId,
  editable = false,
}: {
  members: Member[];
  teamId: string;
  ownerId: string;
  editable?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Users className="h-4 w-4" /> Roster ({members.length})
        </h2>
        {editable && (
          <Button size="sm" variant="ghost" onClick={() => setEditing((v) => !v)}>
            <Pencil className="h-3 w-3" />
            {editing ? "Fine" : "Modifica"}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {members.length > 0 ? (
          <ul className="space-y-3">
            {members.map((m) => {
              const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
              return (
                <li key={m.user_id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                    {p?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{p?.display_name || p?.username}</div>
                    <div className="text-xs text-[var(--color-fg-muted)] capitalize">{m.role}</div>
                  </div>
                  {editing && m.user_id !== ownerId && (
                    <KickButton teamId={teamId} userId={m.user_id} />
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-fg-muted)]">Nessun membro.</p>
        )}
      </CardBody>
    </Card>
  );
}
