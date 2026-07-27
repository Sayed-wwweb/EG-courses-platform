import { buttonVariants } from "@/components/ui/button";
import { CirclePlusIcon, BookOpen, Pencil, Clock, GraduationCap, Heart } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { env } from "@/lib/env";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatCompactNumber } from "@/lib/format-count";

export default async function CoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          enrollments: { where: { status: "ACTIVE" } },
          likes: true,
        },
      },
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your courses</h1>
        <Link
          className={buttonVariants({ size: "sm" }) + " px-4 py-6 text-[1.0rem]"}
          href="/instructor/courses/create"
        >
          <CirclePlusIcon className="size-8" />
          Create course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <BookOpen className="size-12" />
          <p className="text-lg font-medium">No courses yet</p>
          <p className="text-sm">Create your first course to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:-translate-y-0.75"
            >
              <Link href={`/instructor/courses/${course.id}/edit`} className="flex flex-1 flex-col">
                {/* Thumbnail with status badge overlay */}
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

                  {/* Enrolled/likes stats, same treatment as the public card */}
                  <div className="flex items-center justify-evenly gap-6 border-t pt-3 mt-1">
                    <span className="flex flex-col items-center">
                      <span className="flex items-center gap-1 text-lg font-semibold text-foreground">
                        <GraduationCap className="size-4 text-muted-foreground" />
                        {formatCompactNumber(course._count.enrollments)}
                      </span>
                      <span className="text-[12px] uppercase tracking-wide text-muted-foreground">
                        Enrolled
                      </span>
                    </span>
                    <span className="flex flex-col items-center">
                      <span className="flex items-center gap-1 text-lg font-semibold text-foreground">
                        <Heart className="size-4 text-muted-foreground" />
                        {formatCompactNumber(course._count.likes)}
                      </span>
                      <span className="text-[12px] uppercase tracking-wide text-muted-foreground">
                        Likes
                      </span>
                    </span>
                  </div>

                  {/* Price/duration + created date */}
                  <div className="flex items-center justify-between gap-2 pt-1 pb-1">
                    <span className="flex items-center gap-2">
                      <span className="text-primary">
                        <span className="font-semibold">{course.price}</span>{" "}
                        <span className="text-xs font-normal text-muted-foreground">EGP</span>
                      </span>
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
                  href={`/instructor/courses/${course.id}/edit`}
                  className={cn(buttonVariants({ size: "default" }), "w-full gap-1")}
                >
                  Edit course
                  <Pencil className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}