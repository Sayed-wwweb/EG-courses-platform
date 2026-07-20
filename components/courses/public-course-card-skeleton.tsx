import { Skeleton } from "@/components/ui/skeleton";

export function PublicCourseCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Skeleton className="w-full aspect-video rounded-none" />

      <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>

        <Skeleton className="h-4 w-16" />
      </div>

      <div className="flex flex-col gap-3 items-end border-t bg-muted/40 px-4 py-3">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}