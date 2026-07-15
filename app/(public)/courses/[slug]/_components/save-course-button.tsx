"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SaveCourseButtonProps {
  courseId: string;
  initiallySaved: boolean;
  onToggle: (courseId: string) => Promise<{ saved?: boolean; error?: string }>;
}

export function SaveCourseButton({
  courseId,
  initiallySaved,
  onToggle,
}: SaveCourseButtonProps) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !saved;
    setSaved(next);

    startTransition(async () => {
      const result = await onToggle(courseId);
      if (result.error) {
        setSaved(!next);
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Remove from saved courses" : "Save for later"}
    >
      <Bookmark className={cn("size-4", saved && "fill-primary text-primary")} />
    </Button>
  );
}