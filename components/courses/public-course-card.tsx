import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, GraduationCap, Heart, ArrowUpRight, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatCompactNumber } from "@/lib/format-count";

interface PublicCourseCardProps {
  course: {
    slug: string;
    title: string;
    smallDescription: string;
    duration: number;
    createdAt: Date;
    price: number;
    level: string;
    university: string | null;
    fileKey: string | null;
    enrolledCount: number;
    likeCount: number;
    isEnrolled: boolean;
    user: {
      name: string;
      image: string | null;
    };
  };
}

export function PublicCourseCard({ course }: PublicCourseCardProps) {
  // Enrolled students go straight to the study page — the marketplace
  // page (description, "contact developer", etc.) has nothing new for
  // them at that point.
  const destination = course.isEnrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:-translate-y-0.75">
      <Link href={destination} className="flex flex-1 flex-col">
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
              <BookOpen className="size-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
          {course.university && (
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {course.university}
            </p>
          )}

          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {course.title}
          </h3>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.smallDescription}
          </p>

          {/* Creator row + enrolled/likes stats */}
          <div className="flex items-center justify-between gap-2 border-t pt-3 mt-1">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                {course.user.image ? (
                  <Image
                    src={course.user.image}
                    alt={course.user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs font-medium">
                      {course.user.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">
                  {course.user.name}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Creator
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-6 pr-2">
              <span className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <GraduationCap className="size-3.5 text-muted-foreground" />
                  {formatCompactNumber(course.enrolledCount)}
                </span>
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  Enrolled
                </span>
              </span>
              <span className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Heart className="size-3.5 text-muted-foreground" />
                  {formatCompactNumber(course.likeCount)}
                </span>
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                  Likes
                </span>
              </span>
            </div>
          </div>

          {/* Price/duration + created date */}
          <div className="flex items-center justify-between gap-2 pt-1 pb-1">
            <span className="flex items-center gap-2">
              {course.isEnrolled ? (
                <span className="font-semibold text-primary">Owned</span>
              ) : (
                <span className="text-primary">
                  <span className="font-semibold">{course.price}</span>{" "}
                  <span className="text-xs font-normal text-muted-foreground">EGP</span>
                </span>
              )}
              <span className="text-muted-foreground/40">&bull;</span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {course.duration}h
              </span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              Created {formatRelativeTime(course.createdAt)}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-1">
        <Link
          href={destination}
          className={cn(buttonVariants({ size: "default" }), "w-full gap-1")}
        >
          {course.isEnrolled ? "Open course" : "Explore course"}
          {course.isEnrolled ? (
            <PlayCircle className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </Link>
      </div>
    </div>
  );
}