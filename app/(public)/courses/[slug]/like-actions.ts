"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleCourseLike(courseId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in to like a course." };
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { userId: true, slug: true },
    });

    if (!course) {
      return { error: "Course not found." };
    }

    if (course.userId === session.user.id) {
      return { error: "You can't like your own course." };
    }

    const existing = await prisma.courseLike.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      await prisma.courseLike.delete({ where: { id: existing.id } });
      revalidatePath(`/courses/${course.slug}`);
      return { liked: false };
    }

    await prisma.courseLike.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });
    revalidatePath(`/courses/${course.slug}`);
    return { liked: true };
  } catch (err) {
    console.error("Toggle course like error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}