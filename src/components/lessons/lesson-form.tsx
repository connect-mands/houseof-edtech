"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { LessonActionState } from "@/actions/lessons";
import type { LessonPlan } from "@/lib/db/schema";
import { AiSuggestPanel } from "@/components/lessons/ai-suggest-panel";

type LessonFormProps = {
  action: (
    prev: LessonActionState,
    formData: FormData,
  ) => Promise<LessonActionState>;
  initial?: Partial<LessonPlan>;
  submitLabel: string;
};

const empty: LessonActionState = { success: false };

function FieldError({ errors, name }: { errors?: Record<string, string[]>; name: string }) {
  const msg = errors?.[name]?.[0];
  if (!msg) return null;
  return (
    <p className="text-sm text-red-600" role="alert">
      {msg}
    </p>
  );
}

export function LessonForm({ action, initial, submitLabel }: LessonFormProps) {
  const [state, formAction, pending] = useActionState(action, empty);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="space-y-6" noValidate>
        {state.message && !state.success && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {state.message}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Lesson title</Label>
            <Input id="title" name="title" defaultValue={initial?.title} required />
            <FieldError errors={state.errors} name="title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" defaultValue={initial?.subject} required />
            <FieldError errors={state.errors} name="subject" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">Grade level</Label>
            <Input id="gradeLevel" name="gradeLevel" defaultValue={initial?.gradeLevel} required />
            <FieldError errors={state.errors} name="gradeLevel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={5}
              max={480}
              defaultValue={initial?.durationMinutes ?? 45}
              required
            />
            <FieldError errors={state.errors} name="durationMinutes" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select id="visibility" name="visibility" defaultValue={initial?.visibility ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
              <option value="public">Public (community gallery)</option>
            </Select>
            <FieldError errors={state.errors} name="visibility" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="learningObjectives">Learning objectives</Label>
          <Textarea
            id="learningObjectives"
            name="learningObjectives"
            rows={4}
            defaultValue={initial?.learningObjectives}
            required
          />
          <FieldError errors={state.errors} name="learningObjectives" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activities">Activities & instructional flow</Label>
          <Textarea id="activities" name="activities" rows={6} defaultValue={initial?.activities} required />
          <FieldError errors={state.errors} name="activities" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assessmentStrategy">Assessment strategy</Label>
          <Textarea
            id="assessmentStrategy"
            name="assessmentStrategy"
            rows={4}
            defaultValue={initial?.assessmentStrategy}
            required
          />
          <FieldError errors={state.errors} name="assessmentStrategy" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="materials">Materials & resources</Label>
          <Textarea id="materials" name="materials" rows={3} defaultValue={initial?.materials ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="standards">Standards alignment (optional)</Label>
          <Input id="standards" name="standards" defaultValue={initial?.standards ?? ""} />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <AiSuggestPanel />
      </aside>
    </div>
  );
}
