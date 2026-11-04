import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizAttempts, certificates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET ?studentId= -> attempts
// POST {studentId, score, maxScore, answers} -> save attempt + maybe certificate
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    let rows = await db.select().from(quizAttempts).orderBy(desc(quizAttempts.completedAt));
    if (studentId) rows = rows.filter((r) => String(r.studentId) === String(studentId));
    return NextResponse.json({ attempts: rows });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, score, maxScore, answers } = await req.json();
    if (!studentId) return NextResponse.json({ error: "studentId مطلوب" }, { status: 400 });
    const pct = maxScore > 0 ? Math.round((Number(score) / Number(maxScore)) * 100) : 0;
    const passed = pct >= 60;
    const rows = await db.insert(quizAttempts).values({
      studentId: Number(studentId),
      score: Number(score || 0),
      maxScore: Number(maxScore || 0),
      percentage: pct,
      passed,
      answersJson: answers ?? null,
    }).returning();

    // auto certificate if passed
    let cert = null;
    if (passed) {
      const existing = await db.select().from(certificates).where(eq(certificates.studentId, Number(studentId)));
      if (existing.length) {
        cert = existing[0];
      } else {
        const code = `AROOS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*900+100)}`;
        const c = await db.insert(certificates).values({
          studentId: Number(studentId),
          code,
          percentage: pct,
          quizScore: Number(score || 0),
        }).returning();
        cert = c[0];
      }
    }
    return NextResponse.json({ attempt: rows[0], certificate: cert });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
