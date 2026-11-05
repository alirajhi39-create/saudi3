import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { getSettings } from "@/lib/student-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lessonId = await ensureSeeded();
    const [rows, settings] = await Promise.all([
      db.select({ id: classes.id, name: classes.name }).from(classes).where(eq(classes.active, true)).orderBy(asc(classes.name)),
      getSettings(lessonId),
    ]);
    return Response.json({ ok: true, classes: rows, requireStudentCode: settings.requireStudentCode });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: "تعذر الاتصال بقاعدة البيانات." }, { status: 500 });
  }
}
