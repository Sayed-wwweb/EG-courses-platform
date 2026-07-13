"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

// ---------- 1. CREATE CHAPTER ----------

export async function createChapter(courseId: string, title: string) {
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

export async function getVideo(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { course: true },
    });

    if (!video) {
      return { status: "error" as const, message: "Video not found" };
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
  try {
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
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title },
    });

    return { status: "success" as const, data: chapter };
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
    const video = await prisma.video.update({
      where: { id: videoId },
      data: { title },
    });
    return { status: "success" as const, data: video };
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
  try {
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