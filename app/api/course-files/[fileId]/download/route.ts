import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await prisma.courseFile.findUnique({
    where: { id: fileId },
    include: { course: { select: { id: true, userId: true } } },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const isOwner = file.course.userId === session.user.id;

  // Not the instructor — check for an active (paid) enrollment instead.
  let hasAccess = isOwner;
  if (!hasAccess) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: file.course.id,
        },
      },
      select: { status: true },
    });
    hasAccess = enrollment?.status === "ACTIVE";
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bunnyUrl = `${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${file.fileKey}`;
  const bunnyResponse = await fetch(bunnyUrl);

  if (!bunnyResponse.ok || !bunnyResponse.body) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
  }

  return new NextResponse(bunnyResponse.body, {
    headers: {
      "Content-Type": bunnyResponse.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
    },
  });
}