"use client";

import { useState } from "react";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import { createVideoUpload } from "../video-actions";
import type { Video } from "@/lib/generated/prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

interface VideoUploaderProps {
  chapterId: string;
  courseId: string;
  disabled?: boolean;
  onUploadComplete: (video: Video) => void;
}

export function VideoUploader({
  chapterId,
  courseId,
  disabled = false,
  onUploadComplete,
}: VideoUploaderProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  }

  async function handleUpload() {
    if (disabled) return;

    if (!file || !title.trim()) {
      toast.error("Please provide a lesson name and a video file.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    const result = await createVideoUpload({
      title: title.trim(),
      chapterId,
      courseId,
    });

    if (result.status === "error") {
      toast.error(result.message);
      setIsUploading(false);
      return;
    }

    const { tus: tusAuth, video: createdVideo } = result.data;

    const upload = new tus.Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: tusAuth.signature,
        AuthorizationExpire: String(tusAuth.expirationTime),
        VideoId: tusAuth.videoId,
        LibraryId: tusAuth.libraryId,
      },
      metadata: {
        filetype: file.type,
        title: title.trim(),
      },
      onError: (err) => {
        console.error("TUS upload failed:", err);
        toast.error("Upload failed. Please try again.");
        setIsUploading(false);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = (bytesUploaded / bytesTotal) * 100;
        setProgress(Math.round(pct));
      },
      onSuccess: () => {
        setIsUploading(false);
        setProgress(100);
        setTitle("");
        setFile(null);
        toast.success("Video uploaded! Processing will finish shortly.");
        onUploadComplete(createdVideo);
      },
    });

    upload.start();
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => {
          if (disabled) return;
          document.getElementById("video-file-input")?.click();
        }}
        
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 text-center transition-colors min-h-40 ${
          disabled
            ? "cursor-not-allowed opacity-50 border-dashed border-muted-foreground/15"
            : file
            ? "cursor-pointer border-solid border-primary bg-primary/5"
            : isDragging
            ? "cursor-pointer border-dashed border-primary bg-primary/5"
            : "cursor-pointer border-dashed border-muted-foreground/25 hover:border-muted-foreground/40"
        }`}
      >
        <input
          id="video-file-input"
          type="file"
          accept="video/*"
          className="hidden"
          disabled={disabled}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <UploadCloud className={disabled ? "size-10 text-muted-foreground transition-colors ease-in-out duration-400" : "size-10 text-primary transition-colors ease-in-out duration-400"} />
        {file ? (
          <p className="text-sm font-medium">{file.name}</p>
        ) : (
          <p className={disabled ? "text-sm text-muted-foreground transition-colors ease-in-out duration-400" : "text-sm text-primary transition-colors ease-in-out duration-400" }>
            {disabled
              ? "Select a chapter first to enable uploading"
              : "click to browse"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          placeholder="Lesson name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading || disabled}
          className="h-10"
        />
        <Button
          onClick={handleUpload}
          disabled={isUploading || disabled}
          className="h-10 w-full shrink-0 sm:w-auto"
        >
          {isUploading ? `Uploading ${progress}%` : "Upload video"}
        </Button>
      </div>
    </div>
  );
}