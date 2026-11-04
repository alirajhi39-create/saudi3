import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { answers } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireTeacher, classifyDbError } from "@/lib/auth";

export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.url/req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

// GET ?studentId=&stationNumber? (للطالب) | ?needsReview=1 (للمعلم فقط)
// POST save answer (للطالب)
// PUT teacher review (للمعلم فقط)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const stationNumber = searchParams.get("stationNumber");
    const needsReview = searchParams.get("needsReview");

    if (needsReview === "1" || (!studentId && !stationNumber)) {
      // المراجعة والسرد الشامل خاصان بالمعلم فقط.
      if (!requireTeacher(req)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      const rows = needsReview === "1"
        ? await db.select().from(answers).where(inArray(answers.status, ["needs_review", "submitted"])).orderBy(desc(answers.createdAt))
        : await db.select().from(answers).orderBy(desc(answers.createdAt));
      return NextResponse.json({ answers: rows });
    }

    const conditions = [eq(answers.studentId, Number(studentId))];
    if (stationNumber) conditions.push(eq(answers.stationNumber, Number(stationNumber)));
    const rows = await db.select().from(answers).where(and(...conditions)).orderBy(desc(answers.createdAt));
    return NextResponse.json({ answers: rows });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[answers:get] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
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
    const c = classifyDbError(e);
    console.error("[answers:post] database error:", c.code, c.log);
    return NextResponse.json({ error: "تعذر حفظ الإجابة", code: c.code }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!requireTeacher(req)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const { id, teacherFeedback, teacherScore, status } = await req.json();
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    await db.update(answers).set({
      teacherFeedback: teacherFeedback ? String(teacherFeedback) : undefined,
      teacherScore: teacherScore !== undefined && teacherScore !== null ? Number(teacherScore) : undefined,
      status: String(status || "reviewed"),
      updatedAt: new Date(),
    }).where(eq(answers.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[answers:review] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
  }
}
