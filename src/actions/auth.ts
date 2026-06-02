"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { safeQuery } from "@/lib/db/safe-query";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations/lesson";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function checkDatabaseConnection() {
  return safeQuery(
    async () => {
      await db.execute(sql`select 1`);
      return true;
    },
    "checkDatabaseConnection",
  );
}

export async function registerUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existingResult = await safeQuery(
    () => db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1),
    "registerUser:checkEmail",
  );
  if (!existingResult.ok) {
    return { success: false, message: existingResult.message };
  }
  if (existingResult.data.length > 0) {
    return { success: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const insertResult = await safeQuery(
    () =>
      db.insert(users).values({
        name: parsed.data.name,
        email,
        passwordHash,
      }),
    "registerUser:insert",
  );
  if (!insertResult.ok) {
    return { success: false, message: insertResult.message };
  }

  return { success: true, message: "Account created. You can sign in now." };
}
