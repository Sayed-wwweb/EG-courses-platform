"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { hasActiveCourseAccess } from "@/lib/course-access";

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function postVideoComment(videoId: string, content: string) {
  const user = await getSessionUser();
  if (!user) return { error: "You must be logged in to comment." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Comment can't be empty." };
  if (trimmed.length > 2000) return { error: "Comment is too long." };

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { course: { select: { id: true, slug: true, userId: true } } },
    });

    if (!video) return { error: "Video not found." };

    const allowed = await hasActiveCourseAccess(
      user.id,
      video.course.id,
      video.course.userId
    );
    if (!allowed) return { error: "You don't have access to this course." };

    await prisma.comment.create({
      data: {
        content: trimmed,
        userId: user.id,
        videoId,
      },
    });

    revalidatePath(`/learn/${video.course.slug}`);
    return { success: true };
  } catch (err) {
    console.error("Post video comment error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function toggleCommentLike(commentId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "You must be logged in to like a comment." };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        video: {
          select: { course: { select: { id: true, slug: true, userId: true } } },
        },
      },
    });

    if (!comment) return { error: "Comment not found." };

    // Only video comments are handled here — course-wide comments live on
    // the marketplace page and will get their own action later.
    if (!comment.video) return { error: "This comment type isn't supported here." };

    const { course } = comment.video;
    const allowed = await hasActiveCourseAccess(user.id, course.id, course.userId);
    if (!allowed) return { error: "You don't have access to this course." };

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      revalidatePath(`/learn/${course.slug}`);
      return { liked: false };
    }

    await prisma.commentLike.create({
      data: { userId: user.id, commentId },
    });
    revalidatePath(`/learn/${course.slug}`);
    return { liked: true };
  } catch (err) {
    console.error("Toggle comment like error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function toggleVideoLike(videoId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "You must be logged in to like a video." };

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { course: { select: { id: true, slug: true, userId: true } } },
    });

    if (!video) return { error: "Video not found." };

    const allowed = await hasActiveCourseAccess(
      user.id,
      video.course.id,
      video.course.userId
    );
    if (!allowed) return { error: "You don't have access to this course." };

    const existing = await prisma.videoLike.findUnique({
      where: { userId_videoId: { userId: user.id, videoId } },
    });

    if (existing) {
      await prisma.videoLike.delete({ where: { id: existing.id } });
      revalidatePath(`/learn/${video.course.slug}`);
      return { liked: false };
    }

    await prisma.videoLike.create({
      data: { userId: user.id, videoId },
    });
    revalidatePath(`/learn/${video.course.slug}`);
    return { liked: true };
  } catch (err) {
    console.error("Toggle video like error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}