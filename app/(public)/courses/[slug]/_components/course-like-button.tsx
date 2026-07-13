"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CourseLikeButtonProps {
  courseId: string;
  initiallyLiked: boolean;
  onToggle: (courseId: string) => Promise<{ liked?: boolean; error?: string }>;
}

export function CourseLikeButton({ courseId, initiallyLiked, onToggle }: CourseLikeButtonProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !liked;
    setLiked(next);

    startTransition(async () => {
      const result = await onToggle(courseId);
      if (result.error) {
        setLiked(!next);
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
      aria-label={liked ? "Unlike course" : "Like course"}
    >
      <Heart className={cn("size-4", liked && "fill-destructive text-destructive")} />
    </Button>
  );
}