"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunny";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
];

const MAX_SIZE = 30 * 1024 * 1024; // 30MB

async function requireCourseOwnership(courseId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { session: null, course: null };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  });

  if (!course || course.userId !== session.user.id) {
    return { session, course: null };
  }

  return { session, course };
}

export async function getCourseFiles(courseId: string) {
  const files = await prisma.courseFile.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
  });
  return { status: "success" as const, data: files };
}

export async function uploadCourseFile(courseId: string, formData: FormData) {
  const { course } = await requireCourseOwnership(courseId);
  if (!course) {
    return { status: "error" as const, message: "Not authorized." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { status: "error" as const, message: "No file provided." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      status: "error" as const,
      message: "Only Word, Excel, PowerPoint, and PDF files are allowed.",
    };
  }

  if (file.size > MAX_SIZE) {
    return { status: "error" as const, message: "File size exceeds the 30MB limit." };
  }

  try {
    const fileKey = await uploadToBunny(file, "course-files");

    const courseFile = await prisma.courseFile.create({
      data: {
        name: file.name,
        fileKey,
        size: file.size,
        courseId,
      },
    });

    return { status: "success" as const, data: courseFile };
  } catch (err) {
    console.error("Course file upload error:", err);
    return { status: "error" as const, message: "Upload failed. Please try again." };
  }
}

export async function deleteCourseFile(fileId: string) {
  const existing = await prisma.courseFile.findUnique({
    where: { id: fileId },
    select: { courseId: true, fileKey: true },
  });

  if (!existing) {
    return { status: "error" as const, message: "File not found." };
  }

  const { course } = await requireCourseOwnership(existing.courseId);
  if (!course) {
    return { status: "error" as const, message: "Not authorized." };
  }

  try {
    await deleteFromBunny(existing.fileKey);
    await prisma.courseFile.delete({ where: { id: fileId } });
    return { status: "success" as const };
  } catch (err) {
    console.error("Course file delete error:", err);
    return { status: "error" as const, message: "Failed to delete file." };
  }
}