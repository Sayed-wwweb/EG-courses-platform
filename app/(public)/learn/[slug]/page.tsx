import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { env } from "@/lib/env";
import { hasActiveCourseAccess } from "@/lib/course-access";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { buttonVariants } from "@/components/ui/button";
import { ChaptersSidebar } from "./_components/chapters-sidebar";
import { FilesSidebar } from "./_components/files-sidebar";
import { VideoComments } from "./_components/video-comments";
import { VideoLikeButton } from "./_components/video-like-button";
import { CourseLikeButton } from "@/app/(public)/courses/[slug]/_components/course-like-button";
import { toggleCourseLike } from "@/app/(public)/courses/[slug]/like-actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ v?: string }>;

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { v: requestedVideoId } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      userId: true,
      files: { select: { id: true, name: true, size: true } },
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          videos: {
            orderBy: { position: "asc" },
            select: { id: true, title: true, duration: true, bunnyVideoId: true },
          },
        },
      },
      likes: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      _count: {
        select: { likes: true },
      },
    },
  });

  if (!course) notFound();

  const allowed = await hasActiveCourseAccess(session.user.id, course.id, course.userId);
  if (!allowed) redirect(`/courses/${slug}`);

  const isOwnCourse = session.user.id === course.userId;
  const alreadyLikedCourse = course.likes.length > 0;
  // Owners can't like their own course — same rule the marketplace page follows.
  const showCourseLikeButton = !isOwnCourse;

  // Pick the video to show: whatever's in ?v=, or the first video in the
  // first non-empty chapter if no valid one was requested.
  const allVideos = course.chapters.flatMap((c) => c.videos);
  const activeVideo =
    allVideos.find((v) => v.id === requestedVideoId) ?? allVideos[0];

  if (!activeVideo) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-muted-foreground">
          This course doesn&apos;t have any videos yet — check back soon.
        </p>
      </div>
    );
  }

  const [commentRows, videoLikeCount, myVideoLike] = await Promise.all([
    prisma.comment.findMany({
      where: { videoId: activeVideo.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
        likes: { select: { userId: true } },
      },
    }),
    prisma.videoLike.count({ where: { videoId: activeVideo.id } }),
    prisma.videoLike.findUnique({
      where: {
        userId_videoId: { userId: session.user.id, videoId: activeVideo.id },
      },
      select: { id: true },
    }),
  ]);

  const comments = commentRows.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: formatRelativeTime(c.createdAt),
    author: { name: c.user.name, image: c.user.image },
    likeCount: c.likes.length,
    likedByMe: c.likes.some((l) => l.userId === session.user.id),
  }));

  const embedUrl = `https://iframe.mediadelivery.net/embed/${env.BUNNY_STREAM_LIBRARY_ID}/${activeVideo.bunnyVideoId}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          {showCourseLikeButton && (
            <CourseLikeButton
              courseId={course.id}
              initiallyLiked={alreadyLikedCourse}
              onToggle={toggleCourseLike}
            />
          )}
          <Link
            href={`/courses/${slug}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Go to marketplace
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column: video, title, comments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div
              style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}
              className="bg-muted"
            >
              <iframe
                src={embedUrl}
                loading="lazy"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <h2 className="text-lg font-semibold truncate">{activeVideo.title}</h2>
              <VideoLikeButton
                key={activeVideo.id}
                videoId={activeVideo.id}
                initialLiked={!!myVideoLike}
                initialCount={videoLikeCount}
              />
            </div>
          </div>

          <VideoComments videoId={activeVideo.id} comments={comments} />
        </div>

        {/* Sidebar: chapters, files */}
        <div className="space-y-4">
          <ChaptersSidebar
            slug={slug}
            chapters={course.chapters}
            activeVideoId={activeVideo.id}
          />
          <FilesSidebar files={course.files} />
        </div>
      </div>
    </div>
  );
}