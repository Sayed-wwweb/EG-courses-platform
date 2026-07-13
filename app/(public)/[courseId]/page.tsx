import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CheckoutClient } from "./checkout-client";

type Params = Promise<{ courseId: string }>;

export default async function CheckoutPage({ params }: { params: Params }) {
  const { courseId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, price: true, fileKey: true, status: true },
  });

  if (!course || course.status !== "Published") {
    notFound();
  }

  return <CheckoutClient course={course} />;
}