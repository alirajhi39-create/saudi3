import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireTeacher, classifyDbError } from "@/lib/auth";

export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يقرأ req.json ويستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

/** رمز استعادة آمن من 6 أحرف (مصدر عشوائي مشفّر). */
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += chars[randomInt(chars.length)];
  return c;
}

function dbErrorResponse(e: unknown, fallback: string) {
  const c = classifyDbError(e);
  console.error("[students] database error:", c.code, c.log);
  return NextResponse.json({ error: fallback, code: c.code }, { status: 500 });
}

// POST {action:'register', name, className, avatar} | {action:'login', studentCode}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === "register") {
      const { name, className, avatar } = body;
      if (!name || String(name).trim().length < 2) {
        return NextResponse.json({ error: "فضلًا أدخل اسم الطالب" }, { status: 400 });
      }
      // إنشاء السجل مع إعادة المحاولة برمز جديد عند تصادم نادر في الرمز الفريد.
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const code = genCode();
          const rows = await db.insert(students).values({
            name: String(name).trim(),
            className: String(className || "6 / 1"),
            avatar: String(avatar || "🦅"),
            studentCode: code,
          }).returning();
          return NextResponse.json({ student: rows[0] });
        } catch (e) {
          lastError = e;
          const err = e as { code?: string; message?: string };
          const isUniqueViolation = err?.code === "23505" || String(err?.message || "").includes("duplicate key");
          if (!isUniqueViolation || attempt === 2) break;
        }
      }
      return dbErrorResponse(lastError, "حدث خطأ في الخادم");
    }
    if (action === "login") {
      const { studentCode } = body;
      if (!studentCode) return NextResponse.json({ error: "أدخل رمز الدخول" }, { status: 400 });
      try {
        const rows = await db.select().from(students).where(eq(students.studentCode, String(studentCode).trim().toUpperCase()));
        if (!rows.length) return NextResponse.json({ error: "رمز الدخول غير صحيح" }, { status: 404 });
        return NextResponse.json({ student: rows[0] });
      } catch (e) {
        return dbErrorResponse(e, "حدث خطأ في الخادم");
      }
    }
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    return dbErrorResponse(e, "حدث خطأ في الخادم");
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const rows = await db.select().from(students).where(eq(students.id, Number(id)));
      if (!rows.length) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
      return NextResponse.json({ student: rows[0] });
    }
    // السرد الشامل لبيانات الطلاب خاص بالمعلم فقط.
    if (!requireTeacher(req)) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    const rows = await db.select().from(students);
    return NextResponse.json({ students: rows });
  } catch (e) {
    return dbErrorResponse(e, "خطأ");
  }
}
