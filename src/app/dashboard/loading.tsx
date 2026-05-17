import { Skeleton, CardGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
