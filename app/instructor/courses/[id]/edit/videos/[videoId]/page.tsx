import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getVideo } from "../../video-actions";
import { env } from "@/lib/env";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Params = Promise<{ id: string; videoId: string }>;

export default async function VideoPlaybackPage({ params }: { params: Params }) {
  const { videoId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const result = await getVideo(videoId);

  if (result.status === "error") {
    notFound();
  }

  const video = result.data;

  if (video.course.userId !== session.user.id) {
    redirect("/instructor/courses");
  }

  const embedUrl = `https://iframe.mediadelivery.net/embed/${env.BUNNY_STREAM_LIBRARY_ID}/${video.bunnyVideoId}`;
  const courseEditBase = `/instructor/courses/${video.course.id}/edit`;

  const navTabClass = (active: boolean) =>
    cn(
      "flex-1 text-center text-md font-bold px-3 py-1.5 whitespace-nowrap transition-all duration-300 sm:flex-none",
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="w-full flex-col gap-6">
      <div className="sticky top-0 z-20 flex flex-col justify-between gap-3 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`${courseEditBase}?tab=videos`}
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-2xl font-bold flex-1 truncate">{video.title}</h1>
        </div>

        <div className="grid gap-3 w-full grid-cols-3 sm:inline-flex sm:w-auto border border-muted-foreground/25 rounded-lg bg-muted pr-4 pl-4 data-[state=active]:text-primary">
          <Link href={`${courseEditBase}?tab=course`} className={navTabClass(false)}>
            Course Info
          </Link>
          <Link href={`${courseEditBase}?tab=videos`} className={navTabClass(true)}>
            Videos
          </Link>
          <Link href={`${courseEditBase}?tab=files`} className={navTabClass(false)}>
            Files
          </Link>
        </div>
      </div>

      <div
        style={{ position: "relative", width: "100%", maxWidth: "800px", aspectRatio: "16 / 9" }}
        className="overflow-hidden rounded-lg border mx-auto mt-6"
      >
        <iframe
          src={embedUrl}
          loading="lazy"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      </div>
    </div>
  );
}