import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: text("grade").notNull().default("الصف السادس الابتدائي"),
  className: text("class_name").notNull().default("6 / 1"),
  studentCode: text("student_code").notNull().unique(),
  avatar: text("avatar").notNull().default("🦅"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("المعلم المشرف"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  axis: text("axis").notNull(),
  type: text("type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"),
  correctAnswer: jsonb("correct_answer"),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default("فهم"),
  points: integer("points").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  stationNumber: integer("station_number").notNull(),
  status: text("status").notNull().default("not_started"),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  stationNumber: integer("station_number").notNull(),
  activityKey: text("activity_key").notNull(),
  answerType: text("answer_type").notNull(),
  answerText: text("answer_text"),
  audioData: text("audio_data"),
  answerJson: jsonb("answer_json"),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  status: text("status").notNull().default("submitted"),
  teacherFeedback: text("teacher_feedback"),
  teacherScore: integer("teacher_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  percentage: integer("percentage").notNull().default(0),
  passed: boolean("passed").notNull().default(false),
  answersJson: jsonb("answers_json"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const lessonContents = pgTable("lesson_contents", {
  id: serial("id").primaryKey(),
  stationNumber: integer("station_number").notNull().unique(),
  title: text("title").notNull(),
  contentJson: jsonb("content_json"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  code: text("code").notNull().unique(),
  percentage: integer("percentage").notNull().default(0),
  quizScore: integer("quiz_score").notNull().default(0),
  issuedAt: timestamp("issued_at").defaultNow(),
});

export type Student = typeof students.$inferSelect;
export type Teacher = typeof teachers.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
