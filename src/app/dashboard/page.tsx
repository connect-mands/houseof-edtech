import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyLessons } from "@/actions/lessons";
import { LessonCard } from "@/components/lessons/lesson-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Lessons" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const lessons = await getMyLessons(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My lesson plans</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Create, refine, and publish your instructional designs.
          </p>
        </div>
        <Button asChild>
          <Link href="/lessons/new">New lesson plan</Link>
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            You have not created any lesson plans yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/lessons/new">Create your first lesson</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
