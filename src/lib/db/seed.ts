import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { lessonPlans, users } from "./schema";

async function seed() {
  const email = "demo@lessonforge.app";
  const passwordHash = await bcrypt.hash("DemoPass1", 12);

  let [existing] = await db
    .insert(users)
    .values({
      name: "Demo Educator",
      email,
      passwordHash,
    })
    .onConflictDoNothing()
    .returning();

  if (!existing) {
    [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  }

  if (!existing) {
    console.log("Could not create demo user");
    process.exit(1);
  }

  await db.insert(lessonPlans).values({
    userId: existing.id,
    title: "Introduction to Photosynthesis",
    subject: "Science",
    gradeLevel: "7",
    durationMinutes: 50,
    learningObjectives:
      "Students will explain how plants convert light energy into chemical energy and identify the role of chlorophyll.",
    activities:
      "1. Warm-up: predict what plants need to grow.\n2. Lab station: leaf chromatography.\n3. Exit ticket: diagram inputs/outputs of photosynthesis.",
    assessmentStrategy:
      "Formative checks during stations; summative diagram labeled with energy transformations.",
    materials: "Spinach leaves, chromatography paper, rubbing alcohol, lamps",
    standards: "NGSS MS-LS1-6",
    visibility: "public",
    updatedAt: new Date(),
  });

  console.log("Seed complete. Demo login:", email, "/ DemoPass1");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
