"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Camera, Trash2, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadAvatar, deleteAvatar } from "@/app/(public)/profile/profile-actions";
import Image from "next/image";

interface AvatarUploaderProps {
  name: string;
  currentImage: string | null;
}

export function AvatarUploader({ name, currentImage }: AvatarUploaderProps) {
  const [image, setImage] = useState<string | null>(currentImage);
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds the 5MB limit.");
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    setObjectUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadAvatar(formData);

      if (result.error || !result.url) {
        toast.error(result.error ?? "Upload failed.");
        setUploading(false);
        return;
      }

      setImage(result.url);
      setUploading(false);
      toast.success("Profile photo updated.");
    } catch (err) {
      console.error("uploadFile threw:", err);
      toast.error("Something went wrong during upload.");
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input value so selecting the same file again still fires onChange
    e.target.value = "";
    if (file) {
      uploadFile(file);
    }
  }

  async function handleRemove() {
    setIsDeleting(true);

    const result = await deleteAvatar();

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(undefined);
    }

    setImage(null);
    setIsDeleting(false);
    toast.success("Profile photo removed.");
  }

  const displaySrc = objectUrl ?? image;
  const busy = uploading || isDeleting;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={busy}>
          <button
            type="button"
            className="relative size-24 rounded-full overflow-hidden border flex items-center justify-center bg-muted group cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading || isDeleting ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : displaySrc ? (
              <Image
                src={displaySrc}
                alt={name}
                fill
                unoptimized={!!objectUrl}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-medium">
                {name?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="size-5 text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
              <DropdownMenuContent align="start"
                className="w-48 bg-background border rounded-md shadow-md p-1">
                  <DropdownMenuItem onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2">
            <Upload className="size-4 mr-2" />
            Upload photo
          </DropdownMenuItem>
          {displaySrc && (
            <DropdownMenuItem
              onClick={handleRemove}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="size-4 mr-2" />
              Remove photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}