import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activityAttachments, imageLibrary } from "@/db/schema";
import { badRequest, getStudentSession, unauthorized } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { markSlide, upsertAnswer } from "@/lib/student-data";

export const dynamic = "force-dynamic";

const selectionSchema = z.object({ id: z.string().max(10), text: z.string().max(200), correct: z.boolean() });
const schema = z.object({
  items: z
    .array(
      z.object({
        imageId: z.number().int().positive(),
        description: z.string().trim().min(10, "الوصف قصير جدًا — اختر وصفين على الأقل").max(1200),
        selected: z.array(selectionSchema).max(20).optional(),
        note: z.string().trim().max(400).optional(),
      }),
    )
    .length(3, "يجب اختيار ثلاث صور بالضبط"),
});

export async function POST(req: Request) {
  const session = await getStudentSession();
  if (!session) return unauthorized();
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "بيانات النشاط غير صالحة");
    const lessonId = await ensureSeeded();
    const ids = parsed.data.items.map((i) => i.imageId);
    if (new Set(ids).size !== 3) return badRequest("اختر ثلاث صور مختلفة.");
    const found = await db.select({ id: imageLibrary.id }).from(imageLibrary).where(inArray(imageLibrary.id, ids));
    if (found.length !== 3) return badRequest("إحدى الصور المختارة غير موجودة.");

    await db
      .delete(activityAttachments)
      .where(and(eq(activityAttachments.studentId, session.sid), eq(activityAttachments.lessonId, lessonId)));
    const rows = await db
      .insert(activityAttachments)
      .values(
        parsed.data.items.map((item, idx) => ({
          studentId: session.sid,
          lessonId,
          imageId: item.imageId,
          position: idx + 1,
          description: item.description,
        })),
      )
      .returning();
    await upsertAnswer({
      studentId: session.sid,
      lessonId,
      key: "activity2",
      kind: "open",
      payload: {
        imageIds: ids,
        descriptions: parsed.data.items.map((i) => i.description),
        items: parsed.data.items.map((i) => ({ imageId: i.imageId, selected: i.selected ?? [], note: i.note ?? "" })),
        wrongCount: parsed.data.items.reduce((acc, i) => acc + (i.selected ?? []).filter((x) => !x.correct).length, 0),
        submittedAt: new Date().toISOString(),
      },
    });
    await markSlide(session.sid, lessonId, 6, true);
    return Response.json({ ok: true, attachments: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "تعذر حفظ النشاط. حاول مرة أخرى." }, { status: 500 });
  }
}
