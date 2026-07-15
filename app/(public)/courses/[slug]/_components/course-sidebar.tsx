import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, DollarSign, GraduationCap, Library } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { CourseLikeButton } from "./course-like-button";
import { SaveCourseButton } from "./save-course-button";
import { toggleCourseLike } from "../like-actions";
import { toggleSavedCourse } from "../saved-actions";

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    smallDescription: string;
    university: string | null;
    duration: number;
    price: number;
    fileKey: string | null;
  };
  isEnrolled: boolean;
  alreadyLikedCourse: boolean;
  showLikeButton: boolean;
  alreadySavedCourse: boolean;
  showSaveButton: boolean;
}

export function CourseSidebar({
  course,
  isEnrolled,
  alreadyLikedCourse,
  showLikeButton,
  alreadySavedCourse,
  showSaveButton,
}: CourseSidebarProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="relative w-full aspect-video">
        {course.fileKey ? (
          <Image
            src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${course.fileKey}`}
            alt={course.title}
            className="object-cover"
            fill
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpen className="size-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold leading-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.smallDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none rounded-full"
            )}
          >
            <Clock className="size-3.5" /> {course.duration}h
          </span>
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none rounded-full ml-auto border-green-500 text-green-500 hover:text-green-500"
            )}
          >
            <DollarSign className="size-3.5" /> {course.price} EGP
          </span>
        </div>

        {course.university && (
          <p
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none rounded-full w-full"
            )}
          >
            <GraduationCap className="size-3.5 shrink-0" />
            <span className="truncate">{course.university}</span>
          </p>
        )}

        <div className="pt-2">
          {isEnrolled ? (
            <div className="flex items-center gap-2">
              {/* TODO: point this at the real enrolled-course-content route once it exists */}
              <button
                type="button"
                className={cn(buttonVariants({ size: "default" }), "flex-1")}
                disabled
              >
                <Library className="size-4 mr-1" />
                View in library
              </button>
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
              <Link
                href={`/${course.id}`}
                className={cn(buttonVariants({ size: "default" }), "flex-1")}
              >
                Buy course — {course.price} EGP
              </Link>
              {showLikeButton && (
                <CourseLikeButton
                  courseId={course.id}
                  initiallyLiked={alreadyLikedCourse}
                  onToggle={toggleCourseLike}
                />
              )}
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