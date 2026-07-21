"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ---------- AUTH HELPER ----------
// Every function below must confirm: (1) there's a logged-in user, and
// (2) that user owns the course the chapter/video belongs to.
// Without this, any signed-in user could edit or delete another
// instructor's content just by knowing/guessing an id.

async function requireCourseOwner(courseId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: "You must be logged in." } as const;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  });

  if (!course || course.userId !== session.user.id) {
    return { error: "You don't have access to this course." } as const;
  }

  return { session } as const;
}

// ---------- 1. CREATE CHAPTER ----------

export async function createChapter(courseId: string, title: string) {
  const auth = await requireCourseOwner(courseId);
  if ("error" in auth) {
    return { status: "error" as const, message: auth.error };
  }

  try {
    const chapterCount = await prisma.chapter.count({
      where: { courseId },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title,
        courseId,
        position: chapterCount,
      },
    });

    return { status: "success" as const, data: chapter };
  } catch (error) {
    console.error("createChapter error:", error);
    return { status: "error" as const, message: "Failed to create chapter" };
  }
}

// ---------- 1b. GET CHAPTERS (with their videos) FOR A COURSE ----------

export async function getChapters(courseId: string) {
  const auth = await requireCourseOwner(courseId);
  if ("error" in auth) {
    return { status: "error" as const, message: auth.error };
  }

  try {
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { position: "asc" },
      include: {
        videos: {
          orderBy: { position: "asc" },
        },
      },
    });

    return { status: "success" as const, data: chapters };
  } catch (error) {
    console.error("getChapters error:", error);
    return { status: "error" as const, message: "Failed to load chapters" };
  }
}

// ---------- 1c. DELETE VIDEO (Bunny + DB) ----------

export async function deleteVideo(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return { status: "error" as const, message: "Video not found" };
    }

    const auth = await requireCourseOwner(video.courseId);
    if ("error" in auth) {
      return { status: "error" as const, message: auth.error };
    }

    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${video.bunnyVideoId}`,
      {
        method: "DELETE",
        headers: {
          AccessKey: env.BUNNY_STREAM_API_KEY,
        },
      }
    );

    if (!bunnyResponse.ok) {
      console.error("Bunny delete failed:", await bunnyResponse.text());
    }

    await prisma.video.delete({
      where: { id: videoId },
    });

    return { status: "success" as const };
  } catch (error) {
    console.error("deleteVideo error:", error);
    return { status: "error" as const, message: "Failed to delete video" };
  }
}

// ---------- 1d. POLL BUNNY FOR STILL-PROCESSING VIDEOS ----------

export async function syncProcessingVideos(courseId: string) {
  const auth = await requireCourseOwner(courseId);
  if ("error" in auth) {
    return { status: "error" as const, message: auth.error };
  }

  try {
    const processingVideos = await prisma.video.findMany({
      where: { courseId, status: "PROCESSING" },
    });

    if (processingVideos.length === 0) {
      return { status: "success" as const, updated: 0 };
    }

    let updatedCount = 0;

    for (const video of processingVideos) {
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${video.bunnyVideoId}`,
        {
          headers: { AccessKey: env.BUNNY_STREAM_API_KEY },
        }
      );

      if (!bunnyResponse.ok) continue;

      const bunnyVideo = await bunnyResponse.json();
      const bunnyStatus: number = bunnyVideo.status;

      let newStatus: "READY" | "FAILED" | null = null;
      if (bunnyStatus === 3 || bunnyStatus === 4) newStatus = "READY";
      else if (bunnyStatus === 5) newStatus = "FAILED";

      if (newStatus) {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: newStatus },
        });
        updatedCount++;
      }
    }

    return { status: "success" as const, updated: updatedCount };
  } catch (error) {
    console.error("syncProcessingVideos error:", error);
    return { status: "error" as const, message: "Failed to sync video status" };
  }
}

// ---------- 1e. GET SINGLE VIDEO (for playback page) ----------
// NOTE: this is used by the instructor edit/playback page. It intentionally
// only allows the owning instructor. If you later want *students* to watch
// via this action too, add a separate enrollment check branch rather than
// loosening this one.

export async function getVideo(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { course: true },
    });

    if (!video) {
      return { status: "error" as const, message: "Video not found" };
    }

    const auth = await requireCourseOwner(video.courseId);
    if ("error" in auth) {
      return { status: "error" as const, message: auth.error };
    }

    return { status: "success" as const, data: video };
  } catch (error) {
    console.error("getVideo error:", error);
    return { status: "error" as const, message: "Failed to load video" };
  }
}

// ---------- 2. CREATE VIDEO (Bunny container + TUS signature) ----------

interface CreateVideoUploadInput {
  title: string;
  chapterId: string;
  courseId: string;
}

