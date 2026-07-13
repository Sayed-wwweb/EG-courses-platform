import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { CreatorCard } from "./_components/creator-card";
import { LockedChapters } from "./_components/locked-chapters";
import { LockedFiles } from "./_components/locked-files";
import { CourseSidebar } from "./_components/course-sidebar";

type Params = Promise<{ slug: string }>;

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const course = await prisma.course.findFirst({
    where: { slug, status: "Published" },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      description: true,
      price: true,
      duration: true,
      university: true,
      fileKey: true,
      trailerVideoId: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          likesReceived: session?.user
            ? { where: { likerId: session.user.id }, select: { id: true } }
            : undefined,
        },
      },
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          videos: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, duration: true },
          },
        },
      },
      files: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, size: true },
      },
      enrollments: session?.user
        ? { where: { userId: session.user.id, status: "ACTIVE" }, select: { id: true } }
        : undefined,
      likes: session?.user
        ? { where: { userId: session.user.id }, select: { id: true } }
        : undefined,
    },
  });

  if (!course) {
    notFound();
  }

  const isEnrolled = session?.user ? course.enrollments!.length > 0 : false;
  const alreadyLikedCourse = session?.user ? course.likes!.length > 0 : false;
  const alreadyLikedCreator = session?.user ? course.user.likesReceived!.length > 0 : false;
  const isOwnCourse = session?.user?.id === course.userId;
  const showLikeButtons = !!session?.user && !isOwnCourse;

  const trailerEmbedUrl = course.trailerVideoId
    ? `https://iframe.mediadelivery.net/embed/${env.BUNNY_STREAM_TRAILER_LIBRARY_ID}/${course.trailerVideoId}`
    : null;

  return (
    <div className="py-8 grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-6">
      {/* Chapters + Files */}
      <div className="space-y-6 order-3 lg:order-1">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Chapters</h2>
          <LockedChapters chapters={course.chapters} />
        </div>
        <LockedFiles files={course.files} />
      </div>

      {/* Trailer + Description */}
      <div className="space-y-6 order-2 lg:order-2">
        {trailerEmbedUrl && (
          <div
            style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}
            className="overflow-hidden rounded-xl border"
          >
            <iframe
              src={trailerEmbedUrl}
              loading="lazy"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          </div>
        )}

        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        </div>
      </div>

      {/* Creator + Sidebar */}
      <div className="space-y-6 order-1 lg:order-3">
        <CreatorCard
          user={course.user}
          alreadyLiked={alreadyLikedCreator}
          showLikeButton={showLikeButtons}
        />
        <CourseSidebar
          course={course}
          isEnrolled={isEnrolled}
          alreadyLikedCourse={alreadyLikedCourse}
          showLikeButton={showLikeButtons}
        />
      </div>
    </div>
  );
}