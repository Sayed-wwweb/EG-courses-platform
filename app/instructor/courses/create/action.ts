"use server";

import { prisma } from "@/lib/db";
import { courseSchema } from "@/lib/zodSchemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createCourse(formData: unknown) {
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

  await prisma.course.create({
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
      userId: session.user.id,
    },
  });

  redirect("/instructor/courses");
}