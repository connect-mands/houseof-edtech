import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { LessonPlan } from "@/lib/db/schema";

type LessonCardProps = {
  lesson: Pick<
    LessonPlan,
    | "id"
    | "title"
    | "subject"
    | "gradeLevel"
    | "durationMinutes"
    | "visibility"
    | "updatedAt"
  >;
  authorName?: string;
  showAuthor?: boolean;
};

export function LessonCard({ lesson, authorName, showAuthor }: LessonCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2">
            <Link
              href={`/lessons/${lesson.id}`}
              className="hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              {lesson.title}
            </Link>
          </CardTitle>
          <Badge variant={lesson.visibility === "public" ? "success" : "secondary"}>
            {lesson.visibility}
          </Badge>
        </div>
        {showAuthor && authorName && (
          <p className="text-sm text-slate-600 dark:text-slate-400">by {authorName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <p>
          {lesson.subject} · Grade {lesson.gradeLevel} · {lesson.durationMinutes} min
        </p>
        <p className="text-xs">Updated {formatDate(lesson.updatedAt)}</p>
      </CardContent>
    </Card>
  );
}
