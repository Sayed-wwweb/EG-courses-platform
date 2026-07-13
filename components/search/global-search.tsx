"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User as UserIcon, BookOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/app/(public)/search-actions";
import Image from "next/image";
import { env } from "@/lib/env";

interface SearchUser {
  id: string;
  name: string;
  image: string | null;
  role: string;
}

interface SearchCourse {
  id: string;
  title: string;
  slug: string;
  fileKey: string | null;
}

interface GlobalSearchProps {
  onNavigate?: () => void;
  className?: string;
}

export function GlobalSearch({ onNavigate, className }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ users: SearchUser[]; courses: SearchCourse[] }>({
    users: [],
    courses: [],
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();

    const timeoutId = setTimeout(() => {
      if (!trimmed) {
        setResults({ users: [], courses: [] });
        setOpen(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      globalSearch(trimmed).then((result) => {
        setResults(result);
        setLoading(false);
        setOpen(true);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goTo(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
    onNavigate?.();
  }

  const { users, courses } = results;
  const hasResults = users.length > 0 || courses.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users or courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          className="pl-8 h-9"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-50 max-h-80 overflow-y-auto">
          {!hasResults && !loading && (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">
              No results for &quot;{query}&quot;
            </p>
          )}

          {users.length > 0 && (
            <div className="p-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Users</p>
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => goTo(`/profile/${u.id}`)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted text-left"
                >
                  <div className="relative size-6 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {u.image ? (
                      <Image src={u.image} alt={u.name} fill className="object-cover" />
                    ) : (
                      <UserIcon className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="truncate">{u.name}</span>
                  {u.role === "INSTRUCTOR" && (
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">Instructor</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div className="p-1 border-t">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Courses</p>
              {courses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goTo(`/courses/${c.slug}`)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted text-left"
                >
                  <div className="relative size-6 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {c.fileKey ? (
                      <Image
                        src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${c.fileKey}`}
                        alt={c.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="size-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}