import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} />;
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] overflow-hidden">
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <CardGridSkeleton count={cards} />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-48 md:h-64 w-full rounded-xl mb-6" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}
