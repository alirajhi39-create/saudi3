import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teachers, students, studentProgress, quizAttempts, answers } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  hashPassword,
  isBcryptHash,
  issueTeacherToken,
  requireTeacher,
  getTokenCookieName,
  classifyDbError,
} from "@/lib/auth";

export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.url/req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

// POST {action:'login', username, password} → يتحقق بـ bcrypt ويُصدر رمز جلسة موقّعًا.
// GET ?view=stats → يتطلب رمز معلم صالحًا (ترويسة Bearer أو كوكي httpOnly).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "login") {
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      if (!username || !password) {
        return NextResponse.json({ error: "أدخل اسم المستخدم وكلمة المرور" }, { status: 400 });
      }
      const rows = await db.select().from(teachers).where(eq(teachers.username, username));
      if (!rows.length) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
      const t = rows[0];
      const valid = await verifyPassword(password, t.password);
      if (!valid) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
      // ترحيل تلقائي لمرة واحدة: حسابات قديمة بكلمة نص واضح تُشفَّر إلى bcrypt.
      if (!isBcryptHash(t.password)) {
        try {
          await db.update(teachers).set({ password: await hashPassword(password) }).where(eq(teachers.id, t.id));
        } catch (e) {
          console.error("[teacher] password upgrade failed:", classifyDbError(e).log);
        }
      }
      const token = issueTeacherToken(t.id, t.username);
      const res = NextResponse.json({
        teacher: { id: t.id, username: t.username, name: t.name, token },
      });
      // كوكي httpOnly كطبقة إضافية (لا يمكن قراءته من JS).
      res.cookies.set(getTokenCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[teacher:login] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireTeacher(req);
    if (!auth) {
      return NextResponse.json({ error: "انتهت الجلسة، فضلًا سجّل الدخول مجددًا" }, { status: 401 });
    }
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
    const c = classifyDbError(e);
    console.error("[teacher:stats] database error:", c.code, c.log);
    return NextResponse.json({ error: "خطأ", code: c.code }, { status: 500 });
  }
}
