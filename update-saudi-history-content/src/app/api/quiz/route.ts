import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { db } from "@/db";
import { quizAttempts, certificates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireTeacher, classifyDbError } from "@/lib/auth";

export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.url/req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

// GET ?studentId= -> attempts (للطالب) | بدون مرشّح (للمعلم فقط)
// POST {studentId, score, maxScore, answers} -> حفظ المحاولة + الشهادة في معاملة واحدة
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    if (!studentId) {
      if (!requireTeacher(req)) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      const rows = await db.select().from(quizAttempts).orderBy(desc(quizAttempts.completedAt));
      return NextResponse.json({ attempts: rows });
    }
    const rows = await db.select().from(quizAttempts)
      .where(eq(quizAttempts.studentId, Number(studentId)))
      .orderBy(desc(quizAttempts.completedAt));
    return NextResponse.json({ attempts: rows });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[quiz:get] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, score, maxScore, answers } = await req.json();
    if (!studentId) return NextResponse.json({ error: "studentId مطلوب" }, { status: 400 });
    const pct = maxScore > 0 ? Math.round((Number(score) / Number(maxScore)) * 100) : 0;
    const passed = pct >= 60;

    // معاملة واحدة: حفظ المحاولة وإصدار الشهادة يجب أن ينجحا أو يفشلا معًا.
    const result = await db.transaction(async (tx) => {
      const rows = await tx.insert(quizAttempts).values({
        studentId: Number(studentId),
        score: Number(score || 0),
        maxScore: Number(maxScore || 0),
        percentage: pct,
        passed,
        answersJson: answers ?? null,
      }).returning();

      let cert = null;
      if (passed) {
        const existing = await tx.select().from(certificates).where(eq(certificates.studentId, Number(studentId)));
        if (existing.length) {
          cert = existing[0];
        } else {
          const code = `AROOS-${Date.now().toString(36).toUpperCase()}-${randomInt(100, 1000)}`;
          const c = await tx.insert(certificates).values({
            studentId: Number(studentId),
            code,
            percentage: pct,
            quizScore: Number(score || 0),
          }).returning();
          cert = c[0];
        }
      }
      return { attempt: rows[0], certificate: cert };
    });

    return NextResponse.json(result);
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[quiz:post] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
  }
}
