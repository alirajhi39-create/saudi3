import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured, isNeonConnection, getDatabaseEnvName, getDriverName } from "@/db";
import { EXPECTED_TABLES } from "@/db/migrate";
import { verifySetupSecret, classifyDbError } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * اختبار اتصال آمن ومؤقت بقاعدة Neon.
 * - محمي بسرّ الإعداد (x-setup-secret أو ?secret=) — مغلق تمامًا بدونه.
 * - يُنفذ SELECT 1 ويسرد جداول public schema مع عدد الصفوف فقط.
 * - لا يعرض DATABASE_URL أو كلمات مرور أو أي بيانات طلاب إطلاقًا.
 *
 * GET /api/diag (مع السرّ)
 */
export async function GET(req: NextRequest) {
  if (!verifySetupSecret(req)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const started = Date.now();
  const envPresent = isDatabaseConfigured();
  const result: Record<string, unknown> = {
    ok: false,
    driver: getDriverName() === "neon"
      ? "@neondatabase/serverless + drizzle-orm/neon-serverless"
      : "pg + drizzle-orm/node-postgres",
    env: {
      // أسماء المتغيرات ووجودها فقط — القيم لا تُعرض أبدًا.
      configured: envPresent,
      varName: getDatabaseEnvName(),
      isNeon: envPresent ? isNeonConnection() : null,
      authSecretSet: Boolean(process.env.AUTH_SECRET),
    },
    latencyMs: null,
    select1: null,
    tables: null,
    missingTables: null,
    counts: null,
    error: null,
  };
  if (!envPresent) {
    result.error = { code: "DB_NOT_CONFIGURED", hint: "DATABASE_URL غير مُعدّ في بيئة Vercel" };
    return NextResponse.json(result, { status: 503 });
  }
  try {
    const db = getDb();
    const ping = await db.execute(sql`SELECT 1 AS one`);
    result.select1 = ping.rows?.[0] ? true : false;
    result.latencyMs = Date.now() - started;

    const tbl = await db.execute(sql`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    const names = (tbl.rows as { tablename: string }[]).map((r) => r.tablename);
    result.tables = names;
    result.missingTables = EXPECTED_TABLES.filter((t) => !names.includes(t));

    // عدد الصفوف فقط — دون أي محتوى.
    const counts: Record<string, number | string> = {};
    for (const t of EXPECTED_TABLES) {
      if (!names.includes(t)) {
        counts[t] = "missing";
        continue;
      }
      try {
        const c = await db.execute(sql.raw(`SELECT COUNT(*)::int AS n FROM "${t}"`));
        counts[t] = (c.rows?.[0] as { n?: number } | undefined)?.n ?? "?";
      } catch {
        counts[t] = "error";
      }
    }
    result.counts = counts;
    result.ok = true;
    return NextResponse.json(result);
  } catch (e) {
    const c = classifyDbError(e);
    console.error("[diag] database error:", c.code, c.log);
    result.error = { code: c.code, hint: "راجع Runtime Logs في Vercel للتفاصيل" };
    return NextResponse.json(result, { status: 503 });
  }
}
