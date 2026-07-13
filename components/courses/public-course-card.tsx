import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, DollarSign, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
    <Card className="overflow-hidden p-0 h-full flex flex-col">
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

      <CardContent className="pt-4 pb-2 space-y-2 flex-1">
        <h3 className="font-semibold text-base leading-tight line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.smallDescription}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <div className="relative size-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {course.user.image ? (
              <Image src={course.user.image} alt={course.user.name} fill className="object-cover" />
            ) : (
              <span className="text-[10px] font-medium">
                {course.user.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">{course.user.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none rounded-full")}>
            <Clock className="size-3.5" /> {course.duration}h
          </span>
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none rounded-full ml-auto border-green-500 text-green-500 hover:text-green-500")}>
            <DollarSign className="size-3.5" /> {course.price} EGP
          </span>
        </div>

        {course.university && (
          <p className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none rounded-full w-full")}>
            <GraduationCap className="size-3.5 shrink-0" />
            <span className="truncate">{course.university}</span>
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4">
        <Link
          href={`/courses/${course.slug}`}
          className={cn(buttonVariants({ size: "sm" }), "w-full")}
        >
          Explore course
        </Link>
      </CardFooter>
    </Card>
  );
}