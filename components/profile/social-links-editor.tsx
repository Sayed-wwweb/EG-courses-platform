"use client";

import { useState } from "react";
import { Pencil, Link2, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  discord?: string;
}

interface SocialLinksEditorProps {
  value: SocialLinks | null;
  onSave: (value: SocialLinks) => Promise<{ error?: string } | void>;
}

const PLATFORMS: { key: keyof SocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "discord", label: "Discord" },
];

export function SocialLinksEditor({ value, onSave }: SocialLinksEditorProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SocialLinks>(value ?? {});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await onSave(draft);
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
  }

  const links = value ?? {};
  const activeLinks = PLATFORMS.filter((p) => links[p.key]);

  return (
    <div className="group flex flex-col gap-2">
      {activeLinks.map((p) => (
        <a
          key={p.key}
          href={links[p.key]}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link2 className="size-3.5" />
          {p.label}
        </a>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit ${
              activeLinks.length > 0 ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""
            }`}
          >
            <Pencil className="size-3.5" />
            {activeLinks.length === 0 && "Add social links"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 space-y-2">
          <Input
            placeholder="Facebook URL"
            value={draft.facebook ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, facebook: e.target.value }))}
          />
          <Input
            placeholder="Instagram URL"
            value={draft.instagram ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, instagram: e.target.value }))}
          />
          <Input
            placeholder="Discord invite/username"
            value={draft.discord ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, discord: e.target.value }))}
          />
          <Button type="button" size="sm" className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}