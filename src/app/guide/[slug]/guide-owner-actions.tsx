"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { deleteGuide } from "../actions";

export function GuideOwnerActions({ guideId, slug }: { guideId: string; slug: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteGuide(guideId);
    if (res.error) { alert(res.error); setLoading(false); return; }
    router.push("/guide");
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-fg-muted)]">Eliminare la guida?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "Elimina"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Annulla</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/guide/${slug}/modifica`}>
        <Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /> Modifica</Button>
      </Link>
      <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
        <Trash2 className="h-4 w-4" /> Elimina
      </Button>
    </div>
  );
}
