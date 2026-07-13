"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleProfileLike(likedUserId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in to like a profile." };
  }

  if (session.user.id === likedUserId) {
    return { error: "You can't like your own profile." };
  }

  try {
    const existing = await prisma.like.findUnique({
      where: {
        likerId_likedUserId: {
          likerId: session.user.id,
          likedUserId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      revalidatePath(`/profile/${likedUserId}`);
      return { liked: false };
    }

    await prisma.like.create({
      data: {
        likerId: session.user.id,
        likedUserId,
      },
    });
    revalidatePath(`/profile/${likedUserId}`);
    return { liked: true };
  } catch (err) {
    console.error("Toggle profile like error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}