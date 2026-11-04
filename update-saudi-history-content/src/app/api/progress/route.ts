import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET ?studentId=
// POST {studentId, stationNumber, status, score, maxScore}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = Number(searchParams.get("studentId"));
    if (!studentId) return NextResponse.json({ error: "studentId مطلوب" }, { status: 400 });
    const rows = await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
    return NextResponse.json({ progress: rows });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, stationNumber, status, score, maxScore } = await req.json();
    if (!studentId || !stationNumber) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    const existing = await db.select().from(studentProgress).where(
      and(eq(studentProgress.studentId, Number(studentId)), eq(studentProgress.stationNumber, Number(stationNumber)))
    );
    if (existing.length) {
      const prev = existing[0];
      await db.update(studentProgress).set({
        status: status || prev.status,
        score: Math.max(prev.score, Number(score || 0)),
        maxScore: Number(maxScore || prev.maxScore || 0),
        completedAt: status === "completed" ? new Date() : prev.completedAt,
        updatedAt: new Date(),
      }).where(eq(studentProgress.id, prev.id));
    } else {
      await db.insert(studentProgress).values({
        studentId: Number(studentId),
        stationNumber: Number(stationNumber),
        status: status || "in_progress",
        score: Number(score || 0),
        maxScore: Number(maxScore || 0),
        completedAt: status === "completed" ? new Date() : undefined,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ في الحفظ" }, { status: 500 });
  }
}
