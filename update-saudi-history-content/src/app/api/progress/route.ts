import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentProgress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { classifyDbError } from "@/lib/auth";

// pg (عبر drizzle-orm/node-postgres) يستخدم Node.js APIs ولا يعمل على Edge.
export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.url/req.json ويستعلم قاعدة بيانات حيّة.
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
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[progress:get] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
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
    const c = classifyDbError(e);
    console.error("[progress:post] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ في الحفظ", code: c.code }, { status: 500 });
  }
}
