DO $$ BEGIN
  CREATE TYPE "public"."lesson_visibility" AS ENUM('draft', 'public', 'private');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "lesson_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "subject" text NOT NULL,
  "grade_level" text NOT NULL,
  "duration_minutes" integer DEFAULT 45 NOT NULL,
  "learning_objectives" text NOT NULL,
  "activities" text NOT NULL,
  "assessment_strategy" text NOT NULL,
  "materials" text DEFAULT '' NOT NULL,
  "standards" text DEFAULT '' NOT NULL,
  "visibility" "lesson_visibility" DEFAULT 'draft' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "lesson_plans_user_id_idx" ON "lesson_plans" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "lesson_plans_visibility_idx" ON "lesson_plans" USING btree ("visibility");
