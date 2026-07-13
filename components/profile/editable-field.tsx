"use client";

import { useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditableFieldProps {
  value: string | null;
  placeholder: string;
  onSave: (value: string) => Promise<{ error?: string } | void>;
  multiline?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function EditableField({ value, placeholder, onSave, multiline, icon, className }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await onSave(draft.trim());
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setEditing(false);
  }

  function handleCancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2 w-full">
        {multiline ? (
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={3}
          />
        ) : (
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        )}
        <div className="flex gap-1 pt-1.5">
          <button type="button" onClick={handleSave} disabled={saving} className="text-primary">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          </button>
          <button type="button" onClick={handleCancel} disabled={saving} className="text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      {icon}
      <span className={className ?? (value ? "text-sm" : "text-sm text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}