import { generateText } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mapAiProviderError } from "@/lib/ai/errors";
import { getGroqApiKey, getGroqModel } from "@/lib/ai/groq";
import {
  aiSuggestSchema,
  formatAiSuggestValidationError,
} from "@/lib/validations/ai-suggest";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getGroqApiKey()) {
    return NextResponse.json(
      {
        error:
          "AI suggestions are disabled. Set GROQ_API_KEY in .env (get a free key at https://console.groq.com/keys).",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = aiSuggestSchema.safeParse(body);
  if (!parsed.success) {
    const message = formatAiSuggestValidationError(parsed.error.flatten());
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { mode, ...lesson } = parsed.data;
  const activities =
    lesson.activities.trim() ||
    "Not specified yet — infer reasonable activities from the other fields.";

  const prompt =
    mode === "differentiation"
      ? `You are an instructional coach. Based on this lesson plan, suggest 3 concrete differentiation strategies (support, on-level, extension). Use bullet points and keep each under 80 words.

Title: ${lesson.title}
Subject: ${lesson.subject}
Grade: ${lesson.gradeLevel}
Objectives: ${lesson.learningObjectives}
Activities: ${activities}`
      : `You are an assessment designer. Based on this lesson plan, propose 5 formative assessment questions/checks for understanding with brief rubric cues. Use numbered list.

Title: ${lesson.title}
Subject: ${lesson.subject}
Grade: ${lesson.gradeLevel}
Objectives: ${lesson.learningObjectives}
Activities: ${activities}`;

  try {
    const { text } = await generateText({
      model: getGroqModel(),
      prompt,
      maxOutputTokens: 800,
    });

    return NextResponse.json({ suggestion: text.trim() });
  } catch (error) {
    const { message, status } = mapAiProviderError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
