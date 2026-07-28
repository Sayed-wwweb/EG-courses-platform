"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

// ---------- User search + role management ----------

export async function searchUsersForAdmin(query: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const trimmed = query.trim();
  if (!trimmed) return { users: [] };

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true, image: true, role: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  return { users };
}

export async function promoteToInstructor(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "User not found." };
  if (user.role === "ADMIN") return { error: "Can't change an admin's role here." };

  await prisma.user.update({ where: { id: userId }, data: { role: "INSTRUCTOR" } });
  return { success: true, role: "INSTRUCTOR" as const };
}

export async function demoteToStudent(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "User not found." };
  if (user.role === "ADMIN") return { error: "Can't change an admin's role here." };

  await prisma.user.update({ where: { id: userId }, data: { role: "STUDENT" } });
  return { success: true, role: "STUDENT" as const };
}

// ---------- Course search + enrollment management ----------

export async function searchCoursesForAdmin(query: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const trimmed = query.trim();
  if (!trimmed) return { courses: [] };

  const courses = await prisma.course.findMany({
    where: { title: { contains: trimmed, mode: "insensitive" } },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      fileKey: true,
      user: { select: { name: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return { courses };
}

export async function grantCourseAccess(userId: string, courseId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const [user, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.course.findUnique({ where: { id: courseId }, select: { id: true, slug: true } }),
  ]);
  if (!user) return { error: "User not found." };
  if (!course) return { error: "Course not found." };

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { status: "ACTIVE" },
    create: { userId, courseId, status: "ACTIVE" },
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath(`/learn/${course.slug}`);
  return { success: true };
}

export async function revokeCourseAccess(userId: string, courseId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true, course: { select: { slug: true } } },
  });
  if (!existing) return { error: "This user has no enrollment in that course." };

  await prisma.enrollment.update({
    where: { id: existing.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/courses/${existing.course.slug}`);
  revalidatePath(`/learn/${existing.course.slug}`);
  return { success: true };
}