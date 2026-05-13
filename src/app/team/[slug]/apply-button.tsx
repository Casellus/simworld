"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { joinTeam } from "../actions";

export function ApplyButton({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    const res = await joinTeam(teamId, message);
    setLoading(false);
    if (res.error) {
      setError(res.error.includes("unique") ? "Hai già inviato una candidatura a questo team." : res.error);
      return;
    }
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return (
      <div className="px-4 py-2 rounded border border-[var(--color-success)] text-[var(--color-success)] text-sm font-medium">
        Candidatura inviata!
      </div>
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>Candidati</Button>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 space-y-3 bg-[var(--color-bg-elev)] min-w-[280px]">
      <p className="text-sm font-bold uppercase tracking-wider">Invia candidatura</p>
      <div>
        <Label htmlFor="apply-msg">Messaggio (opzionale)</Label>
        <Textarea
          id="apply-msg"
          rows={3}
          placeholder="Presentati, spiega perché vuoi unirti..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={handleApply} disabled={loading} className="flex-1">
          {loading ? "Invio..." : "Invia"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
      </div>
    </div>
  );
}
