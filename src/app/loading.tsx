import { Skeleton, CardGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <section className="min-h-[88vh] flex items-center bg-[#050507]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full flex flex-col items-center text-center gap-6">
          <Skeleton className="h-16 md:h-24 w-3/4 max-w-2xl" />
          <Skeleton className="h-6 w-2/3 max-w-md" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-12 w-44 rounded-lg" />
            <Skeleton className="h-12 w-44 rounded-lg" />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <Skeleton className="h-8 w-64 mb-8" />
        <CardGridSkeleton count={3} />
      </div>
    </>
  );
}
