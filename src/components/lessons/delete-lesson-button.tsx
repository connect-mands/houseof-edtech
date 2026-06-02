"use client";

import { useTransition } from "react";
import { deleteLesson } from "@/actions/lessons";
import { Button } from "@/components/ui/button";

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this lesson plan permanently?")) return;
        startTransition(() => {
          void deleteLesson(lessonId);
        });
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}
