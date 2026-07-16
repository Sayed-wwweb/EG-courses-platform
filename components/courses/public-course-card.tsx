import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

interface PublicCourseCardProps {
  course: {
    slug: string;
    title: string;
    smallDescription: string;
    duration: number;
    price: number;
    level: string;
    university: string | null;
    fileKey: string | null;
    user: {
      name: string;
      image: string | null;
    };
  };
}

export function PublicCourseCard({ course }: PublicCourseCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-200 hover:shadow-md hover:-translate-y-0.75">
      <Link href={`/courses/${course.slug}`} className="flex flex-1 flex-col">
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

        <div className="flex flex-1 flex-col gap-2 px-4 pt-4 ">
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

          <div className="mt-auto flex items-center gap-2 pt-2">
            <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-muted">
              {course.user.image ? (
                <Image
                  src={course.user.image}
                  alt={course.user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-[10px] font-medium">
                    {course.user.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
              )}
            </div>
            <span className="truncate text-xs text-muted-foreground">
              {course.user.name}
            </span>
            <span className="text-muted-foreground/40">&bull;</span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {course.duration}h
            </span>
          </div>

          
          <span className="text-primary">
            {course.price}{" "}
            <span className="text-xs font-normaltext-muted-foreground">EGP</span>
          </span>
          
        </div>
      </Link>

      
      <div className="flex flex-col gap-3 items-end border-t bg-muted/40 px-4 py-3">
        <Link
          href={`/courses/${course.slug}`}
          className={cn(buttonVariants({ size: "sm" }), "gap-1 w-full")}
        >
          Explore course
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}