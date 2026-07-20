import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6">
      {/* Chapters + Files */}
      <div className="space-y-6 order-3 lg:order-1">
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      {/* Trailer + Description */}
      <div className="space-y-6 order-2 lg:order-2">
        <Skeleton className="w-full aspect-video rounded-xl" />

        <div className="rounded-xl border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Creator + Sidebar */}
      <div className="space-y-6 order-1 lg:order-3">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-4">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}