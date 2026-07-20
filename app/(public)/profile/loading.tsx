import { Skeleton } from "@/components/ui/skeleton";
import { PublicCourseCardSkeleton } from "@/components/courses/public-course-card-skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <Skeleton className="relative h-36 rounded-b-2xl sm:h-44 rounded-t-none" />

      <div className="px-4 sm:px-6">
        <div className="-mt-14 flex items-end justify-between sm:-mt-16">
          <Skeleton className="rounded-full ring-4 ring-background mb-5 size-24" />
          <div className="pt-20">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <Skeleton className="mt-1 h-6 w-40" />
        <Skeleton className="mt-2 h-4 w-52" />

        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-lg" />

        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Skeleton className="h-16 w-38 rounded-lg" />
          <Skeleton className="h-16 w-38 rounded-lg" />
        </div>

        <div className="mt-6 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md shrink-0" />
          </div>
        </div>

        <div className="mt-8">
          <Skeleton className="h-7 w-24 mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PublicCourseCardSkeleton />
            <PublicCourseCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}