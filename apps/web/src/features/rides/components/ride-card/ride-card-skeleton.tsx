import { Skeleton } from '@/components/ui/skeleton';

export function RideCardSkeleton() {
  return (
    <div
      aria-hidden
      className="bg-card border-border flex flex-col overflow-hidden rounded-xl border shadow-sm"
    >
      <Skeleton className="aspect-[360/80] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="border-border flex items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}
