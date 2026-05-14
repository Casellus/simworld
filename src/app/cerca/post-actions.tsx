"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, EyeOff } from "lucide-react";
import { deleteRecruitmentPost, closeRecruitmentPost } from "./actions";

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

  async function handleClose() {
    setLoading(true);
    await closeRecruitmentPost(postId);
    router.refresh();
    setLoading(false);
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
      <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading} title="Chiudi annuncio">
        <EyeOff className="h-3 w-3" />
      </Button>
      <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} title="Elimina">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