export async function createVideoUpload({
  title,
  chapterId,
  courseId,
}: CreateVideoUploadInput) {
  const auth = await requireCourseOwner(courseId);
  if ("error" in auth) {
    return { status: "error" as const, message: auth.error };
  }

  try {
    // Make sure the chapter actually belongs to this course (not some
    // other instructor's chapter id passed in by mistake or on purpose).
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });
    if (!chapter || chapter.courseId !== courseId) {
      return { status: "error" as const, message: "Chapter not found for this course" };
    }

    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: env.BUNNY_STREAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    if (!bunnyResponse.ok) {
      const errText = await bunnyResponse.text();
      console.error("Bunny create video failed:", errText);
      return { status: "error" as const, message: "Failed to create video on Bunny" };
    }

    const bunnyVideo = await bunnyResponse.json();
    const bunnyVideoId: string = bunnyVideo.guid;

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

    const signature = crypto
      .createHash("sha256")
      .update(
        env.BUNNY_STREAM_LIBRARY_ID + env.BUNNY_STREAM_API_KEY + expirationTime + bunnyVideoId
      )
      .digest("hex");

    const videoCount = await prisma.video.count({
      where: { chapterId },
    });

    const video = await prisma.video.create({
      data: {
        title,
        bunnyVideoId,
        chapterId,
        courseId,
        position: videoCount,
        status: "PROCESSING",
      },
    });

    return {
      status: "success" as const,
      data: {
        video,
        tus: {
          libraryId: env.BUNNY_STREAM_LIBRARY_ID,
          videoId: bunnyVideoId,
          signature,
          expirationTime,
        },
      },
    };
  } catch (error) {
    console.error("createVideoUpload error:", error);
    return { status: "error" as const, message: "Failed to prepare video upload" };
  }
}

// ---------- 1f. UPDATE CHAPTER TITLE ----------

export async function updateChapterTitle(chapterId: string, title: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true },
    });
    if (!chapter) {
      return { status: "error" as const, message: "Chapter not found" };
    }

    const auth = await requireCourseOwner(chapter.courseId);
    if ("error" in auth) {
      return { status: "error" as const, message: auth.error };
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title },
    });

    return { status: "success" as const, data: updated };
  } catch (error) {
    console.error("updateChapterTitle error:", error);
    return { status: "error" as const, message: "Failed to rename chapter" };
  }
}

// ---------- 1g. DELETE CHAPTER (+ its videos, from Bunny and DB) ----------

export async function deleteChapter(chapterId: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { videos: true },
    });

    if (!chapter) {
      return { status: "error" as const, message: "Chapter not found" };
    }

    const auth = await requireCourseOwner(chapter.courseId);
    if ("error" in auth) {
      return { status: "error" as const, message: auth.error };
    }

    for (const video of chapter.videos) {
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${video.bunnyVideoId}`,
        {
          method: "DELETE",
          headers: { AccessKey: env.BUNNY_STREAM_API_KEY },
        }
      );
      if (!bunnyResponse.ok) {
        console.error("Bunny delete failed for video:", video.id, await bunnyResponse.text());
      }
    }

    await prisma.video.deleteMany({ where: { chapterId } });
    await prisma.chapter.delete({ where: { id: chapterId } });

    return { status: "success" as const };
  } catch (error) {
    console.error("deleteChapter error:", error);
    return { status: "error" as const, message: "Failed to delete chapter" };
  }
}

// ---------- 1h. UPDATE VIDEO TITLE ----------

export async function updateVideoTitle(videoId: string, title: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { courseId: true },
    });
    if (!video) {
      return { status: "error" as const, message: "Video not found" };
    }

    const auth = await requireCourseOwner(video.courseId);
    if ("error" in auth) {
      return { status: "error" as const, message: auth.error };
    }

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: { title },
    });
    return { status: "success" as const, data: updated };
  } catch (error) {
    console.error("updateVideoTitle error:", error);
    return { status: "error" as const, message: "Failed to rename video" };
  }
}

// ---------- 1i. REORDER / MOVE VIDEOS (bulk position + chapter update) ----------

interface VideoPositionUpdate {
  videoId: string;
  chapterId: string;
  position: number;
}

export async function reorderVideos(updates: VideoPositionUpdate[]) {
  if (updates.length === 0) {
    return { status: "success" as const };
  }

  try {
    // Confirm every video being moved belongs to courses the caller owns.
    // Doing this in one query keeps it cheap even for larger reorders.
    const videoIds = updates.map((u) => u.videoId);
    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      select: { id: true, courseId: true },
    });

    if (videos.length !== videoIds.length) {
      return { status: "error" as const, message: "One or more videos not found" };
    }

    const courseIds = [...new Set(videos.map((v) => v.courseId))];

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { status: "error" as const, message: "You must be logged in." };
    }

    const ownedCourses = await prisma.course.count({
      where: { id: { in: courseIds }, userId: session.user.id },
    });

    if (ownedCourses !== courseIds.length) {
      return { status: "error" as const, message: "You don't have access to one or more of these videos." };
    }

    // Also confirm the destination chapters belong to the same set of courses.
    const chapterIds = [...new Set(updates.map((u) => u.chapterId))];
    const chapters = await prisma.chapter.findMany({
      where: { id: { in: chapterIds } },
      select: { id: true, courseId: true },
    });

    if (chapters.length !== chapterIds.length || chapters.some((c) => !courseIds.includes(c.courseId))) {
      return { status: "error" as const, message: "Invalid destination chapter." };
    }

    await prisma.$transaction(
      updates.map((u) =>
        prisma.video.update({
          where: { id: u.videoId },
          data: { chapterId: u.chapterId, position: u.position },
        })
      )
    );
    return { status: "success" as const };
  } catch (error) {
    console.error("reorderVideos error:", error);
    return { status: "error" as const, message: "Failed to save new order" };
  }
}