"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createPaymobIntention } from "@/lib/paymob";
import { env } from "@/lib/env";

export async function startCheckout(courseId: string, phoneNumber: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { status: "error" as const, message: "You must be logged in." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, price: true, status: true, userId: true },
  });

  if (!course || course.status !== "Published") {
    return { status: "error" as const, message: "Course not available." };
  }

  if (course.userId === session.user.id) {
    return { status: "error" as const, message: "You can't buy your own course." };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (existing?.status === "ACTIVE") {
    return { status: "error" as const, message: "You already own this course." };
  }

  try {
    const enrollment = existing
      ? await prisma.enrollment.update({
          where: { id: existing.id },
          data: { status: "PENDING" },
        })
      : await prisma.enrollment.create({
          data: { userId: session.user.id, courseId, status: "PENDING" },
        });

    const [firstName, ...rest] = (session.user.name || "Student").split(" ");
    const lastName = rest.join(" ") || "Student";

    const intention = await createPaymobIntention({
      amountCents: course.price * 100,
      merchantOrderId: enrollment.id,
      billingData: {
        firstName,
        lastName,
        email: session.user.email,
        phoneNumber,
      },
      redirectionUrl: `${env.BETTER_AUTH_URL}/${courseId}/success`,
    });

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { paymobOrderId: String(intention.id) },
    });

    return {
      status: "success" as const,
      data: { clientSecret: intention.client_secret, publicKey: env.PAYMOB_PUBLIC_KEY },
    };
  } catch (err) {
    console.error("startCheckout error:", err);
    return { status: "error" as const, message: "Failed to start checkout. Please try again." };
  }
}