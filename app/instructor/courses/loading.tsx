import { Skeleton } from "@/components/ui/skeleton";
import { InstructorCourseCardSkeleton } from "@/components/courses/instructor-course-card-skeleton";

export default function InstructorCoursesLoading() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-11 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <InstructorCourseCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}