import { and, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { certificates, quizAttempts, studentAnswers, studentProgress } from "@/db/schema";
import { badRequest, getStudentSession, unauthorized } from "@/lib/auth";
import { TOTAL_SLIDES } from "@/lib/lesson-content";
import { ensureSeeded } from "@/lib/seed";
import { loadCertificate } from "@/lib/certificate-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return unauthorized();
  try {
    const lessonId = await ensureSeeded();
    const certificate = await loadCertificate(session.sid, lessonId);
    if (!certificate) return Response.json({ ok: false, code: "NO_CERTIFICATE", error: "لم تُصدر الشهادة بعد." }, { status: 404 });
    return Response.json({ ok: true, certificate });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "تعذر تحميل الشهادة." }, { status: 500 });
  }
}

export async function POST() {
  const session = await getStudentSession();
  if (!session) return unauthorized();
  try {
    const lessonId = await ensureSeeded();
    const [attempts, exit, progress] = await Promise.all([
      db.select().from(quizAttempts).where(and(eq(quizAttempts.studentId, session.sid), eq(quizAttempts.lessonId, lessonId))),
      db
        .select({ id: studentAnswers.id })
        .from(studentAnswers)
        .where(and(eq(studentAnswers.studentId, session.sid), eq(studentAnswers.lessonId, lessonId), eq(studentAnswers.key, "exit_ticket"))),
      db
        .select()
        .from(studentProgress)
        .where(and(eq(studentProgress.studentId, session.sid), eq(studentProgress.lessonId, lessonId), eq(studentProgress.completed, true))),
    ]);
    if (attempts.length === 0) return badRequest("يجب إكمال الاختبار الختامي قبل إصدار الشهادة.", 409);
    if (exit.length === 0) return badRequest("يجب إرسال بطاقة الخروج قبل إصدار الشهادة.", 409);

    const completionPercent = Math.round((progress.length / TOTAL_SLIDES) * 100);
    const scorePercent = Math.max(...attempts.map((a) => a.percentage));

    const [existing] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.studentId, session.sid), eq(certificates.lessonId, lessonId)))
      .limit(1);
    if (existing) {
      const [updated] = await db
        .update(certificates)
        .set({ completionPercent, scorePercent })
        .where(eq(certificates.id, existing.id))
        .returning();
      return Response.json({ ok: true, certificate: updated });
    }
    const code = `AL9-${randomBytes(3).toString("hex").toUpperCase()}-${session.sid}`;
    const [created] = await db
      .insert(certificates)
      .values({ studentId: session.sid, lessonId, code, completionPercent, scorePercent })
      .returning();
    return Response.json({ ok: true, certificate: created });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "تعذر إصدار الشهادة." }, { status: 500 });
  }
}
