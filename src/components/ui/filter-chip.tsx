"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  paramKey: string;
  value: string | null;
  label: string;
  baseHref: string;
}

export function FilterChip({ paramKey, value, label, baseHref }: FilterChipProps) {
  const searchParams = useSearchParams();

  const current = searchParams.get(paramKey);
  const isActive = value === null ? !current : current === value;

  const params = new URLSearchParams(searchParams.toString());
  if (value === null || isActive) {
    params.delete(paramKey);
  } else {
    params.set(paramKey, value);
  }
  const qs = params.toString();
  const href = `${baseHref}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      prefetch={true}
      scroll={false}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
        isActive
          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
          : "bg-[var(--color-bg-elev)] text-[var(--color-fg-muted)] border-[var(--color-border)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
      )}
    >
      {label}
    </Link>
  );
}
