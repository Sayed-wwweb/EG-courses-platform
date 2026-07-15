import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpen, Bookmark } from "lucide-react";
import { PublicCourseCard } from "@/components/courses/public-course-card";

export default async function LibraryPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const courseCardSelect = {
    slug: true,
    title: true,
    smallDescription: true,
    duration: true,
    price: true,
    level: true,
    university: true,
    fileKey: true,
    user: { select: { name: true, image: true } },
  } as const;

  const [enrollments, savedCourses] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { course: { select: courseCardSelect } },
    }),
    prisma.savedCourse.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { course: { select: courseCardSelect } },
    }),
  ]);

  const purchasedCourses = enrollments.map((e) => e.course);
  const savedCoursesList = savedCourses.map((s) => s.course);

  return (
    <div className="py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Your library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Courses you&apos;ve bought and courses you&apos;re saving to buy later.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Purchased courses</h2>
        </div>

        {purchasedCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border bg-card p-6">
            You haven&apos;t bought any courses yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchasedCourses.map((course) => (
              <PublicCourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Saved for later</h2>
        </div>

        {savedCoursesList.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border bg-card p-6">
            You haven&apos;t saved any courses yet. Tap the bookmark icon on a course page to save it here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedCoursesList.map((course) => (
              <PublicCourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}