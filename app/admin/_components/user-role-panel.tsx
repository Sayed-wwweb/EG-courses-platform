"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Search, Loader2, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { searchUsersForAdmin, promoteToInstructor, demoteToStudent } from "../actions";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export function UserRolePanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    const thisRequest = ++requestId.current;

    const timeoutId = setTimeout(() => {
      if (!trimmed) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      searchUsersForAdmin(trimmed).then((result) => {
        if (requestId.current !== thisRequest) return; // a newer search already fired
        if (result.error) {
          toast.error(result.error);
          setUsers([]);
        } else {
          setUsers(result.users ?? []);
        }
        setLoading(false);
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  function handleRoleChange(userId: string, action: "promote" | "demote") {
    setPendingUserId(userId);
    startTransition(async () => {
      const result =
        action === "promote" ? await promoteToInstructor(userId) : await demoteToStudent(userId);

      if (result.error) {
        toast.error(result.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: result.role! } : u))
        );
        toast.success(
          action === "promote" ? "User promoted to instructor." : "User set back to student."
        );
      }
      setPendingUserId(null);
    });
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Manage user roles</h2>
        <p className="text-sm text-muted-foreground">
          Search a student by name or email to make them an instructor.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-8"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {query.trim() && !loading && users.length === 0 && (
        <p className="text-sm text-muted-foreground">No users found.</p>
      )}

      {users.length > 0 && (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
            >
              <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                {u.image ? (
                  <Image src={u.image} alt={u.name} fill className="object-cover" />
                ) : (
                  <UserIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="shrink-0">
                {u.role}
              </Badge>

              {u.role === "STUDENT" && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending && pendingUserId === u.id}
                  onClick={() => handleRoleChange(u.id, "promote")}
                >
                  Make instructor
                </Button>
              )}
              {u.role === "INSTRUCTOR" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isPending && pendingUserId === u.id}
                  onClick={() => handleRoleChange(u.id, "demote")}
                >
                  Revert to student
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}