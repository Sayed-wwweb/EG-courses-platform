import { prisma } from "@/lib/db";
import { CoursesFilters } from "@/components/courses/courses-filters";
import { PublicCourseCard } from "@/components/courses/public-course-card";
import { BookOpen } from "lucide-react";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; university?: string }>;
}) {
  const { search, university } = await searchParams;

  const [courses, universityRows] = await Promise.all([
    prisma.course.findMany({
      where: {
        status: "Published",
        ...(search && { title: { contains: search, mode: "insensitive" } }),
        ...(university && { university }),
      },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        smallDescription: true,
        duration: true,
        price: true,
        level: true,
        university: true,
        fileKey: true,
        user: {
          select: { name: true, image: true },
        },
      },
    }),
    prisma.course.findMany({
      where: { status: "Published", university: { not: null } },
      select: { university: true },
      distinct: ["university"],
    }),
  ]);

  const universities = universityRows
    .map((c) => c.university)
    .filter((u): u is string => !!u)
    .sort();

  return (
    <div className="py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground mt-1">
          Find your next subject. Search by name or filter by university.
        </p>
      </div>

      <CoursesFilters universities={universities} />

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
          <BookOpen className="size-12" />
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <PublicCourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}