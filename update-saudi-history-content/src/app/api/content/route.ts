import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lessonContents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { STATIONS, AXES } from "@/lib/content";

export const dynamic = "force-dynamic";

async function ensureSeeded() {
  const existing = await db.select().from(lessonContents);
  if (existing.length === 0) {
    for (const s of STATIONS) {
      const axis = AXES.find((a) => a.title === s.subtitle || s.axis === a.key);
      await db.insert(lessonContents).values({
        stationNumber: s.n,
        title: s.title,
        contentJson: {
          subtitle: s.subtitle,
          axis: axis?.title || "",
          note: "المحتوى الرسمي من الكتاب ص 67-69",
        },
      });
    }
  }
  return db.select().from(lessonContents);
}

export async function GET() {
  try {
    const rows = await ensureSeeded();
    return NextResponse.json({ contents: rows.sort((a, b) => a.stationNumber - b.stationNumber) });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { stationNumber, title, contentJson } = await req.json();
    if (!stationNumber) return NextResponse.json({ error: "stationNumber مطلوب" }, { status: 400 });
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (title !== undefined) patch.title = String(title);
    if (contentJson !== undefined) patch.contentJson = contentJson;
    await db.update(lessonContents).set(patch as never).where(eq(lessonContents.stationNumber, Number(stationNumber)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
