"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Search, Loader2, User as UserIcon, BookOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { env } from "@/lib/env";
import {
  searchUsersForAdmin,
  searchCoursesForAdmin,
  grantCourseAccess,
  revokeCourseAccess,
} from "../actions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Published" | "Archived";
  fileKey: string | null;
  user: { name: string };
}

export function EnrollmentPanel() {
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<AdminUser[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const userRequestId = useRef(0);

  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState<AdminCourse[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const courseRequestId = useRef(0);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = userQuery.trim();
    const thisRequest = ++userRequestId.current;
    const timeoutId = setTimeout(() => {
      if (!trimmed) {
        setUserResults([]);
        setUserLoading(false);
        return;
      }
      setUserLoading(true);
      searchUsersForAdmin(trimmed).then((result) => {
        if (userRequestId.current !== thisRequest) return;
        if (result.error) {
          toast.error(result.error);
          setUserResults([]);
        } else {
          setUserResults(result.users ?? []);
        }
        setUserLoading(false);
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [userQuery]);

  useEffect(() => {
    const trimmed = courseQuery.trim();
    const thisRequest = ++courseRequestId.current;
    const timeoutId = setTimeout(() => {
      if (!trimmed) {
        setCourseResults([]);
        setCourseLoading(false);
        return;
      }
      setCourseLoading(true);
      searchCoursesForAdmin(trimmed).then((result) => {
        if (courseRequestId.current !== thisRequest) return;
        if (result.error) {
          toast.error(result.error);
          setCourseResults([]);
        } else {
          setCourseResults(result.courses ?? []);
        }
        setCourseLoading(false);
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [courseQuery]);

  function handleGrant() {
    if (!selectedUser || !selectedCourse) return;
    startTransition(async () => {
      const result = await grantCourseAccess(selectedUser.id, selectedCourse.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Access granted to ${selectedUser.name} for "${selectedCourse.title}".`);
      }
    });
  }

  function handleRevoke() {
    if (!selectedUser || !selectedCourse) return;
    startTransition(async () => {
      const result = await revokeCourseAccess(selectedUser.id, selectedCourse.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Access revoked for ${selectedUser.name} on "${selectedCourse.title}".`);
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Grant course access</h2>
        <p className="text-sm text-muted-foreground">
          Pick a student and a course to activate (or remove) their enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Student picker */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Student
          </p>
          {selectedUser ? (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                {selectedUser.image ? (
                  <Image src={selectedUser.image} alt={selectedUser.name} fill className="object-cover" />
                ) : (
                  <UserIcon className="size-3.5 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 min-w-0 truncate text-sm font-medium">{selectedUser.name}</span>
              <button type="button" onClick={() => setSelectedUser(null)} aria-label="Clear student">
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search students..."
                className="pl-8"
              />
              {userLoading && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
              {userResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-10 max-h-56 overflow-y-auto">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u);
                        setUserQuery("");
                        setUserResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                    >
                      <span className="truncate flex-1">{u.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{u.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Course picker */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Course
          </p>
          {selectedCourse ? (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div className="relative size-7 shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
                {selectedCourse.fileKey ? (
                  <Image
                    src={`${env.NEXT_PUBLIC_BUNNY_CDN_URL}/${selectedCourse.fileKey}`}
                    alt={selectedCourse.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <BookOpen className="size-3.5 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1 min-w-0 truncate text-sm font-medium">{selectedCourse.title}</span>
              <button type="button" onClick={() => setSelectedCourse(null)} aria-label="Clear course">
                <X className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                placeholder="Search courses..."
                className="pl-8"
              />
              {courseLoading && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
              {courseResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-popover shadow-md z-10 max-h-56 overflow-y-auto">
                  {courseResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(c);
                        setCourseQuery("");
                        setCourseResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                    >
                      <span className="truncate flex-1">{c.title}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {c.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          disabled={!selectedUser || !selectedCourse || isPending}
          onClick={handleGrant}
        >
          Grant access
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedUser || !selectedCourse || isPending}
          onClick={handleRevoke}
        >
          Revoke access
        </Button>
      </div>
    </div>
  );
}