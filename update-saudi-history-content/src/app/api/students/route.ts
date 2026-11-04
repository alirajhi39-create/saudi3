import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

// POST {action:'register', name, className, avatar} | {action:'login', studentCode} | {action:'loginName', name, studentCode}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "register") {
      const { name, className, avatar } = body;
      if (!name || String(name).trim().length < 2) {
        return NextResponse.json({ error: "فضلًا أدخل اسم الطالب" }, { status: 400 });
      }
      const code = genCode();
      const rows = await db.insert(students).values({
        name: String(name).trim(),
        className: String(className || "6 / 1"),
        avatar: String(avatar || "🦅"),
        studentCode: code,
      }).returning();
      return NextResponse.json({ student: rows[0] });
    }
    if (action === "login") {
      const { studentCode } = body;
      if (!studentCode) return NextResponse.json({ error: "أدخل رمز الدخول" }, { status: 400 });
      const rows = await db.select().from(students).where(eq(students.studentCode, String(studentCode).trim().toUpperCase()));
      if (!rows.length) return NextResponse.json({ error: "رمز الدخول غير صحيح" }, { status: 404 });
      return NextResponse.json({ student: rows[0] });
    }
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const rows = await db.select().from(students);
      const found = rows.find((r) => String(r.id) === String(id));
      if (!found) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
      return NextResponse.json({ student: found });
    }
    const rows = await db.select().from(students);
    return NextResponse.json({ students: rows });
  } catch {
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
