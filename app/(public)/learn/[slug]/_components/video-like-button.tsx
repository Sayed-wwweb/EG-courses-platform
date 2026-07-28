"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toggleVideoLike } from "../actions";

interface VideoLikeButtonProps {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function VideoLikeButton({ videoId, initialLiked, initialCount }: VideoLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : c - 1));

    startTransition(async () => {
      const result = await toggleVideoLike(videoId);
      if (result.error) {
        setLiked(!next);
        setCount((c) => (next ? c - 1 : c + 1));
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-2"
    >
      <Heart className={cn("size-4", liked && "fill-destructive text-destructive")} />
      Like video
      {count > 0 && <span className="text-sm font-semibold text-muted-foreground">{count}</span>}
    </Button>
  );
}