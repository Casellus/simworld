"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { kickMember } from "../actions";

export function KickButton({ teamId, userId }: { teamId: string; userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("Rimuovere questo pilota dal team?")) return;
    setLoading(true);
    await kickMember(teamId, userId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button size="sm" variant="danger" disabled={loading} onClick={handle}>
      {loading ? "..." : "Rimuovi"}
    </Button>
  );
}
