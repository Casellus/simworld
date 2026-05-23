"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

export function SortSelect({ options, paramKey = "ordina", defaultValue = options[0]?.value ?? "" }: {
  options: { value: string; label: string }[];
  paramKey?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? defaultValue;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === defaultValue) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, e.target.value);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1.5 h-10 rounded border border-[var(--color-border)] bg-[var(--color-bg-elev)] px-2">
      <SlidersHorizontal className="h-4 w-4 text-[var(--color-fg-muted)] shrink-0" />
      <select
        value={current}
        onChange={onChange}
        className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1a2e]">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
