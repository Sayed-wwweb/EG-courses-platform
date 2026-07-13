"use server";

import { prisma } from "@/lib/db";
import { courseSchema } from "@/lib/zodSchemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function updateCourse(courseId: string, formData: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = courseSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Ownership check — never trust that the courseId passed in is legit
  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  });

  if (!existingCourse || existingCourse.userId !== session.user.id) {
    redirect("/instructor/courses");
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      description: data.description,
      smallDescription: data.smallDescription,
      slug: data.slug,
      price: data.price,
      duration: data.duration,
      level: data.level,
      university: data.university,
      status: data.status,
      fileKey: data.fileKey ?? null,
      trailerVideoId: data.trailerVideoId,
      trailerDuration: data.trailerDuration,
    },
  });

  redirect("/instructor/courses");
}