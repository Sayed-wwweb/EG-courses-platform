import { Skeleton } from "@/components/ui/skeleton";

export default function EditCourseLoading() {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-md shrink-0" />
          <Skeleton className="h-7 w-40" />
        </div>
        <div className="grid grid-cols-3 gap-3 w-full sm:inline-flex sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-28" />
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto rounded-xl border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="aspect-video w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="aspect-video w-full rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}