"use client"

import { useCallback, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { toast } from "sonner"
import { Loader2, UploadCloud } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { uploadCourseFile } from "../file-actions"
import { CourseFile } from "@/lib/generated/prisma/client"

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
}

interface CourseFileUploaderProps {
  courseId: string
  onUploadComplete: (file: CourseFile) => void
}

export function CourseFileUploader({ courseId, onUploadComplete }: CourseFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  async function uploadOne(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadCourseFile(courseId, formData)
    if (result.status === "success") {
      onUploadComplete(result.data)
      toast.success(`${file.name} uploaded`)
    } else {
      toast.error(`${file.name}: ${result.message}`)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      setIsUploading(true)
      // Sequential on purpose: avoids hammering Bunny with N concurrent PUTs
      // when someone drags in a folder of lecture files, and keeps each
      // success/error toast attributable to one specific file.
      for (const file of acceptedFiles) {
        await uploadOne(file)
      }
      setIsUploading(false)
    },
    [courseId] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function onDropRejected(fileRejections: FileRejection[]) {
    const tooBig = fileRejections.some((r) => r.errors[0]?.code === "file-too-large")
    const badType = fileRejections.some((r) => r.errors[0]?.code === "file-invalid-type")
    if (tooBig) toast.error("One or more files exceed the 30MB limit")
    if (badType) toast.error("Only Word, Excel, PowerPoint, and PDF files are allowed")
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxSize: 30 * 1024 * 1024,
    disabled: isUploading,
  })

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out cursor-pointer",
        isDragActive ? "border-primary bg-primary/10 border-solid" : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop files here" : "Drag & drop files, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Word, Excel, PowerPoint, PDF — up to 30MB each
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}