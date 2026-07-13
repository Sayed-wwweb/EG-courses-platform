"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { becomeInstructor } from "@/app/(public)/profile/profile-actions";

export function BecomeInstructorButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await becomeInstructor();

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleClick} disabled={isPending}>
        {isPending ? "Please wait..." : "Become an instructor"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}