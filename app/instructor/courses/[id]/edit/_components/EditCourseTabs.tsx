"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Trash2,
  Loader2,
  ChevronDown,
  Plus,
  Pencil,
  Check,
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  Download,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Course, Chapter, Video, CourseFile } from "@/lib/generated/prisma/client"
import { EditCourseForm } from "./EditCourseForm"
import { VideoUploader } from "./VideoUploader"
import { SortableVideoItem } from "./SortableVideoItem"
import { CourseFileUploader } from "./CourseFileUploader"
import {
  createChapter,
  deleteVideo,
  syncProcessingVideos,
  getChapters,
  updateChapterTitle,
  deleteChapter,
  updateVideoTitle,
  reorderVideos,
} from "../video-actions"
import { deleteCourseFile } from "../file-actions"

type ChapterWithVideos = Chapter & { videos: Video[] }

interface EditCourseTabsProps {
  course: Course
  chapters: ChapterWithVideos[]
  files: CourseFile[]
}

export function EditCourseTabs({
  course,
  chapters: initialChapters,
  files: initialFiles,
}: EditCourseTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const validTabs = ["course", "videos", "files"]
  const rawTab = searchParams.get("tab")
  const activeTab = validTabs.includes(rawTab ?? "") ? rawTab! : "course"

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const [chapters, setChapters] = useState(initialChapters)
  const [newChapterTitle, setNewChapterTitle] = useState("")
  const [isCreatingChapter, setIsCreatingChapter] = useState(false)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)
  const [videoPendingDelete, setVideoPendingDelete] = useState<Video | null>(null)

  const [activeUploadChapterId, setActiveUploadChapterId] = useState<string | null>(null)
  const [openChapters, setOpenChapters] = useState<string[]>([])

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isSavingTitle, setIsSavingTitle] = useState(false)

  const [chapterPendingDelete, setChapterPendingDelete] = useState<ChapterWithVideos | null>(null)
  const [isDeletingChapter, setIsDeletingChapter] = useState(false)

  const [files, setFiles] = useState(initialFiles)
  const [filePendingDelete, setFilePendingDelete] = useState<CourseFile | null>(null)
  const [isDeletingFile, setIsDeletingFile] = useState(false)

  const activeChapter = chapters.find((c) => c.id === activeUploadChapterId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function toggleUploadTarget(chapterId: string) {
    setActiveUploadChapterId((prev) => (prev === chapterId ? null : chapterId))
    setOpenChapters((prev) => (prev.includes(chapterId) ? prev : [...prev, chapterId]))
  }

  function startEditingChapter(chapter: ChapterWithVideos) {
    setEditingChapterId(chapter.id)
    setEditingTitle(chapter.title)
  }

  function cancelEditingChapter() {
    setEditingChapterId(null)
    setEditingTitle("")
  }

  async function saveChapterTitle() {
    if (!editingChapterId || !editingTitle.trim()) return
    setIsSavingTitle(true)
    const result = await updateChapterTitle(editingChapterId, editingTitle.trim())
    setIsSavingTitle(false)

    if (result.status === "success") {
      setChapters((prev) =>
        prev.map((c) => (c.id === editingChapterId ? { ...c, title: result.data.title } : c))
      )
      toast.success("Chapter renamed")
      setEditingChapterId(null)
      setEditingTitle("")
    } else {
      toast.error(result.message)
    }
  }

  async function confirmDeleteChapter() {
    if (!chapterPendingDelete) return
    const chapterId = chapterPendingDelete.id

    setIsDeletingChapter(true)
    const result = await deleteChapter(chapterId)
    setIsDeletingChapter(false)
    setChapterPendingDelete(null)

    if (result.status === "success") {
      toast.success("Chapter deleted")
      setChapters((prev) => prev.filter((c) => c.id !== chapterId))
      if (activeUploadChapterId === chapterId) setActiveUploadChapterId(null)
      setOpenChapters((prev) => prev.filter((id) => id !== chapterId))
    } else {
      toast.error(result.message)
    }
  }

  function handleUploadComplete(video: Video) {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === video.chapterId
          ? { ...chapter, videos: [...chapter.videos, video] }
          : chapter
      )
    )
  }

  async function handleRenameVideo(videoId: string, newTitle: string): Promise<boolean> {
    const result = await updateVideoTitle(videoId, newTitle)
    if (result.status === "success") {
      setChapters((prev) =>
        prev.map((c) => ({
          ...c,
          videos: c.videos.map((v) => (v.id === videoId ? { ...v, title: newTitle } : v)),
        }))
      )
      toast.success("Lesson renamed")
      return true
    }
    toast.error(result.message)
    return false
  }

  async function confirmDeleteVideo() {
    if (!videoPendingDelete) return
    const videoId = videoPendingDelete.id

    setDeletingVideoId(videoId)
    const result = await deleteVideo(videoId)
    setDeletingVideoId(null)
    setVideoPendingDelete(null)

    if (result.status === "success") {
      toast.success("Video deleted")
      setChapters((prev) =>
        prev.map((chapter) => ({
          ...chapter,
          videos: chapter.videos.filter((v) => v.id !== videoId),
        }))
      )
    } else {
      toast.error(result.message)
    }
  }

  async function handleCreateChapter() {
    if (!newChapterTitle.trim()) return
    setIsCreatingChapter(true)
    const result = await createChapter(course.id, newChapterTitle.trim())
    setIsCreatingChapter(false)

    if (result.status === "success") {
      const newChapter: ChapterWithVideos = { ...result.data, videos: [] }
      setChapters((prev) => [...prev, newChapter])
      setNewChapterTitle("")
      toast.success(`Chapter "${newChapter.title}" created`)
    } else {
      toast.error(result.message)
    }
  }

  function findVideoChapterId(videoId: string) {
    return chapters.find((c) => c.videos.some((v) => v.id === videoId))?.id
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    const sourceChapterId = findVideoChapterId(activeId)
    const destChapterId = findVideoChapterId(overId)
    if (!sourceChapterId || !destChapterId) return

    let updatedChapters: ChapterWithVideos[]

    if (sourceChapterId === destChapterId) {
      updatedChapters = chapters.map((c) => {
        if (c.id !== sourceChapterId) return c
        const oldIndex = c.videos.findIndex((v) => v.id === activeId)
        const newIndex = c.videos.findIndex((v) => v.id === overId)
        return { ...c, videos: arrayMove(c.videos, oldIndex, newIndex) }
      })
    } else {
      const sourceChapter = chapters.find((c) => c.id === sourceChapterId)!
      const destChapter = chapters.find((c) => c.id === destChapterId)!
      const movingVideo = sourceChapter.videos.find((v) => v.id === activeId)!
      const destIndex = destChapter.videos.findIndex((v) => v.id === overId)

      updatedChapters = chapters.map((c) => {
        if (c.id === sourceChapterId) {
          return { ...c, videos: c.videos.filter((v) => v.id !== activeId) }
        }
        if (c.id === destChapterId) {
          const newVideos = [...c.videos]
          newVideos.splice(destIndex, 0, { ...movingVideo, chapterId: destChapterId })
          return { ...c, videos: newVideos }
        }
        return c
      })
    }

    setChapters(updatedChapters)

    const affected = updatedChapters.filter(
      (c) => c.id === sourceChapterId || c.id === destChapterId
    )
    const updates = affected.flatMap((c) =>
      c.videos.map((v, position) => ({ videoId: v.id, chapterId: c.id, position }))
    )

    const result = await reorderVideos(updates)
    if (result.status === "error") {
      toast.error(result.message)
      const refreshed = await getChapters(course.id)
      if (refreshed.status === "success") setChapters(refreshed.data)
    }
  }

  useEffect(() => {
    const hasProcessingVideo = chapters.some((c) => c.videos.some((v) => v.status === "PROCESSING"))
    if (!hasProcessingVideo) return

    const interval = setInterval(async () => {
      await syncProcessingVideos(course.id)
      const refreshed = await getChapters(course.id)
      if (refreshed.status === "success") setChapters(refreshed.data)
    }, 5000)

    return () => clearInterval(interval)
  }, [chapters, course.id])

  function handleFileUploaded(file: CourseFile) {
    setFiles((prev) => [...prev, file])
  }

  async function confirmDeleteFile() {
    if (!filePendingDelete) return
    const fileId = filePendingDelete.id

    setIsDeletingFile(true)
    const result = await deleteCourseFile(fileId)
    setIsDeletingFile(false)
    setFilePendingDelete(null)

    if (result.status === "success") {
      toast.success("File deleted")
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    } else {
      toast.error(result.message)
    }
  }

  function getFileIcon(name: string) {
    const ext = name.split(".").pop()?.toLowerCase()
    if (ext === "xls" || ext === "xlsx") return FileSpreadsheet
    if (ext === "ppt" || ext === "pptx") return Presentation
    return FileText
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-col gap-6">
      <div className="sticky top-0 z-20 flex flex-col justify-between gap-3 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-4">
          <Link href={"/instructor/courses"} className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft className="size-6" />
          </Link>
          <h1 className="text-2xl font-bold flex-1 truncate">Edit Course</h1>
        </div>
        <TabsList className="grid gap-3 w-full grid-cols-3 sm:inline-flex sm:w-auto border border-muted-foreground/25 rounded-lg bg-muted pr-4 pl-4 data-[state=active]:text-primary">
          <TabsTrigger
            value="course"
            className="text-md font-bold flex-1 pl-3 pr-3 transition-all duration-300 data-[state=active]:text-primary"
          >
            Course Info
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="text-md font-bold flex-1 pl-3 pr-3 transition-all duration-300 data-[state=active]:text-primary"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="text-md font-bold flex-1 pl-3 pr-3 transition-all duration-300 data-[state=active]:text-primary"
          >
            Files
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="course">
        <EditCourseForm course={course} />
      </TabsContent>

      <TabsContent value="videos" className="space-y-6 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Lesson</CardTitle>
            <CardDescription>
              {activeChapter
                ? `Upload video for ${activeChapter.title}`
                : "Press the + next to a chapter below to start uploading into it."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoUploader
              courseId={course.id}
              chapterId={activeUploadChapterId ?? ""}
              disabled={!activeUploadChapterId}
              onUploadComplete={handleUploadComplete}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
            <CardDescription>
              Expand a chapter to see its lessons. Drag the grip handle to reorder or move lessons between chapters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chapters yet — add one below to get started.
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Accordion
                  type="multiple"
                  value={openChapters}
                  onValueChange={setOpenChapters}
                  className="w-full"
                >
                  {chapters.map((chapter) => (
                    <AccordionItem key={chapter.id} value={chapter.id}>
                      <AccordionPrimitive.Header className="flex items-center gap-2 py-2">

                        {editingChapterId === chapter.id ? (
                          <div className="flex flex-1 items-center gap-2 px-2 py-2">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              disabled={isSavingTitle}
                              className="h-9"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveChapterTitle()
                                if (e.key === "Escape") cancelEditingChapter()
                              }}
                            />
                            <button
                              type="button"
                              onClick={saveChapterTitle}
                              disabled={isSavingTitle || !editingTitle.trim()}
                              className="flex size-7 shrink-0 items-center justify-center rounded-full text-primary hover:bg-muted disabled:opacity-50"
                              aria-label="Save chapter title"
                            >
                              {isSavingTitle ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingChapter}
                              disabled={isSavingTitle}
                              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
                              aria-label="Cancel editing chapter title"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <AccordionPrimitive.Trigger className="p-4 peer flex flex-1 items-center py-2 text-left font-semibold hover:bg-muted rounded-lg transition-colors">
                              {chapter.title}
                            </AccordionPrimitive.Trigger>

                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                              {chapter.videos.length}
                            </span>

                            <button
                              type="button"
                              onClick={() => startEditingChapter(chapter)}
                              aria-label={`Rename ${chapter.title}`}
                              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setChapterPendingDelete(chapter)}
                              aria-label={`Delete ${chapter.title}`}
                              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleUploadTarget(chapter.id)}
                          aria-label={`Upload video to ${chapter.title}`}
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                            activeUploadChapterId === chapter.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input hover:bg-muted"
                          )}
                        >
                          <Plus className="size-4" />
                        </button>

                        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 peer-data-[state=open]:rotate-180" />
                      </AccordionPrimitive.Header>

                      <AccordionContent>
                        {chapter.videos.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No lessons yet in this chapter.
                          </p>
                        ) : (
                          <SortableContext
                            items={chapter.videos.map((v) => v.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {chapter.videos.map((video, index) => (
                                <SortableVideoItem
                                  key={video.id}
                                  video={video}
                                  index={index}
                                  courseId={course.id}
                                  isDeleting={deletingVideoId === video.id}
                                  onRequestDelete={setVideoPendingDelete}
                                  onRename={handleRenameVideo}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </DndContext>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Input
                placeholder="New chapter title"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                disabled={isCreatingChapter}
                className="w-full h-10"
              />
              <Button
                variant="outline"
                onClick={handleCreateChapter}
                disabled={isCreatingChapter || !newChapterTitle.trim()}
                className="w-full sm:w-auto"
              >
                {isCreatingChapter ? <Loader2 className="size-4 animate-spin" /> : "Add chapter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="files" className="space-y-6 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Share lecture slides, worksheets, or reference documents with students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseFileUploader courseId={course.id} onUploadComplete={handleFileUploaded} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Files</CardTitle>
            <CardDescription>Files currently attached to this course.</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => {
                  const Icon = getFileIcon(file.name)
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2"
                    >
                      <Icon className="size-5 shrink-0 text-muted-foreground" />
                       <span className="flex-1 truncate text-sm">{file.name}</span>
                      <a
                        href={`/api/course-files/${file.id}/download`}
                        aria-label={`Download ${file.name}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Download className="size-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setFilePendingDelete(file)}
                        aria-label={`Delete ${file.name}`}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <AlertDialog open={!!videoPendingDelete} onOpenChange={(open) => !open && setVideoPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {videoPendingDelete?.title} from Bunny Stream and your course. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVideo}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!chapterPendingDelete} onOpenChange={(open) => !open && setChapterPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{chapterPendingDelete?.title}&quot; and all{" "}
              {chapterPendingDelete?.videos.length ?? 0} of its videos from Bunny Stream and your course. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingChapter}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChapter} disabled={isDeletingChapter}>
              {isDeletingChapter ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!filePendingDelete} onOpenChange={(open) => !open && setFilePendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{filePendingDelete?.name}&quot; from storage and your course.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingFile}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} disabled={isDeletingFile}>
              {isDeletingFile ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}