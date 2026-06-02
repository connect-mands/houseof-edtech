import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  canViewLesson,
  getLessonById,
} from "@/actions/lessons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteLessonButton } from "@/components/lessons/delete-lesson-button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getLessonById(id);
  return { title: row?.lesson.title ?? "Lesson plan" };
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const row = await getLessonById(id);

  if (!row) notFound();

  const allowed = await canViewLesson(row.lesson, session?.user?.id);
  if (!allowed) redirect("/login?callbackUrl=" + encodeURIComponent(`/lessons/${id}`));

  const isOwner = session?.user?.id === row.authorId;
  const { lesson } = row;

  const sections = [
    { label: "Learning objectives", value: lesson.learningObjectives },
    { label: "Activities", value: lesson.activities },
    { label: "Assessment strategy", value: lesson.assessmentStrategy },
    { label: "Materials", value: lesson.materials },
    { label: "Standards", value: lesson.standards },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant={lesson.visibility === "public" ? "success" : "secondary"}>
            {lesson.visibility}
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {lesson.subject} · Grade {lesson.gradeLevel} · {lesson.durationMinutes}{" "}
            minutes · by {row.authorName}
          </p>
          <p className="text-sm text-slate-500">Updated {formatDate(lesson.updatedAt)}</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/lessons/${lesson.id}/edit`}>Edit</Link>
            </Button>
            <DeleteLessonButton lessonId={lesson.id} />
          </div>
        )}
      </div>

      <div className="space-y-8">
        {sections.map(
          (s) =>
            s.value?.trim() && (
              <section key={s.label}>
                <h2 className="text-lg font-semibold">{s.label}</h2>
                <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {s.value}
                </p>
              </section>
            ),
        )}
      </div>
    </article>
  );
}
