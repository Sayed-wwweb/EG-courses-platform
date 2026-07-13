"use client";

import { useEffect, useRef, useState } from "react";
import * as tus from "tus-js-client";
import { toast } from "sonner";
import { createTrailerUpload, getTrailerStatus, deleteTrailerVideo } from "@/app/instructor/courses/create/trailer-actions";
import { saveTrailerToCourse, removeTrailerFromCourse } from "@/app/instructor/courses/[id]/edit/trailer-actions";
import { UploadCloud, Loader2, XIcon, Film, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MIN_DURATION = 60;   // 1 minute
const MAX_DURATION = 300;  // 5 minutes

interface TrailerUploaderProps {
  value?: string;
  onChange: (videoId: string | undefined, duration: number | undefined) => void;
  // If provided, the component runs in AUTO-SAVE mode: uploads/removals persist
  // to the database immediately (used on the edit page). If omitted, it runs
  // in FORM mode: the parent form's submit button persists the value (create page).
  courseId?: string;
}

type Phase = "idle" | "uploading" | "processing" | "ready" | "removing" | "error";

export function TrailerUploader({ value, onChange, courseId }: TrailerUploaderProps) {
  const [phase, setPhase] = useState<Phase>(value ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep local phase in sync if the parent's value changes from outside
  // (e.g. initial server-rendered course data arriving after mount).
  useEffect(() => {
    if (!value) return;
    const timeoutId = setTimeout(() => setPhase("ready"), 0);
    return () => clearTimeout(timeoutId);
  }, [value]);
  
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling(bunnyVideoId: string) {
    setPhase("processing");

    pollRef.current = setInterval(async () => {
      const result = await getTrailerStatus(bunnyVideoId);

      if (result.status === "error") {
        clearInterval(pollRef.current!);
        setPhase("error");
        setErrorMessage(result.message);
        return;
      }

      const { videoStatus, duration } = result.data;

      if (videoStatus === "FAILED") {
        clearInterval(pollRef.current!);
        setPhase("error");
        setErrorMessage("Video processing failed. Please try a different file.");
        deleteTrailerVideo(bunnyVideoId).catch(() => {});
        return;
      }

      if (videoStatus === "READY") {
        clearInterval(pollRef.current!);

        if (duration < MIN_DURATION || duration > MAX_DURATION) {
          setPhase("error");
          setErrorMessage(
            `Trailer must be between 1 and 5 minutes long (yours is ${Math.round(duration)}s). Please upload a different video.`
          );
          deleteTrailerVideo(bunnyVideoId).catch(() => {});
          onChange(undefined, undefined);
          return;
        }

        if (courseId) {
          const saveResult = await saveTrailerToCourse(courseId, bunnyVideoId, duration);
          if (saveResult.status === "error") {
            setPhase("error");
            setErrorMessage(saveResult.message);
            return;
          }
          toast.success("Trailer uploaded and saved.");
        } else {
          toast.success("Trailer uploaded and verified.");
        }

        setPhase("ready");
        onChange(bunnyVideoId, duration);
      }
    }, 5000);
  }

  async function handleFile(file: File) {
    setErrorMessage(null);
    setPhase("uploading");
    setProgress(0);

    const result = await createTrailerUpload();

    if (result.status === "error") {
      setPhase("error");
      setErrorMessage(result.message);
      return;
    }

    const { tus: tusAuth } = result.data;

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
        title: "Course trailer",
      },
      onError: (err) => {
        console.error("Trailer TUS upload failed:", err);
        setPhase("error");
        setErrorMessage("Upload failed. Please try again.");
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => {
        startPolling(tusAuth.videoId);
      },
    });

    upload.start();
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();

    if (courseId) {
      setPhase("removing");
      const result = await removeTrailerFromCourse(courseId);
      if (result.status === "error") {
        toast.error(result.message);
        setPhase("ready");
        return;
      }
      toast.success("Trailer removed.");
    } else if (value) {
      deleteTrailerVideo(value).catch(() => {});
    }

    setPhase("idle");
    setErrorMessage(null);
    onChange(undefined, undefined);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (busy) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  }

  const busy = phase === "uploading" || phase === "processing" || phase === "removing";

  function renderContent() {
    if (phase === "uploading") {
      return (
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
        </div>
      );
    }

    if (phase === "processing") {
      return (
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Processing and checking duration...</p>
        </div>
      );
    }

    if (phase === "removing") {
      return (
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Removing...</p>
        </div>
      );
    }

    if (phase === "error") {
      return (
        <div className="text-center flex flex-col items-center gap-3 px-6">
          <TriangleAlert className="size-10 text-destructive" />
          <p className="text-sm text-destructive">{errorMessage}</p>
          <p className="text-xs text-muted-foreground">Click to try again</p>
        </div>
      );
    }

    if (phase === "ready") {
      return (
        <div className="text-center flex flex-col items-center gap-3">
          <Film className="size-10 text-primary" />
          <p className="text-sm font-medium">Trailer uploaded</p>
          <Button type="button" variant="destructive" size="sm" onClick={handleRemove}>
            <XIcon className="size-4 mr-1" /> Remove
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center flex flex-col items-center gap-3">
        <UploadCloud className={cn("size-10", isDragging ? "text-primary" : "text-muted-foreground")} />
        <p className="text-sm font-medium">
          Drop your trailer here or click to upload
        </p>
        <p className="text-xs text-muted-foreground">1–5 minutes</p>
      </div>
    );
  }

  return (
    <Card
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (!busy) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => {
        if (busy) return;
        document.getElementById("trailer-file-input")?.click();
      }}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full aspect-video",
        busy
          ? "cursor-wait border-border"
          : phase === "error"
          ? "cursor-pointer border-destructive bg-destructive/5"
          : isDragging
          ? "border-primary bg-primary/10 border-solid cursor-pointer"
          : "border-border hover:border-primary cursor-pointer"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input
          id="trailer-file-input"
          type="file"
          accept="video/*"
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFile(file);
          }}
        />
        {renderContent()}
      </CardContent>
    </Card>
  );
}