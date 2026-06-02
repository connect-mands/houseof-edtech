import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLessonById, updateLesson } from "@/actions/lessons";
import { LessonForm } from "@/components/lessons/lesson-form";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const row = await getLessonById(id);
  if (!row || row.authorId !== session.user.id) notFound();

  const boundUpdate = updateLesson.bind(null, id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Edit lesson plan</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">{row.lesson.title}</p>
      <LessonForm
        action={boundUpdate}
        initial={row.lesson}
        submitLabel="Save changes"
      />
    </div>
  );
}
