import { z } from "zod";
import { badRequest, getStudentSession, unauthorized } from "@/lib/auth";
import { ANSWER_KEYS } from "@/lib/lesson-content";
import { ensureSeeded } from "@/lib/seed";
import { markSlide, upsertAnswer } from "@/lib/student-data";

export const dynamic = "force-dynamic";

const KEY_TO_SLIDE: Record<string, number> = {
  kwl: 2,
  drill_admin: 3,
  activity1: 4,
  matching_security: 7,
  inference_haramain: 8,
  ordering_army: 9,
  classification_army: 9,
  classification_urban: 10,
  exit_ticket: 12,
};

const schema = z.object({
  key: z.enum(ANSWER_KEYS),
  kind: z.enum(["open", "drill", "reflection"]).default("open"),
  payload: z.record(z.string(), z.unknown()),
  score: z.number().min(0).nullable().optional(),
  maxScore: z.number().min(0).nullable().optional(),
  completesSlide: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return unauthorized();
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest("بيانات الإجابة غير صالحة");
    if (JSON.stringify(parsed.data.payload).length > 30000) return badRequest("حجم الإجابة كبير جدًا");
    const lessonId = await ensureSeeded();
    const row = await upsertAnswer({
      studentId: session.sid,
      lessonId,
      key: parsed.data.key,
      kind: parsed.data.kind,
      payload: parsed.data.payload,
      score: parsed.data.score ?? null,
      maxScore: parsed.data.maxScore ?? null,
    });
    const slide = KEY_TO_SLIDE[parsed.data.key];
    if (slide && parsed.data.completesSlide) await markSlide(session.sid, lessonId, slide, true);
    return Response.json({ ok: true, answer: { payload: row.payload, score: row.score, maxScore: row.maxScore, updatedAt: row.updatedAt } });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "تعذر حفظ الإجابة. تحقق من الاتصال وحاول مرة أخرى." }, { status: 500 });
  }
}
