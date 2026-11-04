import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, students, studentProgress, quizAttempts, answers } from "@/db/schema";
import { eq } from "drizzle-orm";

// pg (عبر drizzle-orm/node-postgres) يستخدم Node.js APIs ولا يعمل على Edge.
export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.url/req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

// POST {action:'login', username, password} | {action:'ensure'}
// GET ?view=stats -> aggregated stats
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "ensure") {
      const existing = await db.select().from(teachers);
      if (existing.length === 0) {
        await db.insert(teachers).values({ username: "teacher", password: "1234", name: "المعلم المشرف" });
      }
      return NextResponse.json({ ok: true });
    }
    if (body.action === "login") {
      const { username, password } = body;
      await (async () => {
        const ex = await db.select().from(teachers);
        if (ex.length === 0) await db.insert(teachers).values({ username: "teacher", password: "1234", name: "المعلم المشرف" });
      })();
      const rows = await db.select().from(teachers).where(eq(teachers.username, String(username || "").trim()));
      if (!rows.length || rows[0].password !== String(password)) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
      const t = rows[0];
      return NextResponse.json({ teacher: { id: t.id, username: t.username, name: t.name } });
    }
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "stats";
    if (view === "stats") {
      const [allStudents, allProgress, allAttempts, allAnswers] = await Promise.all([
        db.select().from(students),
        db.select().from(studentProgress),
        db.select().from(quizAttempts),
        db.select().from(answers),
      ]);
      const completedCount = allProgress.filter((p) => p.status === "completed").length;
      const avgQuiz = allAttempts.length
        ? Math.round(allAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / allAttempts.length)
        : 0;
      const passRate = allAttempts.length
        ? Math.round((allAttempts.filter((a) => a.passed).length / allAttempts.length) * 100)
        : 0;
      // per station
      const perStation: Record<number, { completed: number; avg: number }> = {};
      for (let i = 1; i <= 10; i++) {
        const sp = allProgress.filter((p) => p.stationNumber === i);
        const comp = sp.filter((p) => p.status === "completed").length;
        const avg = sp.length ? Math.round(sp.reduce((s, p) => s + (p.maxScore ? (p.score / p.maxScore) * 100 : 0), 0) / sp.length) : 0;
        perStation[i] = { completed: comp, avg };
      }
      // per student summary
      const perStudent = allStudents.map((s) => {
        const prog = allProgress.filter((p) => p.studentId === s.id);
        const completed = prog.filter((p) => p.status === "completed").length;
        const attempts = allAttempts.filter((a) => a.studentId === s.id);
        const best = attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : 0;
        const ansCount = allAnswers.filter((a) => a.studentId === s.id).length;
        return { ...s, completedStations: completed, bestQuiz: best, answersCount: ansCount, attemptsCount: attempts.length };
      });
      return NextResponse.json({
        totals: {
          students: allStudents.length,
          completedActivities: completedCount,
          attempts: allAttempts.length,
          answers: allAnswers.length,
          avgQuiz,
          passRate,
          needsReview: allAnswers.filter((a) => a.status === "needs_review" || a.status === "submitted").length,
        },
        perStation,
        perStudent,
      });
    }
    return NextResponse.json({ error: "view غير معروف" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
