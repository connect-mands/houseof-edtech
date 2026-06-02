import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPublicLessons } from "@/actions/lessons";
import { LessonCard } from "@/components/lessons/lesson-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeQuery } from "@/lib/db/safe-query";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const lessonsResult = await safeQuery(() => getPublicLessons(), "home:getPublicLessons");
  const featured = lessonsResult.ok ? lessonsResult.data.slice(0, 3) : [];
  const dbError = lessonsResult.ok ? null : lessonsResult.message;

  return (
    <div>
      {dbError && (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {dbError}
        </div>
      )}
      <section className="border-b border-slate-200 bg-gradient-to-b from-indigo-50 to-slate-50 dark:border-slate-800 dark:from-indigo-950/40 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
            House of Edtech · Fullstack Assignment
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            Lesson plans that scale from ideation to classroom impact
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            LessonForge helps educators craft structured lesson plans with objectives,
            activities, and assessments—then share vetted resources with peers. AI
            coaching accelerates differentiation without replacing your expertise.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session?.user ? (
              <Button asChild size="lg">
                <Link href="/lessons/new">Create a lesson plan</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/register">Get started free</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link href="/explore">Browse community plans</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Why this is not &quot;another CRUD app&quot;</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Pedagogy-first data model",
              body: "Lessons capture objectives, instructional flow, and assessment—not generic title/description fields.",
            },
            {
              title: "Visibility & trust",
              body: "Draft, private, and public states let educators iterate safely before publishing to the gallery.",
            },
            {
              title: "AI as coach, not autopilot",
              body: "On-demand differentiation and formative assessment suggestions grounded in your lesson context.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Featured from the community</h2>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Public lesson plans shared by educators.
                </p>
              </div>
              <Link href="/explore" className="text-sm font-medium text-indigo-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map(({ lesson, authorName }) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  authorName={authorName}
                  showAuthor
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
