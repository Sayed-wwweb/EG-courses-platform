import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";

interface ProfileCourse {
  id: string;
  title: string;
  smallDescription: string;
  duration: number;
  price: number;
  status: string;
  fileKey: string | null;
}

interface ProfileCoursesGridProps {
  courses: ProfileCourse[];
}

export function ProfileCoursesGrid({ courses }: ProfileCoursesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
        <BookOpen className="size-8" />
        <p className="text-sm">No courses yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {courses.map((course) => (
        <Link key={course.id} href={`/instructor/courses/${course.id}/edit`} className="group">
          <Card className="overflow-hidden p-0 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary/40">
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
                className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0"
              >
                {course.status}
              </Badge>
            </div>

            <CardContent className="p-2.5 space-y-1.5">
              <h3 className="font-medium text-sm leading-tight line-clamp-1 transition-colors duration-200 group-hover:text-primary">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Clock className="size-3" /> {course.duration}h
                </span>
                <span className="flex items-center gap-0.5">
                  <DollarSign className="size-3" /> {course.price} EGP
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}