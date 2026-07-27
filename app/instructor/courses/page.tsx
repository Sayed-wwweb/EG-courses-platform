import { buttonVariants } from "@/components/ui/button";
import { CirclePlusIcon, BookOpen, PencilIcon, Clock, GraduationCap, Heart } from "lucide-react";
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
              className="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:-translate-y-0.75"
            >
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

              <div className="flex flex-1 flex-col gap-3 px-4 pt-4">
                {course.university && (
                  <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {course.university}
                  </p>
                )}

                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                    {course.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {course.smallDescription}
                  </p>
                </div>

                {/* Stat strip: bordered block, numbers as the anchor, labels below */}
                <div className="grid grid-cols-3 divide-x divide-border rounded-lg border bg-muted/30">
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2.5">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Clock className="size-3.5 text-muted-foreground" />
                      {course.duration}h
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Duration
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2.5">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <GraduationCap className="size-3.5 text-muted-foreground" />
                      {formatCompactNumber(course._count.enrollments)}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Enrolled
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 px-2 py-2.5">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Heart className="size-3.5 text-muted-foreground" />
                      {formatCompactNumber(course._count.likes)}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Likes
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-primary text-lg font-semibold">
                    {course.price}{" "}
                    <span className="text-xs font-normal text-muted-foreground">EGP</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Created {formatRelativeTime(course.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-end border-t bg-muted/40 px-4 py-3 mt-3">
                <Link
                  href={`/instructor/courses/${course.id}/edit`}
                  className={cn(buttonVariants({ size: "sm" }), "gap-1 w-full")}
                >
                  <PencilIcon className="size-3.5" />
                  Edit Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}