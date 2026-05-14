"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function AdminDeleteButton({
  action,
}: {
  action: () => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const res = await action();
    if (res.error) {
      alert(res.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="danger" size="sm" onClick={handle} disabled={loading}>
          {loading ? "..." : "Sì"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>No</Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
