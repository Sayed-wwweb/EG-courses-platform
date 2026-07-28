"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function postCourseComment(courseId: string, content: string) {
  const user = await getSessionUser();
  if (!user) return { error: "You must be logged in to comment." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Comment can't be empty." };
  if (trimmed.length > 2000) return { error: "Comment is too long." };

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true },
    });

    if (!course) return { error: "Course not found." };

    await prisma.comment.create({
      data: {
        content: trimmed,
        userId: user.id,
        courseId,
      },
    });

    revalidatePath(`/courses/${course.slug}`);
    return { success: true };
  } catch (err) {
    console.error("Post course comment error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function toggleCourseCommentLike(commentId: string) {
  const user = await getSessionUser();
  if (!user) return { error: "You must be logged in to like a comment." };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        course: { select: { slug: true } },
      },
    });

    if (!comment) return { error: "Comment not found." };

    // Only course-level comments are handled here — video comments have
    // their own toggleCommentLike action under app/(public)/learn/[slug]/.
    if (!comment.course) return { error: "This comment type isn't supported here." };

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      revalidatePath(`/courses/${comment.course.slug}`);
      return { liked: false };
    }

    await prisma.commentLike.create({
      data: { userId: user.id, commentId },
    });
    revalidatePath(`/courses/${comment.course.slug}`);
    return { liked: true };
  } catch (err) {
    console.error("Toggle course comment like error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}