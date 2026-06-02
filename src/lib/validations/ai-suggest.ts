import { z } from "zod";

/** Looser than full lesson save — enough context for coaching on a draft. */
export const aiSuggestSchema = z.object({
  title: z.string().trim().min(3, "title (at least 3 characters)"),
  subject: z.string().trim().min(2, "subject"),
  gradeLevel: z.string().trim().min(1, "grade level"),
  learningObjectives: z
    .string()
    .trim()
    .min(5, "learning objectives (at least a short sentence)"),
  activities: z.string().trim().max(8000).optional().default(""),
  mode: z.enum(["differentiation", "assessment"]),
});

export type AiSuggestInput = z.infer<typeof aiSuggestSchema>;

const fieldLabels: Record<string, string> = {
  title: "Title",
  subject: "Subject",
  gradeLevel: "Grade level",
  learningObjectives: "Learning objectives",
  activities: "Activities",
};

export function formatAiSuggestValidationError(
  flattened: z.core.$ZodFlattenedError<AiSuggestInput>,
): string {
  const parts = Object.entries(flattened.fieldErrors)
    .filter(([, messages]) => messages && messages.length > 0)
    .map(([key, messages]) => {
      const label = fieldLabels[key] ?? key;
      return `${label}: ${messages![0]}`;
    });

  if (parts.length === 0) {
    return "Fill in the lesson form on the left before generating suggestions.";
  }

  return `Add more detail in the form first — ${parts.join("; ")}.`;
}
