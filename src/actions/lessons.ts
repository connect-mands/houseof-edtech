"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonPlans, users } from "@/lib/db/schema";
import { lessonPlanSchema } from "@/lib/validations/lesson";

export type LessonActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

function parseLessonForm(formData: FormData) {
  return lessonPlanSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    gradeLevel: formData.get("gradeLevel"),
    durationMinutes: formData.get("durationMinutes"),
    learningObjectives: formData.get("learningObjectives"),
    activities: formData.get("activities"),
    assessmentStrategy: formData.get("assessmentStrategy"),
    materials: formData.get("materials") || "",
    standards: formData.get("standards") || "",
    visibility: formData.get("visibility") || "draft",
  });
}

export async function createLesson(
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Sign in to create lesson plans." };
  }

  const parsed = parseLessonForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const [created] = await db
    .insert(lessonPlans)
    .values({
      ...parsed.data,
      userId: session.user.id,
      updatedAt: new Date(),
    })
    .returning({ id: lessonPlans.id });

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  redirect(`/lessons/${created.id}`);
}

export async function updateLesson(
  lessonId: string,
  _prev: LessonActionState,
  formData: FormData,
): Promise<LessonActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Sign in to edit lesson plans." };
  }

  const parsed = parseLessonForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const result = await db
    .update(lessonPlans)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(lessonPlans.id, lessonId),
        eq(lessonPlans.userId, session.user.id),
      ),
    )
    .returning({ id: lessonPlans.id });

  if (result.length === 0) {
    return { success: false, message: "Lesson not found or access denied." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  revalidatePath(`/lessons/${lessonId}`);
  redirect(`/lessons/${lessonId}`);
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Sign in required." };
  }

  await db
    .delete(lessonPlans)
    .where(
      and(
        eq(lessonPlans.id, lessonId),
        eq(lessonPlans.userId, session.user.id),
      ),
    );

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  redirect("/dashboard");
}

export async function getMyLessons(userId: string) {
  return db
    .select()
    .from(lessonPlans)
    .where(eq(lessonPlans.userId, userId))
    .orderBy(desc(lessonPlans.updatedAt));
}

export async function getPublicLessons() {
  return db
    .select({
      lesson: lessonPlans,
      authorName: users.name,
    })
    .from(lessonPlans)
    .innerJoin(users, eq(lessonPlans.userId, users.id))
    .where(eq(lessonPlans.visibility, "public"))
    .orderBy(desc(lessonPlans.updatedAt));
}

export async function getLessonById(lessonId: string) {
  const [row] = await db
    .select({
      lesson: lessonPlans,
      authorName: users.name,
      authorId: users.id,
    })
    .from(lessonPlans)
    .innerJoin(users, eq(lessonPlans.userId, users.id))
    .where(eq(lessonPlans.id, lessonId))
    .limit(1);

  return row ?? null;
}

export async function canViewLesson(
  lesson: { userId: string; visibility: string },
  viewerId?: string,
) {
  if (lesson.visibility === "public") return true;
  if (!viewerId) return false;
  return lesson.userId === viewerId;
}