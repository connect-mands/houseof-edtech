import { getPublicLessons } from "@/actions/lessons";
import { LessonCard } from "@/components/lessons/lesson-card";
import { safeQuery } from "@/lib/db/safe-query";

export const metadata = { title: "Explore" };

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const result = await safeQuery(() => getPublicLessons());
  const items = result.ok ? result.data : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Community gallery</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Public lesson plans shared by educators. Read-only for visitors; authors manage their own copies.
      </p>

      {items.length === 0 ? (
        <p className="mt-12 text-center text-slate-600 dark:text-slate-400">
          No public lessons yet. Be the first to publish one!
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ lesson, authorName }) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              authorName={authorName}
              showAuthor
            />
          ))}
        </div>
      )}
    </div>
  );
}
