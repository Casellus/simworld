"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Form per autorizzare un nuovo creator cercandolo per username.
export function GuideWriterAdd({
  action,
}: {
  action: (username: string) => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    const res = await action(username);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setUsername("");
    setOk(true);
    router.refresh();
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(null); setOk(false); }}
          placeholder="username da autorizzare"
          className="h-9 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={loading || !username.trim()}>
          {loading ? "..." : "Autorizza"}
        </Button>
      </div>
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
      {ok && <p className="text-xs text-green-400">Creator autorizzato.</p>}
    </form>
  );
}
