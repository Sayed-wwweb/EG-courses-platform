"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteFromBunny, uploadToBunny } from "@/lib/bunny";

export async function uploadThumbnail(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in." };
  }

  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "No file provided." };
  }

  // Never trust client-side validation alone — recheck type + size here
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size exceeds the 5MB limit." };
  }

  try {
    const fileKey = await uploadToBunny(file);
    return { fileKey };
  } catch (err) {
    console.error("Bunny upload error:", err);
    return { error: "Upload failed. Please try again." };
  }
}

export async function deleteThumbnail(fileKey: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { error: "You must be logged in." };
  }

  try {
    await deleteFromBunny(fileKey);
    return { success: true };
  } catch (err) {
    console.error("Bunny delete error:", err);
    return { error: "Failed to delete file." };
  }
}