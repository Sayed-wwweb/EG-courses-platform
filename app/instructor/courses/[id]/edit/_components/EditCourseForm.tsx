"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { courseSchema, CourseSchemaType, courseStatus, egyptianUniversities } from "@/lib/zodSchemas"
import { Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import slugify from "slugify"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { UpLoader } from "@/components/file-uploader/uploader"
import { useTransition } from "react"
import { updateCourse } from "../action"
import { toast } from "sonner"
import { Course } from "@/lib/generated/prisma/client"
import { TrailerUploader } from "@/components/file-uploader/trailer-uploader";

const RichTextEditor = dynamic(
  () => import("@/components/rich-text-editor/Editor").then(mod => mod.RichTextEditor),
  { ssr: false }
)

interface EditCourseFormProps {
  course: Course
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
        title: course.title,
        description: course.description,
        price: course.price,
        duration: course.duration,
        level: course.level,
        smallDescription: course.smallDescription,
        slug: course.slug,
        status: course.status,
        university: (course.university ?? undefined) as CourseSchemaType["university"],
        fileKey: course.fileKey ?? undefined,
        trailerVideoId: course.trailerVideoId ?? "",
        trailerDuration: course.trailerDuration ?? 0,
    },
  });

  const [isPending, startTransition] = useTransition()

  function onSubmit(data: CourseSchemaType) {
    startTransition(async () => {
      const result = await updateCourse(course.id, data)
      if (result?.error) {
        toast.error("Something went wrong, please try again")
      }
    })
  }

  return (
    <>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            update the course details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Title" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-4 items-end">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col gap-1">
                      <FormLabel>
                        Slug
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Slug" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" className="w-full text-[1rem] h-10 font-bold" onClick={() => {
                  const titlevalue = form.getValues("title")

                  const slug = slugify(titlevalue)
                  form.setValue("slug", slug, { shouldValidate: true })
                }}>
                  Generate Slug
                </Button>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="smallDescription"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Small Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Small Description" className="min-h-30"
                          {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Description
                      </FormLabel>
                      <FormControl>
                        <RichTextEditor
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="fileKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail</FormLabel>
                      <FormControl>
                        <UpLoader value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="trailerVideoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Trailer</FormLabel>
                      <FormControl>
                        <TrailerUploader
                          value={field.value}
                          courseId={course.id}
                          onChange={(videoId, duration) => {
                            field.onChange(videoId ?? "");
                            form.setValue("trailerDuration", duration ?? 0, { shouldValidate: true });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>
                          University
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select university" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{ maxHeight: "500px", overflowY: 'auto' }}>
                            {egyptianUniversities.map((university) => (
                              <SelectItem key={university} value={university}>
                                {university}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>
                          Duration (hours)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Duration"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-1">
                        <FormLabel>
                          Price (EGP)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Price"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1">
                      <FormLabel>
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent style={{ maxHeight: "500px", overflowY: 'auto' }}>
                          {courseStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                disabled={isPending}
                className="w-full h-10 text-[1rem] font-bold">
                {isPending ? "Saving..." : "Save Changes"}
                <Save className="ml-1" size={16} />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}