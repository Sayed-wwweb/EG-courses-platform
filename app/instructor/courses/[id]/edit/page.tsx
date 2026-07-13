import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { EditCourseTabs } from "./_components/EditCourseTabs";
import { getChapters } from "./video-actions";
import { getCourseFiles } from "./file-actions";

type Params = Promise<{ id: string }>;

export default async function EditCoursePage({ params }: { params: Params }) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id },
  });

  if (!course) {
    notFound();
  }

  if (course.userId !== session.user.id) {
    redirect("/instructor/courses");
  }

  const chaptersResult = await getChapters(course.id);
  const chapters = chaptersResult.status === "success" ? chaptersResult.data : [];

  const filesResult = await getCourseFiles(course.id);
  const files = filesResult.status === "success" ? filesResult.data : [];

  return <EditCourseTabs course={course} chapters={chapters} files={files} />;
}