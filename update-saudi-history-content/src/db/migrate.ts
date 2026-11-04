import { sql } from "drizzle-orm";
import { getDb } from "@/db";

/**
 * ترحيل آمن وخالٍ من التدمير لقاعدة الإنتاج.
 * - يستخدم CREATE TABLE IF NOT EXISTS و ADD COLUMN IF NOT EXISTS فقط.
 * - لا يوجد DROP / TRUNCATE / DELETE إطلاقًا — البيانات المحفوظة لا تُمس.
 * - يُطابق src/db/schema.ts عمودًا بعمود.
 * - آمن للتكرار: يمكن تشغيله عدة مرات دون أي أثر جانبي.
 */

const CREATE_TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS "students" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL DEFAULT 'الصف السادس الابتدائي',
    "class_name" TEXT NOT NULL DEFAULT '6 / 1',
    "student_code" TEXT NOT NULL UNIQUE,
    "avatar" TEXT NOT NULL DEFAULT '🦅',
    "created_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "teachers" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'المعلم المشرف',
    "created_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "questions" (
    "id" SERIAL PRIMARY KEY,
    "axis" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" JSONB,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'فهم',
    "points" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "student_progress" (
    "id" SERIAL PRIMARY KEY,
    "student_id" INTEGER NOT NULL,
    "station_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "answers" (
    "id" SERIAL PRIMARY KEY,
    "student_id" INTEGER NOT NULL,
    "station_number" INTEGER NOT NULL,
    "activity_key" TEXT NOT NULL,
    "answer_type" TEXT NOT NULL,
    "audio_data" TEXT,
    "answer_text" TEXT,
    "answer_json" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "teacher_feedback" TEXT,
    "teacher_score" INTEGER,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "quiz_attempts" (
    "id" SERIAL PRIMARY KEY,
    "student_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 0,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT FALSE,
    "answers_json" JSONB,
    "started_at" TIMESTAMP DEFAULT NOW(),
    "completed_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "lesson_contents" (
    "id" SERIAL PRIMARY KEY,
    "station_number" INTEGER NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "content_json" JSONB,
    "updated_at" TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "certificates" (
    "id" SERIAL PRIMARY KEY,
    "student_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "quiz_score" INTEGER NOT NULL DEFAULT 0,
    "issued_at" TIMESTAMP DEFAULT NOW()
  )`,
];

/** أعمدة احتياطية لجداول قديمة ناقصة (بدون NOT NULL لتكون آمنة على بيانات موجودة). */
const ADD_COLUMNS: string[] = [
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "name" TEXT`,
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "grade" TEXT DEFAULT 'الصف السادس الابتدائي'`,
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "class_name" TEXT DEFAULT '6 / 1'`,
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "student_code" TEXT`,
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "avatar" TEXT DEFAULT '🦅'`,
  `ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "username" TEXT`,
  `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "password" TEXT`,
  `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "name" TEXT DEFAULT 'المعلم المشرف'`,
  `ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "axis" TEXT`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "type" TEXT`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "question_text" TEXT`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "options" JSONB`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "correct_answer" JSONB`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "explanation" TEXT`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "difficulty" TEXT DEFAULT 'فهم'`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "points" INTEGER DEFAULT 1`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT TRUE`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0`,
  `ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "student_id" INTEGER`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "station_number" INTEGER`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'not_started'`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "score" INTEGER DEFAULT 0`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "max_score" INTEGER DEFAULT 0`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP`,
  `ALTER TABLE "student_progress" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "student_id" INTEGER`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "station_number" INTEGER`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "activity_key" TEXT`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "answer_type" TEXT`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "answer_text" TEXT`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "audio_data" TEXT`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "answer_json" JSONB`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "score" INTEGER DEFAULT 0`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "max_score" INTEGER DEFAULT 0`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'submitted'`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "teacher_feedback" TEXT`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "teacher_score" INTEGER`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "answers" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "student_id" INTEGER`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "score" INTEGER DEFAULT 0`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "max_score" INTEGER DEFAULT 0`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "percentage" INTEGER DEFAULT 0`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "passed" BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "answers_json" JSONB`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "quiz_attempts" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "lesson_contents" ADD COLUMN IF NOT EXISTS "station_number" INTEGER`,
  `ALTER TABLE "lesson_contents" ADD COLUMN IF NOT EXISTS "title" TEXT`,
  `ALTER TABLE "lesson_contents" ADD COLUMN IF NOT EXISTS "content_json" JSONB`,
  `ALTER TABLE "lesson_contents" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT NOW()`,
  `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "student_id" INTEGER`,
  `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "code" TEXT`,
  `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "percentage" INTEGER DEFAULT 0`,
  `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "quiz_score" INTEGER DEFAULT 0`,
  `ALTER TABLE "certificates" ADD COLUMN IF NOT EXISTS "issued_at" TIMESTAMP DEFAULT NOW()`,
];

const UNIQUE_INDEXES: string[] = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "students_code_uidx" ON "students" ("student_code")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "teachers_username_uidx" ON "teachers" ("username")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "lesson_contents_station_uidx" ON "lesson_contents" ("station_number")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "certificates_code_uidx" ON "certificates" ("code")`,
];

export const EXPECTED_TABLES = [
  "students",
  "teachers",
  "questions",
  "student_progress",
  "answers",
  "quiz_attempts",
  "lesson_contents",
  "certificates",
];

/** ينفّذ الترحيل الآمن. يُرجع عدد العبارات المنفذة. */
export async function runSafeMigration(): Promise<{ statements: number }> {
  const db = getDb();
  let count = 0;
  for (const ddl of [...CREATE_TABLES, ...ADD_COLUMNS, ...UNIQUE_INDEXES]) {
    await db.execute(sql.raw(ddl));
    count++;
  }
  return { statements: count };
}
