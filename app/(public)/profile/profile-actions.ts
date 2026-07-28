"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { uploadToBunny, deleteFromBunny } from "@/lib/bunny";
import { env } from "@/lib/env";

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in." };
  }

  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "No file provided." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size exceeds the 5MB limit." };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const fileKey = await uploadToBunny(file, "avatars");
    const url = `${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${fileKey}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    });

    // Clean up the old avatar, but only if it was one of ours (Bunny-hosted).
    // Google-hosted avatar URLs aren't ours to delete.
    if (currentUser?.image?.startsWith(env.NEXT_PUBLIC_BUNNY_CDN_URL)) {
      const oldKey = currentUser.image.replace(`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/`, "");
      deleteFromBunny(oldKey).catch(() => {
        console.error("Failed to clean up old avatar:", oldKey);
      });
    }

    revalidatePath("/profile");

    return { url };
  } catch (err) {
    console.error("Avatar upload error:", err);
    return { error: "Upload failed. Please try again." };
  }
}

export async function deleteAvatar() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in." };
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (currentUser?.image?.startsWith(env.NEXT_PUBLIC_BUNNY_CDN_URL)) {
      const oldKey = currentUser.image.replace(`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/`, "");
      await deleteFromBunny(oldKey);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    revalidatePath("/profile");

    return { success: true };
  } catch (err) {
    console.error("Avatar delete error:", err);
    return { error: "Failed to remove avatar." };
  }
}

export async function updateBio(value: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "You must be logged in." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { bio: value },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Update bio error:", err);
    return { error: "Failed to update bio." };
  }
}

export async function updateLocation(value: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "You must be logged in." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { location: value },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Update location error:", err);
    return { error: "Failed to update location." };
  }
}

export async function updateWhatsappNumber(value: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "You must be logged in." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { whatsappNumber: value },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Update whatsapp error:", err);
    return { error: "Failed to update WhatsApp number." };
  }
}

export async function updateSocialLinks(value: { facebook?: string; instagram?: string; discord?: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "You must be logged in." };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { socialLinks: value },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Update social links error:", err);
    return { error: "Failed to update social links." };
  }
}

export async function updateName(value: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "You must be logged in." };

  if (!value.trim()) {
    return { error: "Name cannot be empty." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: value.trim() },
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("Update name error:", err);
    return { error: "Failed to update name." };
  }
}