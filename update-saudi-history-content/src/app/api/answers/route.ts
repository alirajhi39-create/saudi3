import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { answers } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET ?studentId=&stationNumber?=&needsReview?=1
// POST save answer
// PUT teacher review {id, teacherFeedback, teacherScore, status}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const stationNumber = searchParams.get("stationNumber");
    const needsReview = searchParams.get("needsReview");
    let rows = await db.select().from(answers).orderBy(desc(answers.createdAt));
    if (studentId) rows = rows.filter((r) => String(r.studentId) === String(studentId));
    if (stationNumber) rows = rows.filter((r) => String(r.stationNumber) === String(stationNumber));
    if (needsReview === "1") rows = rows.filter((r) => r.status === "needs_review" || r.status === "submitted");
    return NextResponse.json({ answers: rows });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, stationNumber, activityKey, answerType, answerText, audioData, answerJson, score, maxScore, status } = body;
    if (!studentId || !stationNumber || !activityKey) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    // upsert: update if same student+station+activity exists (keep latest)
    const all = await db.select().from(answers).where(
      and(eq(answers.studentId, Number(studentId)), eq(answers.stationNumber, Number(stationNumber)), eq(answers.activityKey, String(activityKey)))
    );
    if (all.length) {
      const prev = all[0];
      await db.update(answers).set({
        answerType: String(answerType || prev.answerType),
        answerText: answerText !== undefined ? String(answerText) : prev.answerText,
        audioData: audioData !== undefined ? String(audioData) : prev.audioData,
        answerJson: answerJson !== undefined ? answerJson : prev.answerJson,
        score: Number(score ?? prev.score ?? 0),
        maxScore: Number(maxScore ?? prev.maxScore ?? 0),
        status: String(status || prev.status || "submitted"),
        updatedAt: new Date(),
      }).where(eq(answers.id, prev.id));
      return NextResponse.json({ ok: true, id: prev.id });
    }
    const rows = await db.insert(answers).values({
      studentId: Number(studentId),
      stationNumber: Number(stationNumber),
      activityKey: String(activityKey),
      answerType: String(answerType || "text"),
      answerText: answerText ? String(answerText) : undefined,
      audioData: audioData ? String(audioData) : undefined,
      answerJson: answerJson ?? undefined,
      score: Number(score || 0),
      maxScore: Number(maxScore || 0),
      status: String(status || "submitted"),
    }).returning();
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "تعذر حفظ الإجابة" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, teacherFeedback, teacherScore, status } = await req.json();
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    await db.update(answers).set({
      teacherFeedback: teacherFeedback ? String(teacherFeedback) : undefined,
      teacherScore: teacherScore !== undefined && teacherScore !== null ? Number(teacherScore) : undefined,
      status: String(status || "reviewed"),
      updatedAt: new Date(),
    }).where(eq(answers.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
