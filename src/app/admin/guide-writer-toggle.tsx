"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Toggle per assegnare/revocare il ruolo creator (can_write_guides) a un utente.
export function GuideWriterToggle({
  userId,
  enabled,
  action,
}: {
  userId: string;
  enabled: boolean;
  action: (userId: string, value: boolean) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    const res = await action(userId, !enabled);
    if (res.error) {
      alert(res.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <Button
      variant={enabled ? "danger" : "primary"}
      size="sm"
      onClick={handle}
      disabled={loading}
    >
      {loading ? "..." : enabled ? "Revoca" : "Autorizza"}
    </Button>
  );
}
