"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTeam } from "../actions";

export function TeamDeleteButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteTeam(teamId);
    if (res.error) {
      alert(res.error);
      setLoading(false);
      return;
    }
    router.push("/team");
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-fg-muted)]">Sicuro?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "Elimina"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
          Annulla
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirm(true)}>
      <Trash2 className="h-4 w-4" /> Elimina
    </Button>
  );
}
