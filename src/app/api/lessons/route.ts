import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonPlans, users } from "@/lib/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  if (scope === "mine") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessons = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.userId, session.user.id))
      .orderBy(desc(lessonPlans.updatedAt));

    return NextResponse.json({ data: lessons });
  }

  const publicLessons = await db
    .select({
      id: lessonPlans.id,
      title: lessonPlans.title,
      subject: lessonPlans.subject,
      gradeLevel: lessonPlans.gradeLevel,
      durationMinutes: lessonPlans.durationMinutes,
      visibility: lessonPlans.visibility,
      updatedAt: lessonPlans.updatedAt,
      authorName: users.name,
    })
    .from(lessonPlans)
    .innerJoin(users, eq(lessonPlans.userId, users.id))
    .where(eq(lessonPlans.visibility, "public"))
    .orderBy(desc(lessonPlans.updatedAt));

  return NextResponse.json({ data: publicLessons });
}
