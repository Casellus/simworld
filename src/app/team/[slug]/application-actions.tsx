"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateApplication } from "../actions";

export function ApplicationActions({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState<"accepted" | "rejected" | null>(null);
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);

  async function handle(status: "accepted" | "rejected") {
    setLoading(status);
    await updateApplication(applicationId, status);
    setDone(status);
    setLoading(null);
  }

  if (done) {
    return (
      <p className="text-xs text-[var(--color-fg-muted)]">
        {done === "accepted" ? "Candidatura accettata." : "Candidatura rifiutata."}
      </p>
    );
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        variant="primary"
        disabled={!!loading}
        onClick={() => handle("accepted")}
      >
        {loading === "accepted" ? "..." : "Accetta"}
      </Button>
      <Button
        size="sm"
        variant="danger"
        disabled={!!loading}
        onClick={() => handle("rejected")}
      >
        {loading === "rejected" ? "..." : "Rifiuta"}
      </Button>
    </div>
  );
}
