import { Skeleton } from "@/components/ui/skeleton";
import { PublicCourseCardSkeleton } from "@/components/courses/public-course-card-skeleton";
import { BookOpen, Bookmark } from "lucide-react";

export default function LibraryLoading() {
  return (
    <div className="py-8 space-y-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Purchased courses</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PublicCourseCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Saved for later</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PublicCourseCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}