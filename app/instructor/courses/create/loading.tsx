import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CreateCourseLoading() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Skeleton className="size-9 rounded-md shrink-0" />
        <Skeleton className="h-8 w-44" />
      </div>

      <Card className="w-full max-w-4xl mx-auto mt-6">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Slug + Generate button */}
          <div className="flex gap-4 items-end">
            <div className="w-full space-y-1.5">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-36 shrink-0" />
          </div>

          {/* Small description */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-30 w-full" />
          </div>

          {/* Description (rich text editor) */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-40 w-full" />
          </div>

          {/* Thumbnail uploader */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>

          {/* Trailer uploader */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>

          {/* University select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Status select */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    </>
  );
}