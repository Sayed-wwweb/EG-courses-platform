"use server";

import crypto from "crypto";
import { env } from "@/lib/env";

// Creates a video container on the DEDICATED TRAILER library on Bunny Stream
// and returns a TUS upload signature. Unlike createVideoUpload (lesson videos,
// shared library), this does NOT create a Prisma row — the course doesn't
// exist yet at this point. The bunnyVideoId is held in the form and only
// persisted to the Course record when the course itself is created/updated.
export async function createTrailerUpload() {
  try {
    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_TRAILER_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: env.BUNNY_STREAM_TRAILER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Course trailer" }),
      }
    );

    if (!bunnyResponse.ok) {
      const errText = await bunnyResponse.text();
      console.error("Bunny create trailer video failed:", errText);
      return { status: "error" as const, message: "Failed to prepare trailer upload." };
    }

    const bunnyVideo = await bunnyResponse.json();
    const bunnyVideoId: string = bunnyVideo.guid;

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

    const signature = crypto
      .createHash("sha256")
      .update(
        env.BUNNY_STREAM_TRAILER_LIBRARY_ID + env.BUNNY_STREAM_TRAILER_API_KEY + expirationTime + bunnyVideoId
      )
      .digest("hex");

    return {
      status: "success" as const,
      data: {
        tus: {
          libraryId: env.BUNNY_STREAM_TRAILER_LIBRARY_ID,
          videoId: bunnyVideoId,
          signature,
          expirationTime,
        },
      },
    };
  } catch (error) {
    console.error("createTrailerUpload error:", error);
    return { status: "error" as const, message: "Failed to prepare trailer upload." };
  }
}

// Polls the TRAILER library directly by video ID (no DB row exists to check against yet).
export async function getTrailerStatus(bunnyVideoId: string) {
  try {
    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_TRAILER_LIBRARY_ID}/videos/${bunnyVideoId}`,
      { headers: { AccessKey: env.BUNNY_STREAM_TRAILER_API_KEY } }
    );

    if (!bunnyResponse.ok) {
      return { status: "error" as const, message: "Failed to check trailer status." };
    }

    const bunnyVideo = await bunnyResponse.json();
    const bunnyStatus: number = bunnyVideo.status;
    const duration: number = bunnyVideo.length ?? 0; // seconds

    let videoStatus: "PROCESSING" | "READY" | "FAILED" = "PROCESSING";
    if (bunnyStatus === 3 || bunnyStatus === 4) videoStatus = "READY";
    else if (bunnyStatus === 5) videoStatus = "FAILED";

    return { status: "success" as const, data: { videoStatus, duration } };
  } catch (error) {
    console.error("getTrailerStatus error:", error);
    return { status: "error" as const, message: "Failed to check trailer status." };
  }
}

// Deletes directly from the TRAILER library by video ID — used when a trailer
// is rejected (wrong duration) or removed before the course is ever created.
export async function deleteTrailerVideo(bunnyVideoId: string) {
  try {
    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_TRAILER_LIBRARY_ID}/videos/${bunnyVideoId}`,
      { method: "DELETE", headers: { AccessKey: env.BUNNY_STREAM_TRAILER_API_KEY } }
    );

    if (!bunnyResponse.ok) {
      console.error("Bunny delete trailer failed:", await bunnyResponse.text());
    }

    return { status: "success" as const };
  } catch (error) {
    console.error("deleteTrailerVideo error:", error);
    return { status: "error" as const, message: "Failed to delete trailer." };
  }
}