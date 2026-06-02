import { describe, expect, it } from "vitest";
import { lessonPlanSchema, registerSchema } from "./lesson";

describe("lessonPlanSchema", () => {
  const valid = {
    title: "Fractions on a number line",
    subject: "Mathematics",
    gradeLevel: "4",
    durationMinutes: 45,
    learningObjectives:
      "Students will represent fractions on a number line using denominators 2, 4, and 8.",
    activities:
      "Launch with a number line warm-up, guided practice in pairs, independent worksheet, and share-out.",
    assessmentStrategy:
      "Observe pair work and collect exit tickets showing two labeled fractions.",
    visibility: "draft" as const,
  };

  it("accepts a valid lesson plan", () => {
    expect(lessonPlanSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short titles", () => {
    const result = lessonPlanSchema.safeParse({ ...valid, title: "AB" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("requires a strong password", () => {
    const result = registerSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "weak",
    });
    expect(result.success).toBe(false);
  });
});
