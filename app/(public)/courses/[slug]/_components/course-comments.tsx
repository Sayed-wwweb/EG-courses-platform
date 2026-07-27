"use client";

import { useState, useTransition } from "react";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { postCourseComment, toggleCourseCommentLike } from "../comment-actions";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; image: string | null };
  likeCount: number;
  likedByMe: boolean;
}

interface CourseCommentsProps {
  courseId: string;
  comments: CommentItem[];
  isLoggedIn: boolean;
}

function CommentLikeButton({
  commentId,
  initialLiked,
  initialCount,
}: {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : c - 1));

    startTransition(async () => {
      const result = await toggleCourseCommentLike(commentId);
      if (result.error) {
        setLiked(!next);
        setCount((c) => (next ? c - 1 : c + 1));
        toast.error(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Heart className={cn("size-3.5", liked && "fill-destructive text-destructive")} />
      {count > 0 && count}
    </button>
  );
}

export function CourseComments({ courseId, comments, isLoggedIn }: CourseCommentsProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await postCourseComment(courseId, trimmed);
      if (result.error) {
        toast.error(result.error);
      } else {
        setContent("");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Comments</h2>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
          {comments.length}
        </span>
      </div>

      {isLoggedIn ? (
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question about this course..."
            className="min-h-16 resize-none"
            disabled={isPending}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className="shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Log in to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No comments yet — be the first to ask something.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 border-t pt-3 first:border-t-0 first:pt-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold overflow-hidden">
                {comment.author.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={comment.author.image} alt={comment.author.name} className="size-full object-cover" />
                ) : (
                  comment.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                </div>
                <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap wrap-break-word">
                  {comment.content}
                </p>
                <div className="mt-1">
                  <CommentLikeButton
                    commentId={comment.id}
                    initialLiked={comment.likedByMe}
                    initialCount={comment.likeCount}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}