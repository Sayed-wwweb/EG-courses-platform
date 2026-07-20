import { Skeleton } from "@/components/ui/skeleton";
import { PublicCourseCardSkeleton } from "@/components/courses/public-course-card-skeleton";

export default function CoursesLoading() {
  return (
    <div className="py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-56" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PublicCourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
