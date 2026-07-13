import { buttonVariants } from "@/components/ui/button";
import { CirclePlusIcon, BookOpen, PencilIcon, Clock, DollarSign, GraduationCap } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { env } from "@/lib/env";


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
            <Card key={course.id} className="flex flex-col justify-between overflow-hidden p-0">
              {/* Thumbnail */}
              <div className="relative w-full aspect-video">
                {course.fileKey ? (
                  <Image
                    src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${course.fileKey}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    fill
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="size-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              <CardContent className="pt-4 pb-2 space-y-2">
                 {/* Status */}
                <div className="flex justify-end">
                  <Badge
                    variant={
                      course.status === "Published"
                        ? "default"
                        : course.status === "Draft"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {course.status}
                  </Badge>
                </div>
                {/* Title */}
                <h2 className="font-semibold text-base leading-tight line-clamp-2">
                  {course.title}
                </h2>

                {/* Small description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.smallDescription}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none rounded-full")}>
                    <Clock className="size-3.5" /> {course.duration}h
                  </span>
                  <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none rounded-full ml-auto border-green-500 text-green-500 hover:text-green-500")}>
                    <DollarSign className="size-3.5" /> {course.price} EGP
                  </span>
                </div>

                {/* University */}
                {course.university && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-auto rounded-full hover:text-primary w-full cursor-default")}>
                        <GraduationCap className="size-3.5 shrink-0" />
                        <span className="truncate">{course.university}</span>
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{course.university}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </CardContent>

              <CardFooter className="pt-2 pb-4 px-4">
                <Link
                  href={`/instructor/courses/${course.id}/edit`}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full")}
                >
                  <PencilIcon className="size-4 mr-1" />
                  Edit Course
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}