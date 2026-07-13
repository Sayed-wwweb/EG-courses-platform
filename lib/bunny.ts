import { env } from "@/lib/env";
import { v4 as uuidv4 } from "uuid";

const BASE_URL = `https://${env.BUNNY_STORAGE_HOSTNAME}/${env.BUNNY_STORAGE_ZONE}`;

export async function uploadToBunny(file: File, folder: string = "thumbnails"): Promise<string> {  const extension = file.name.split(".").pop();
  const fileKey = `${folder}/${uuidv4()}.${extension}`;
  
  const buffer = Buffer.from(await file.arrayBuffer());

  const response = await fetch(`${BASE_URL}/${fileKey}`, {
    method: "PUT",
    headers: {
      AccessKey: env.BUNNY_STORAGE_PASSWORD,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`Bunny upload failed: ${response.status} ${response.statusText}`);
  }

  return fileKey;
}

export async function deleteFromBunny(fileKey: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${fileKey}`, {
    method: "DELETE",
    headers: { AccessKey: env.BUNNY_STORAGE_PASSWORD },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Bunny delete failed: ${response.status} ${response.statusText}`);
  }
}