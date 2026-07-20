import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function InstructorCourseCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden p-0">
      <Skeleton className="relative w-full aspect-video rounded-none" />

      <CardContent className="pt-4 pb-2 space-y-2">
        <div className="flex justify-end">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />

        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full ml-auto" />
        </div>

        <Skeleton className="h-7 w-full rounded-full" />
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </CardFooter>
    </Card>
  );
}