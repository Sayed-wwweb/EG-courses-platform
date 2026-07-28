"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { ChevronDown, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoItem {
  id: string;
  title: string;
  duration: number | null;
}

interface ChapterItem {
  id: string;
  title: string;
  videos: VideoItem[];
}

interface ChaptersSidebarProps {
  slug: string;
  chapters: ChapterItem[];
  activeVideoId: string;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ChaptersSidebar({ slug, chapters, activeVideoId }: ChaptersSidebarProps) {
  // Open the chapter that contains the currently-playing video by default.
  const defaultOpen = chapters.find((c) =>
    c.videos.some((v) => v.id === activeVideoId)
  )?.id;

  if (chapters.length === 0) {
    return <p className="text-sm text-muted-foreground">No chapters yet.</p>;
  }

  return (
    <div className="max-h-150 overflow-y-auto rounded-xl border bg-card p-2">
      <Accordion type="multiple" defaultValue={defaultOpen ? [defaultOpen] : []} className="w-full">
        {chapters.map((chapter) => (
          <AccordionItem key={chapter.id} value={chapter.id}>
            <AccordionPrimitive.Header className="flex items-center gap-2 py-2">
              <AccordionPrimitive.Trigger className="peer flex flex-1 items-center py-2 px-2 text-left font-semibold hover:bg-muted rounded-lg transition-colors">
                {chapter.title}
              </AccordionPrimitive.Trigger>

              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                {chapter.videos.length}
              </span>

              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 peer-data-[state=open]:rotate-180" />
            </AccordionPrimitive.Header>

            <AccordionContent>
              {chapter.videos.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2">
                  No lessons yet in this chapter.
                </p>
              ) : (
                <div className="space-y-2">
                  {chapter.videos.map((video, index) => {
                    const isActive = video.id === activeVideoId;
                    return (
                      <Link
                        key={video.id}
                        href={`/learn/${slug}?v=${video.id}`}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors",
                          isActive
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted"
                        )}
                      >
                        {isActive ? (
                          <Play className="size-4 shrink-0 text-primary fill-primary" />
                        ) : (
                          <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="shrink-0 font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="h-4 w-px shrink-0 bg-muted-foreground/40" />
                        <span
                          className={cn(
                            "flex-1 truncate",
                            isActive ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {video.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDuration(video.duration)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}