"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { deleteRecruitmentPost } from "./actions";

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteRecruitmentPost(postId);
    if (res.error) { alert(res.error); setLoading(false); return; }
    router.refresh();
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--color-fg-muted)]">Sicuro?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
          {loading ? "..." : "Sì"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/cerca/${postId}/modifica`}>
        <Button variant="ghost" size="sm" title="Modifica annuncio">
          <Pencil className="h-3 w-3" />
        </Button>
      </Link>
      <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} title="Elimina">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
