"use server";

import { prisma } from "@/lib/db";

export async function globalSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return { users: [], courses: [] };
  }

  const [users, courses] = await Promise.all([
    prisma.user.findMany({
      where: {
        name: { contains: trimmed, mode: "insensitive" },
      },
      select: { id: true, name: true, image: true, role: true },
      take: 5,
    }),
    prisma.course.findMany({
      where: {
        status: "Published",
        title: { contains: trimmed, mode: "insensitive" },
      },
      select: { id: true, title: true, slug: true, fileKey: true },
      take: 5,
    }),
  ]);

  return { users, courses };
}