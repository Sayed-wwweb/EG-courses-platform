import { cn } from "@/lib/utils";
import { CloudUploadIcon, ImageIcon } from "lucide-react";
import { Button } from "../ui/button";


export function RenderEmptyState({ isDragActive }: {isDragActive: boolean}) {
    return (
        <div className="text-center flex flex-col items-center">
            <CloudUploadIcon size={60} className="flex items-center pb-3"/>
            <p className="text-base font-semibold text-foreground">
                Drop your files here or <span className="text-primary font-bold cursor-pointer">click to upload</span>
            </p>
            {/* <Button type="button" className="mt-4">
                Select File
            </Button> */}
        </div>
    )
}

export function RenderErrorState() {
    return (
        <div className="text-center">
             <div className="flex items-center mx-auto justify-center size-12 rounded-full bg-destructive/30 mb-4">
                <ImageIcon className={cn(
                    "size-6 text-destructive",
                )}/>
            </div>
            <p className="text-destructive text-base font-semibold">Upload Failed</p>
            <p className="text-xs mt-1 text-muted-foreground">Something went wrong</p>
            <p className="text-lg mt-3 text-muted-foreground cursor-pointer transition-colors duration-200 ease-in-out hover:text-primary ">Click or drag file to retry</p>
        </div>
    )
}