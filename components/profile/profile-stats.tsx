import { Star, BookOpen } from "lucide-react";

interface ProfileStatsProps {
  likeCount: number;
  courseCount?: number;
}

export function ProfileStats({ likeCount, courseCount }: ProfileStatsProps) {
  return (
    <div className="flex gap-4">
      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 min-w-38">
        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
          <Star className="size-4" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">{likeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Likes</p>
        </div>
      </div>

      {courseCount !== undefined && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 min-w-38">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted">
            <BookOpen className="size-4" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none">{courseCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Courses</p>
          </div>
        </div>
      )}
    </div>
  );
}