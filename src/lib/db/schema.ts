import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const visibilityEnum = pgEnum("lesson_visibility", [
  "draft",
  "public",
  "private",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const lessonPlans = pgTable(
  "lesson_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    subject: text("subject").notNull(),
    gradeLevel: text("grade_level").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(45),
    learningObjectives: text("learning_objectives").notNull(),
    activities: text("activities").notNull(),
    assessmentStrategy: text("assessment_strategy").notNull(),
    materials: text("materials").notNull().default(""),
    standards: text("standards").notNull().default(""),
    visibility: visibilityEnum("visibility").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("lesson_plans_user_id_idx").on(table.userId),
    index("lesson_plans_visibility_idx").on(table.visibility),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  lessonPlans: many(lessonPlans),
}));

export const lessonPlansRelations = relations(lessonPlans, ({ one }) => ({
  author: one(users, {
    fields: [lessonPlans.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type LessonPlan = typeof lessonPlans.$inferSelect;
export type NewLessonPlan = typeof lessonPlans.$inferInsert;
