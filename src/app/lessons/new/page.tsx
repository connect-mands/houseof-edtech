import { createLesson } from "@/actions/lessons";
import { LessonForm } from "@/components/lessons/lesson-form";

export const metadata = { title: "New lesson plan" };
export const dynamic = "force-dynamic";

export default function NewLessonPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Create lesson plan</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">
        Structure objectives, activities, and assessment before sharing with peers.
      </p>
      <LessonForm action={createLesson} submitLabel="Create lesson plan" />
    </div>
  );
}
