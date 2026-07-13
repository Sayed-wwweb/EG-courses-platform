"use client";

import { useEditor, EditorContent, EditorProvider } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { MenuBar } from "./menubar";
import { useState } from "react";
import TextAline from "@tiptap/extension-text-align"
interface iAppProps {
  onChange: (value: string) => void
  value: string
}

export function RichTextEditor({ onChange, value }: iAppProps) {
  const [, rerender] = useState(0);
  
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
        StarterKit.configure({
            heading: {
                levels: [1, 2, 3],
            },
        }),
        TextAline.configure({
          types: ["heading", "paragraph"]
        })
    ],
        content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: () => {
      rerender(n => n + 1)
    },
    onTransaction: () => {
      rerender(n => n + 1)
    },
 
   });
  return (
    <div className="border border-input rounded-lg bg-accent w-full overflow-hidden dark:bg-input/30">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}