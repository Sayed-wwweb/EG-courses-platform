"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  likedUserId: string;
  initiallyLiked: boolean;
  onToggle: (likedUserId: string) => Promise<{ liked?: boolean; error?: string }>;
}

export function LikeButton({ likedUserId, initiallyLiked, onToggle }: LikeButtonProps) {
  const [liked, setLiked] = useState(initiallyLiked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic update — flip immediately, revert if the server disagrees
    const next = !liked;
    setLiked(next);

    startTransition(async () => {
      const result = await onToggle(likedUserId);
      if (result.error) {
        setLiked(!next);
        toast.error(result.error);
        return;
      }
      setLiked(result.liked ?? next);
    });
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {liked ? "Liked" : "Like"}
    </Button>
  );
}