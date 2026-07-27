import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, GraduationCap, Heart, Library, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatCompactNumber } from "@/lib/format-count";
import { CourseLikeButton } from "./course-like-button";
import { SaveCourseButton } from "./save-course-button";
import { ContactDeveloperDialog } from "./contact-developer-dialog";
import { toggleCourseLike } from "../like-actions";
import { toggleSavedCourse } from "../saved-actions";

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    smallDescription: string;
    university: string | null;
    duration: number;
    createdAt: Date;
    price: number;
    fileKey: string | null;
  };
  isEnrolled: boolean;
  isOwnCourse: boolean;
  alreadyLikedCourse: boolean;
  showLikeButton: boolean;
  alreadySavedCourse: boolean;
  showSaveButton: boolean;
  enrolledCount: number;
  likeCount: number;
}

export function CourseSidebar({
  course,
  isEnrolled,
  isOwnCourse,
  alreadyLikedCourse,
  showLikeButton,
  alreadySavedCourse,
  showSaveButton,
  enrolledCount,
  likeCount,
}: CourseSidebarProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
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

      <div className="p-4 space-y-3">
        {course.university && (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {course.university}
          </p>
        )}

        <div className="space-y-1">
          <h1 className="text-lg font-semibold leading-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.smallDescription}
          </p>
        </div>

        {/* Enrolled/likes stats */}
        <div className="flex items-center justify-center gap-8 rounded-lg border bg-muted/30 px-3 py-2">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <GraduationCap className="size-4 text-muted-foreground" />
            {formatCompactNumber(enrolledCount)}
            <span className="text-xs font-normal text-muted-foreground">enrolled</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Heart className="size-4 text-muted-foreground" />
            {formatCompactNumber(likeCount)}
            <span className="text-xs font-normal text-muted-foreground">likes</span>
          </span>
        </div>

        {/* Price/duration + created date */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {isOwnCourse ? (
              <span className="text-primary">
                <span className="font-semibold">{course.price}</span>{" "}
                <span className="text-xs font-normal text-muted-foreground">EGP</span>
              </span>
            ) : isEnrolled ? (
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

        <div className="pt-2">
          {isOwnCourse ? (
            <Link
              href={`/instructor/courses/${course.id}/edit`}
              className={cn(buttonVariants({ size: "default" }), "w-full gap-1")}
            >
              Edit course
              <Pencil className="size-3.5" />
            </Link>
          ) : isEnrolled ? (
            <div className="flex items-center gap-2">
              {/* TODO: point this at the real enrolled-course-content route once it exists */}
              <Link
                href={`/library`}
                type="button"
                className={cn(buttonVariants({ size: "default" }), "flex-1")}
              >
                <Library className="size-4 mr-1" />
                View in library
              </Link>
              {showLikeButton && (
                <CourseLikeButton
                  courseId={course.id}
                  initiallyLiked={alreadyLikedCourse}
                  onToggle={toggleCourseLike}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ContactDeveloperDialog price={course.price} />

              {showSaveButton && (
                <SaveCourseButton
                  courseId={course.id}
                  initiallySaved={alreadySavedCourse}
                  onToggle={toggleSavedCourse}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}