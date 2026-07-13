import { FileText, FileSpreadsheet, Presentation, Lock } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  size: number;
}

interface LockedFilesProps {
  files: FileItem[];
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "xls" || ext === "xlsx") return FileSpreadsheet;
  if (ext === "ppt" || ext === "pptx") return Presentation;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function LockedFiles({ files }: LockedFilesProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Files</h2>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
          {files.length}
        </span>
      </div>

      {files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files attached to this course.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.name);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <Icon className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm text-muted-foreground">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <Lock className="size-4 shrink-0 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}