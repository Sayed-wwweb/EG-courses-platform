import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, GraduationCap, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";
import { formatCompactNumber } from "@/lib/format-count";

interface ProfileCourse {
  id: string;
  slug: string;
  title: string;
  smallDescription: string;
  duration: number;
  price: number;
  status: string;
  fileKey: string | null;
  enrolledCount: number;
  likeCount: number;
}

interface ProfileCoursesGridProps {
  courses: ProfileCourse[];
  // Own profile -> link to the edit page. Someone else's public profile
  // -> link to the real course page, since a visitor doesn't own these
  // courses and can't get into the edit view anyway.
  isOwnProfile: boolean;
}

export function ProfileCoursesGrid({ courses, isOwnProfile }: ProfileCoursesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
        <BookOpen className="size-8" />
        <p className="text-sm">No courses yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {courses.map((course) => {
        const href = isOwnProfile
          ? `/instructor/courses/${course.id}/edit`
          : `/courses/${course.slug}`;

        return (
          <Link key={course.id} href={href} className="group">
            <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.75 h-full">
              <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-muted">
                {course.fileKey ? (
                  <Image
                    src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${course.fileKey}`}
                    alt={course.title}
                    className="object-cover"
                    fill
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="size-6 text-muted-foreground" />
                  </div>
                )}
                <Badge
                  variant={
                    course.status === "Published"
                      ? "default"
                      : course.status === "Draft"
                      ? "secondary"
                      : "outline"
                  }
                  className="absolute top-2 right-2 shadow-sm"
                >
                  {course.status}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3 px-4 pt-4">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary">
                  {course.title}
                </h3>

                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-muted/30">
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {course.duration}h
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Duration
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <GraduationCap className="size-3.5 text-muted-foreground" />
                      {formatCompactNumber(course.enrolledCount)}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Enrolled
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Heart className="size-3.5 text-muted-foreground" />
                      {formatCompactNumber(course.likeCount)}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Likes
                    </span>
                  </div>
                </div>

                <span className="text-primary text-lg font-semibold pb-4">
                  {course.price}{" "}
                  <span className="text-xs font-normal text-muted-foreground">EGP</span>
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}