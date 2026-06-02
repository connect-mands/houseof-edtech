"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  aiSuggestSchema,
  formatAiSuggestValidationError,
} from "@/lib/validations/ai-suggest";

type Mode = "differentiation" | "assessment";

function readLessonDraft() {
  return {
    title: (document.getElementById("title") as HTMLInputElement | null)?.value ?? "",
    subject: (document.getElementById("subject") as HTMLInputElement | null)?.value ?? "",
    gradeLevel:
      (document.getElementById("gradeLevel") as HTMLInputElement | null)?.value ?? "",
    learningObjectives:
      (document.getElementById("learningObjectives") as HTMLTextAreaElement | null)?.value ??
      "",
    activities:
      (document.getElementById("activities") as HTMLTextAreaElement | null)?.value ?? "",
  };
}

export function AiSuggestPanel() {
  const [mode, setMode] = useState<Mode>("differentiation");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSuggest() {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    const draft = readLessonDraft();
    const payload = { ...draft, mode };
    const parsed = aiSuggestSchema.safeParse(payload);

    if (!parsed.success) {
      setError(formatAiSuggestValidationError(parsed.error.flatten()));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { error?: string; suggestion?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setSuggestion(data.suggestion ?? "");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI instructional coach</CardTitle>
        <CardDescription>
          Powered by Groq (Llama 3.3). Fill in title, subject, grade, and objectives on the left
          (activities optional), then generate ideas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "differentiation" ? "default" : "outline"}
            onClick={() => setMode("differentiation")}
          >
            Differentiation
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "assessment" ? "default" : "outline"}
            onClick={() => setMode("assessment")}
          >
            Assessment
          </Button>
        </div>
        <Button type="button" className="w-full" onClick={runSuggest} disabled={loading}>
          {loading ? "Generating…" : "Generate suggestions"}
        </Button>
        {error && (
          <p className="text-sm text-amber-800 dark:text-amber-300" role="alert">
            {error}
          </p>
        )}
        {suggestion && (
          <div
            className="max-h-80 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap dark:bg-slate-900"
            aria-live="polite"
          >
            {suggestion}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
