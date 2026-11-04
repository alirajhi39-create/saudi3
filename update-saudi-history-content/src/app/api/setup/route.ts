import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { teachers } from "@/db/schema";
import { runSafeMigration, EXPECTED_TABLES } from "@/db/migrate";
import { verifySetupSecret, hashPassword, classifyDbError } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * التهيئة الأولى الآمنة لقاعدة الإنتاج — محمية بسرّ الإعداد حصرًا.
 * - لا توجد بيانات دخول ثابتة في الكود.
 * - لا حذف ولا تصفير: الترحيل idempotent (IF NOT EXISTS فقط).
 *
 * POST /api/setup {action:'status'}                    → حالة الجداول والمعلمين (أرقام فقط)
 * POST /api/setup {action:'migrate'}                   → إنشاء الجداول/الأعمدة الناقصة بأمان
 * POST /api/setup {action:'ensure-teacher', username, password, name?}
 *   → إنشاء حساب معلم بكلمة مرور مشفّرة (bcrypt). يُستخدم للتهيئة الأولى
 *     أو لإضافة معلم جديد. لا يُرجع كلمة المرور أبدًا.
 *
 * يتطلب ترويسة x-setup-secret أو ?secret= بقيمة SETUP_SECRET المُعدّ في Vercel.
 */
export async function POST(req: NextRequest) {
  if (!process.env.SETUP_SECRET || process.env.SETUP_SECRET.length < 8) {
    return NextResponse.json(
      { error: "التهيئة غير مُفعّلة: عيّن SETUP_SECRET في Vercel أولًا" },
      { status: 503 }
    );
  }
  if (!verifySetupSecret(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL غير مُعدّ في هذه البيئة" },
      { status: 503 }
    );
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }
  const action = String(body.action || "");

  try {
    const db = getDb();

    if (action === "status") {
      const tbl = await db.execute(sql`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `);
      const names = (tbl.rows as { tablename: string }[]).map((r) => r.tablename);
      let teacherCount: number | string = "?";
      if (names.includes("teachers")) {
        const c = await db.execute(sql`SELECT COUNT(*)::int AS n FROM "teachers"`);
        teacherCount = (c.rows?.[0] as { n?: number } | undefined)?.n ?? "?";
      }
      return NextResponse.json({
        ok: true,
        tables: names,
        missingTables: EXPECTED_TABLES.filter((t) => !names.includes(t)),
        teacherCount,
      });
    }

    if (action === "migrate") {
      const { statements } = await runSafeMigration();
      const tbl = await db.execute(sql`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `);
      const names = (tbl.rows as { tablename: string }[]).map((r) => r.tablename);
      return NextResponse.json({
        ok: true,
        statements,
        tables: names,
        missingTables: EXPECTED_TABLES.filter((t) => !names.includes(t)),
      });
    }

    if (action === "ensure-teacher") {
      const username = String(body.username || "").trim();
      const password = String(body.password || "");
      const name = String(body.name || "المعلم المشرف").trim() || "المعلم المشرف";
      if (username.length < 3) {
        return NextResponse.json({ error: "اسم المستخدم قصير (3 أحرف على الأقل)" }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "كلمة المرور قصيرة (8 أحرف على الأقل)" }, { status: 400 });
      }
      // تأكد من وجود الجداول أولًا (آمن للتكرار).
      await runSafeMigration();
      const existing = await db.select({ id: teachers.id }).from(teachers).where(eq(teachers.username, username));
      if (existing.length) {
        // تحديث كلمة المرور لحساب موجود (تدوير آمن) — لا تُرجع أبدًا.
        const passwordHash = await hashPassword(password);
        await db.update(teachers).set({ password: passwordHash }).where(eq(teachers.username, username));
        return NextResponse.json({ ok: true, mode: "password-rotated", username });
      }
      const passwordHash = await hashPassword(password);
      const rows = await db.insert(teachers).values({ username, password: passwordHash, name }).returning({ id: teachers.id });
      return NextResponse.json({ ok: true, mode: "created", username, id: rows[0]?.id });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[setup] error:", c.code, c.log);
    return NextResponse.json({ error: "تعذر تنفيذ العملية", code: c.code }, { status: 500 });
  }
}
