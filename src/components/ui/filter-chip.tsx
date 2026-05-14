"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  paramKey: string;
  value: string | null;
  label: string;
  baseHref: string;
}

export function FilterChip({ paramKey, value, label, baseHref }: FilterChipProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get(paramKey);
  const isActive = value === null ? !current : current === value;

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || isActive) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(`${baseHref}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors disabled:opacity-60",
        isActive
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
          : "bg-[var(--color-bg-elev)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
      )}
    >
      {label}
    </button>
  );
}
