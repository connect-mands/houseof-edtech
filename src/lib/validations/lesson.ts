import { z } from "zod";

export const lessonVisibilitySchema = z.enum(["draft", "public", "private"]);

export const lessonPlanSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters"),
  subject: z
    .string()
    .trim()
    .min(2, "Subject is required")
    .max(80),
  gradeLevel: z
    .string()
    .trim()
    .min(1, "Grade level is required")
    .max(40),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(480, "Maximum duration is 8 hours"),
  learningObjectives: z
    .string()
    .trim()
    .min(20, "Add meaningful learning objectives")
    .max(4000),
  activities: z
    .string()
    .trim()
    .min(20, "Describe classroom activities")
    .max(8000),
  assessmentStrategy: z
    .string()
    .trim()
    .min(10, "Describe how you will assess learning")
    .max(4000),
  materials: z.string().trim().max(2000).optional().default(""),
  standards: z.string().trim().max(1000).optional().default(""),
  visibility: lessonVisibilitySchema.default("draft"),
});

export type LessonPlanInput = z.infer<typeof lessonPlanSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
