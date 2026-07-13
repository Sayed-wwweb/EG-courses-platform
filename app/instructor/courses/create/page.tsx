"use client"

import { useForm } from "react-hook-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { courseSchema, CourseSchemaType, courseStatus, egyptianUniversities } from "@/lib/zodSchemas"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"
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
import { TrailerUploader } from "@/components/file-uploader/trailer-uploader"
import { useEffect, useRef, useTransition } from "react"
import { createCourse } from "./action"
import { deleteTrailerVideo } from "./trailer-actions"
import { toast } from "sonner"


const RichTextEditor = dynamic(
  () => import("@/components/rich-text-editor/Editor").then(mod => mod.RichTextEditor),
  { ssr: false }
)


export default function CourseCreationPage () {
    const form = useForm<CourseSchemaType>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            duration: 0,
            level: 'Beginner',
            smallDescription: '',
            slug: '',
            status: 'Draft',
            trailerVideoId: '',
            trailerDuration: 0,
        },
    });

    const [isPending, startTransition] = useTransition()

    // Tracks whether the form was actually submitted successfully — used to
    // decide whether to clean up an orphaned trailer video on unmount/unload.
    const submittedRef = useRef(false)
    const trailerVideoId = form.watch("trailerVideoId")

    function onSubmit(data: CourseSchemaType) {
        startTransition(async () => {
            const result = await createCourse(data)
            if (result?.error) {
                toast.error("Something went wrong, please try again")
                return
            }
            // createCourse redirects on success, but mark this in case it doesn't
            submittedRef.current = true
        })
    }

    // Case 1: browser tab closed or refreshed — sendBeacon fires a best-effort
    // request that survives page teardown, unlike a normal fetch/server action.
    useEffect(() => {
        function handleBeforeUnload() {
            if (submittedRef.current || !trailerVideoId) return

            const payload = JSON.stringify({ videoId: trailerVideoId })
            navigator.sendBeacon(
                "/api/trailer-cleanup",
                new Blob([payload], { type: "application/json" })
            )
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [trailerVideoId])

    // Case 2: in-app navigation away (clicking Back, another link, etc.) —
    // normal React unmount, so a regular server action call is reliable here.
    useEffect(() => {
        return () => {
            if (!submittedRef.current && trailerVideoId) {
                deleteTrailerVideo(trailerVideoId).catch(() => {
                    console.error("Failed to clean up orphaned trailer:", trailerVideoId)
                })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    return (
        <>
            <div className="flex items-center gap-4">
                <Link href={"/instructor/courses"} className={buttonVariants({
                    variant: "outline",
                    size: "icon"
                })}>
                    <ArrowLeft className="size-6"/>
                </Link>
                <h1 className="text-2xl font-bold">Create Courses</h1>
            </div>

            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                        provide basic information about the course
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
                                render= {({field}) => (
                                    <FormItem className="flex flex-col gap-1">
                                        <FormLabel>
                                            Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Title" className="h-10" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                    )}
                                />
                            </div>
                            
                            <div className="flex gap-4 items-end">
                                <FormField
                                control={form.control}
                                name="slug"
                                render= {({field}) => (
                                    <FormItem className="w-full flex flex-col gap-1">
                                        <FormLabel>
                                            Slug
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Slug" className="h-10" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                    )}
                                />

                                <Button type="button" className="w-fit text-[1rem] h-10" onClick={() => {
                                    const titlevalue = form.getValues("title")

                                    const slug = slugify(titlevalue)
                                    form.setValue("slug", slug, {shouldValidate: true})
                                }}>
                                    Generate Slug
                                </Button>
                            </div>

                            <div>
                                <FormField
                                control={form.control}
                                name="smallDescription"
                                render= {({field}) => (
                                    <FormItem className="flex flex-col gap-1">
                                        <FormLabel>
                                            Small Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea 
                                            placeholder="Small Description" className="min-h-30" 
                                            {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <FormField
                                control={form.control}
                                name="description"
                                render= {({field}) => (
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
                                        <FormMessage/>
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
                                    render= {({field}) => (
                                        <FormItem className="flex flex-col gap-1">
                                            <FormLabel>
                                                University
                                            </FormLabel>
                                                <Select 
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select university"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent style={{maxHeight:"500px", overflowY:'auto'}}>
                                                        {egyptianUniversities.map((university) => (
                                                            <SelectItem key={university} value={university}>
                                                                {university}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            <FormMessage/>
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
                                    render= {({field}) => (
                                        <FormItem className="flex flex-col gap-1">
                                            <FormLabel>
                                                Duration (hours)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                placeholder="Duration"
                                                type="number" 
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <FormField
                                    control={form.control}
                                    name="price"
                                    render= {({field}) => (
                                        <FormItem className="flex flex-col gap-1">
                                            <FormLabel>
                                                Price (EGP)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                placeholder="Price"
                                                type="number" 
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div>
                                <FormField
                                control={form.control}
                                name="status"
                                render= {({field}) => (
                                    <FormItem className="flex flex-col gap-1">
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                            <Select 
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent style={{maxHeight:"500px", overflowY:'auto'}}>
                                                    {courseStatus.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        <FormMessage/>
                                    </FormItem>
                                    )}
                                />
                            </div>

                            <Button disabled={isPending}>
                                {isPending ? "Creating..." : "Create Course"}
                                <PlusCircle className="ml-1" size={16}/>
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}