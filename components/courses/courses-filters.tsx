"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useTransition } from "react";

interface CoursesFiltersProps {
  universities: string[];
}

export function CoursesFilters({ universities }: CoursesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParams(next: { search?: string; university?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.search !== undefined) {
      if (next.search) params.set("search", next.search);
      else params.delete("search");
    }

    if (next.university !== undefined) {
      if (next.university && next.university !== "all") params.set("university", next.university);
      else params.delete("university");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce the search input so we don't push a new URL on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateParams({ search });
    }, 400);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        defaultValue={searchParams.get("university") ?? "all"}
        onValueChange={(value) => updateParams({ university: value })}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="University" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All universities</SelectItem>
          {universities.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}