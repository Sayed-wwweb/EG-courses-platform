"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { deleteTrailerVideo } from "@/app/instructor/courses/create/trailer-actions";

async function requireCourseOwnership(courseId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true, trailerVideoId: true },
  });

  if (!course || course.userId !== session.user.id) return null;
  return course;
}

// Called the moment a new trailer is uploaded and validated on the EDIT page —
// saves immediately, no "Save Changes" click required. Also cleans up the
// previous trailer on Bunny if one existed (replace-in-place).
export async function saveTrailerToCourse(courseId: string, videoId: string, duration: number) {
  const course = await requireCourseOwnership(courseId);
  if (!course) {
    return { status: "error" as const, message: "Not authorized." };
  }

  try {
    const previousVideoId = course.trailerVideoId;

    await prisma.course.update({
      where: { id: courseId },
      data: { trailerVideoId: videoId, trailerDuration: duration },
    });

    if (previousVideoId && previousVideoId !== videoId) {
      deleteTrailerVideo(previousVideoId).catch(() => {
        console.error("Failed to clean up replaced trailer:", previousVideoId);
      });
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { status: "success" as const };
  } catch (err) {
    console.error("saveTrailerToCourse error:", err);
    return { status: "error" as const, message: "Failed to save trailer." };
  }
}

// Deletes from Bunny AND clears the database field in one step — no separate
// "Save Changes" needed afterward.
export async function removeTrailerFromCourse(courseId: string) {
  const course = await requireCourseOwnership(courseId);
  if (!course) {
    return { status: "error" as const, message: "Not authorized." };
  }

  try {
    if (course.trailerVideoId) {
      await deleteTrailerVideo(course.trailerVideoId);
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { trailerVideoId: null, trailerDuration: null },
    });

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    return { status: "success" as const };
  } catch (err) {
    console.error("removeTrailerFromCourse error:", err);
    return { status: "error" as const, message: "Failed to remove trailer." };
  }
}