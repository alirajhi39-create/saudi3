import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QUESTION_BANK } from "@/lib/content";

// pg (عبر drizzle-orm/node-postgres) يستخدم Node.js APIs ولا يعمل على Edge.
export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

function toDbFormat() {
  return QUESTION_BANK.map((q, i) => ({
    axis: q.axisLabel,
    type: q.type,
    questionText: q.question,
    options: q.options ? q.options : q.pairs ? q.pairs : q.orderItems ? q.orderItems : q.categories ? q.categories : null,
    correctAnswer: typeof q.correct === "string" ? { value: q.correct } : q.correct ? { value: q.correct } : null,
    explanation: q.explanation,
    difficulty: q.difficulty,
    points: q.points,
    sortOrder: i,
  }));
}

async function ensureSeeded() {
  const existing = await db.select().from(questions);
  if (existing.length === 0) {
    const seed = toDbFormat();
    for (const s of seed) {
      await db.insert(questions).values(s as never);
    }
  }
  return db.select().from(questions);
}

export async function GET() {
  try {
    const rows = await ensureSeeded();
    const sorted = [...rows].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return NextResponse.json({ questions: sorted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { axis, type, questionText, options, correctAnswer, explanation, difficulty, points } = body;
    if (!questionText) return NextResponse.json({ error: "نص السؤال مطلوب" }, { status: 400 });
    const rows = await db.insert(questions).values({
      axis: String(axis || "مراجعة شاملة"),
      type: String(type || "mcq"),
      questionText: String(questionText),
      options: options ?? null,
      correctAnswer: correctAnswer ?? null,
      explanation: explanation ? String(explanation) : undefined,
      difficulty: String(difficulty || "فهم"),
      points: Number(points || 1),
    }).returning();
    return NextResponse.json({ question: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    const patch: Record<string, unknown> = {};
    if (fields.axis !== undefined) patch.axis = String(fields.axis);
    if (fields.type !== undefined) patch.type = String(fields.type);
    if (fields.questionText !== undefined) patch.questionText = String(fields.questionText);
    if (fields.options !== undefined) patch.options = fields.options;
    if (fields.correctAnswer !== undefined) patch.correctAnswer = fields.correctAnswer;
    if (fields.explanation !== undefined) patch.explanation = String(fields.explanation);
    if (fields.difficulty !== undefined) patch.difficulty = String(fields.difficulty);
    if (fields.points !== undefined) patch.points = Number(fields.points);
    if (fields.isActive !== undefined) patch.isActive = Boolean(fields.isActive);
    await db.update(questions).set(patch as never).where(eq(questions.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    const { questions: q } = await import("@/db/schema");
    await db.delete(q).where(eq(q.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
