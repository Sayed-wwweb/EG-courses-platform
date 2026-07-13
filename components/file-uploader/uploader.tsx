"use client";

import { FileRejection, useDropzone } from 'react-dropzone'
import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';
import { RenderEmptyState, RenderErrorState } from './renderState';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { XIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { uploadThumbnail, deleteThumbnail } from '@/lib/actions/upload';
import { env } from '@/lib/env';
import Image from 'next/image';


interface UploaderState {
    id: string | null;
    file: File | null;
    uploading: boolean;
    progress: number;
    key?: string;
    isDeleting: boolean;
    error: boolean;
    objectUrl?: string;
    fileType: "image" | "video";
}

interface UploaderProps {
    value?: string;                              // existing fileKey, for edit forms
    onChange: (value: string | undefined) => void;
}

export function UpLoader({ value, onChange }: UploaderProps) {

    const [fileState, setFileState] = useState<UploaderState>({
        error: false,
        file: null,
        id: null,
        uploading: false,
        progress: 0,
        isDeleting: false,
        fileType: "image",
        key: value,
    })

    async function uploadFile(file: File) {
        const previousKey = fileState.key; // capture before we overwrite state

        setFileState((prev) => ({
            ...prev,
            uploading: true,
            progress: 0,
            error: false,
        }))

        const progressInterval = setInterval(() => {
            setFileState((prev) => ({
                ...prev,
                progress: prev.progress < 90 ? prev.progress + 10 : prev.progress,
            }))
        }, 200)

        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadThumbnail(formData);
            console.log("uploadThumbnail result:", result);
            clearInterval(progressInterval);

            if (result.error || !result.fileKey) {
                toast.error(result.error ?? "Upload failed.");
                setFileState((prev) => ({ ...prev, uploading: false, error: true, progress: 0 }))
                return;
            }

            setFileState((prev) => ({ ...prev, uploading: false, progress: 100, key: result.fileKey }))
            onChange(result.fileKey);
            toast.success("Thumbnail uploaded.");

            // Clean up the old file now that the new one is confirmed working.
            // Fire-and-forget: if this fails, it's an orphaned file we can clean
            // up manually later — not worth blocking or erroring the UI over.
            if (previousKey) {
                deleteThumbnail(previousKey).catch(() => {
                    console.error("Failed to clean up old thumbnail:", previousKey);
                });
            }
        } catch (err) {
            console.error("uploadFile threw:", err);
            clearInterval(progressInterval);
            toast.error("Something went wrong during upload.");
            setFileState((prev) => ({ ...prev, uploading: false, error: true, progress: 0 }))
        }
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]

            // Revoke any previous preview URL before making a new one
            if (fileState.objectUrl) {
                URL.revokeObjectURL(fileState.objectUrl);
            }

            setFileState({
                file: file,
                uploading: false,
                progress: 0,
                objectUrl: URL.createObjectURL(file),
                error: false,
                id: uuidv4(),
                isDeleting: false,
                fileType: "image",
            })

            uploadFile(file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileState.objectUrl])

    async function handleRemove() {
        if (!fileState.key) return;

        setFileState((prev) => ({ ...prev, isDeleting: true }));

        const result = await deleteThumbnail(fileState.key);

        if (result.error) {
            toast.error(result.error);
            setFileState((prev) => ({ ...prev, isDeleting: false }));
            return;
        }

        if (fileState.objectUrl) {
            URL.revokeObjectURL(fileState.objectUrl);
        }

        setFileState({
            error: false,
            file: null,
            id: null,
            uploading: false,
            progress: 0,
            isDeleting: false,
            fileType: "image",
            key: undefined,
            objectUrl: undefined,
        });

        onChange(undefined);
        toast.success("Thumbnail removed.");
    }

    function RejectedFiles(fileRejections: FileRejection[]) {
        if (fileRejections.length) {
            const TooManyFiles = fileRejections.find((rejection) => rejection.errors[0].code === "too-many-files")
            const fileSizeToBig = fileRejections.find((rejection) => rejection.errors[0].code === "file-too-large")

            if (fileSizeToBig) {
                toast.error("File size exceeds the 5MB limit")
            }

            if (TooManyFiles) {
                toast.error("Too many files selected, Max is one")
            }
        }
    }

    // Clean up the blob URL when the component unmounts, so we don't leak memory
    useEffect(() => {
        return () => {
            if (fileState.objectUrl) {
                URL.revokeObjectURL(fileState.objectUrl);
            }
        }
    }, [fileState.objectUrl])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { "image/*": [] },
        maxFiles: 1,
        multiple: false,
        maxSize: 5 * 1024 * 1024,
        onDropRejected: RejectedFiles,
        disabled: fileState.uploading || fileState.isDeleting,
    });

    function renderContent() {
        if (fileState.uploading) {
            return (
                <div className="text-center flex flex-col items-center gap-3">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading... {fileState.progress}%</p>
                </div>
            )
        }

        if (fileState.error) {
            return <RenderErrorState />
        }

        // New file just selected/uploaded — show local preview
        if (fileState.objectUrl) {
            return (
                <div className="relative h-full w-full">
                    <Image
                        src={fileState.objectUrl}
                        alt="Thumbnail preview"
                        fill
                        unoptimized
                        className="object-cover rounded-md"
                    />
                    {!fileState.uploading && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                            disabled={fileState.isDeleting}
                        >
                            <XIcon className="size-4" />
                        </Button>
                    )}
                </div>
            )
        }

        // Existing thumbnail from a previous save (edit form) — no local file, just a key
        if (fileState.key) {
            return (
                <div className="relative h-full w-full">
                    <Image
                        src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${fileState.key}`}
                        alt="Current thumbnail"
                        fill
                        className="object-cover rounded-md"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                        disabled={fileState.isDeleting}
                    >
                        <XIcon className="size-4" />
                    </Button>
                </div>
            )
        }

        return <RenderEmptyState isDragActive={isDragActive} />
    }

    return (
        <Card
            {...getRootProps()}
            className={cn('relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full aspect-video',
                isDragActive
                    ? "border-primary bg-primary/10 border-solid"
                    : "border-border hover:border-primary"
            )}
        >
            <CardContent className='flex items-center justify-center h-full w-full p-4'>
                <input {...getInputProps()} />
                {renderContent()}
            </CardContent>
        </Card>
    )
}