"use client";

import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const OPTIONS = [
  { value: "recenti", label: "Più recenti" },
  { value: "rating",  label: "Valutazione" },
  { value: "az",      label: "A → Z" },
  { value: "za",      label: "Z → A" },
];

export function AssettiSort({ current, tipo, gioco, q }: {
  current: string;
  tipo: string;
  gioco?: string;
  q?: string;
}) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    params.set("tipo", tipo);
    if (gioco) params.set("gioco", gioco);
    if (q) params.set("q", q);
    if (e.target.value !== "recenti") params.set("ordina", e.target.value);
    router.push(`/assetti?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-3">
      <SlidersHorizontal className="h-4 w-4 text-[var(--color-fg-muted)] shrink-0" />
      <select
        value={current}
        onChange={onChange}
        className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1a2e]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
