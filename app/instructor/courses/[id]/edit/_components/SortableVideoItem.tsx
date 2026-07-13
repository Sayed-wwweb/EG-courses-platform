"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GripVertical, PlayCircle, Loader2, Pencil, Trash2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Video } from "@/lib/generated/prisma/client"

interface SortableVideoItemProps {
  video: Video
  index: number
  courseId: string
  isDeleting: boolean
  onRequestDelete: (video: Video) => void
  onRename: (videoId: string, newTitle: string) => Promise<boolean>
}

export function SortableVideoItem({
  video,
  index,
  courseId,
  isDeleting,
  onRequestDelete,
  onRename,
}: SortableVideoItemProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(video.title)
  const [isSaving, setIsSaving] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  async function handleSave() {
    if (!title.trim() || title.trim() === video.title) {
      setIsEditing(false)
      setTitle(video.title)
      return
    }
    setIsSaving(true)
    const ok = await onRename(video.id, title.trim())
    setIsSaving(false)
    if (ok) setIsEditing(false)
    else setTitle(video.title)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!isEditing && video.status === "READY") {
          router.push(`/instructor/courses/${courseId}/edit/videos/${video.id}`)
        }
      }}
      className={cn(
        "group flex items-center gap-2 rounded-lg border px-2 py-2 text-sm transition-colors",
        video.status === "READY" && !isEditing ? "cursor-pointer hover:bg-muted" : "cursor-default"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {isEditing ? (
        <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSaving}
            className="h-8"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") {
                setIsEditing(false)
                setTitle(video.title)
              }
            }}
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-primary hover:bg-muted disabled:opacity-50"
            aria-label="Save lesson name"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setTitle(video.title)
            }}
            disabled={isSaving}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
            aria-label="Cancel editing lesson name"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          {video.status === "READY" ? (
            <span className="flex flex-1 items-center gap-2 min-w-0">
              <PlayCircle className="size-4 shrink-0 text-primary" />
              <span className="shrink-0 font-bold">{index + 1}</span>
              <span className="h-4 w-px shrink-0 bg-muted-foreground/40" />
              <span className="truncate text-muted-foreground">{video.title}</span>
            </span>
          ) : (
            <span className="flex flex-1 items-center gap-2 min-w-0">
              {video.status === "FAILED" ? (
                <Badge variant="destructive" className="shrink-0">
                  Failed
                </Badge>
              ) : (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              <span className="shrink-0 font-bold text-primary">{index + 1}</span>
              <span className="h-4 w-px shrink-0 bg-muted-foreground/40" />
              <span className="truncate text-muted-foreground">
                {video.status === "FAILED" ? video.title : "Processing..."}
              </span>
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Rename lesson"
          >
            <Pencil className="size-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onRequestDelete(video)
            }}
            disabled={isDeleting}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 transition-colors"
            aria-label="Delete video"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        </>
      )}
    </div>
  )
}