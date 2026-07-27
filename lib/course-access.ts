import { prisma } from "@/lib/db";

/**
 * Returns true if this user can access a course's paid content —
 * either they're the instructor who owns it, or they have an
 * ACTIVE (granted) enrollment. Used to gate the study page, video
 * comments/likes, and (already, separately) file downloads.
 */
export async function hasActiveCourseAccess(
  userId: string,
  courseId: string,
  courseOwnerId: string
) {
  if (courseOwnerId === userId) return true;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { status: true },
  });

  return enrollment?.status === "ACTIVE";
}