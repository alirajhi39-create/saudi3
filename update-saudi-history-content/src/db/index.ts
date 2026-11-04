import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";

/**
 * عميل قاعدة البيانات — هجين مع تهيئة كسولة (Lazy) آمنة للبناء.
 *
 * - مضيفو Neon (*.neon.tech، أي الإنتاج على Vercel): يستخدم
 *   @neondatabase/serverless الذي يتولى SSL تلقائيًا، ويعمل مع رابط
 *   الاتصال المجمّع Pooled والمباشر Direct، ويدعم المعاملات Transactions.
 * - أي مضيف PostgreSQL آخر (التطوير/الاختبار المحلي): يستخدم pg القياسي.
 * - الواجهة البرمجية واحدة (Drizzle) في الحالتين — لا تغيير في أي مسار.
 *
 * لا يجوز أي `throw` أو اتصال فعلي على مستوى الوحدة: أثناء `next build`
 * يستورد Next.js كل المسارات، وأي كود يُنفَّذ لحظة الاستيراد يُسقط البناء.
 * الاتصال الحقيقي يُنشأ فقط عند أول استعلام داخل المعالجات وقت التشغيل.
 */

type GlobalDb = typeof globalThis & {
  __aroosPool?: NeonPool | PgPool;
  __aroosDb?: NodePgDatabase;
};

const globalForDb = globalThis as GlobalDb;

/** اسم متغير البيئة المستخدم للاتصال (يدعم بدائل تكامل Vercel–Neon). */
export function getDatabaseEnvName(): string | null {
  if (process.env.DATABASE_URL) return "DATABASE_URL";
  if (process.env.POSTGRES_URL) return "POSTGRES_URL";
  if (process.env.NEON_DATABASE_URL) return "NEON_DATABASE_URL";
  return null;
}

function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL;
  if (!url) {
    // يُرمى فقط وقت التشغيل داخل المعالج (حيث try/catch تُرجع 500)،
    // وليس أبدًا أثناء استيراد الوحدة في مرحلة البناء.
    throw new Error(
      "DATABASE_URL is not configured. Set it in Vercel: Project Settings → Environment Variables (use the Neon Pooled connection string)."
    );
  }
  return url;
}

function isNeonUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return url.includes("neon.tech");
  }
}

/** هل متغير قاعدة البيانات مُعدّ؟ (للتحقق الآمن دون رمي خطأ) */
export function isDatabaseConfigured(): boolean {
  return getDatabaseEnvName() !== null;
}

/** هل الاتصال الحالي يشير إلى Neon؟ */
export function isNeonConnection(): boolean {
  const name = getDatabaseEnvName();
  if (!name) return false;
  const url = process.env[name] || "";
  return isNeonUrl(url);
}

/** اسم المشغّل الفعلي: "neon" أو "pg" (للتشخيص فقط). */
export function getDriverName(): "neon" | "pg" | "none" {
  const name = getDatabaseEnvName();
  if (!name) return "none";
  return isNeonUrl(process.env[name] || "") ? "neon" : "pg";
}

/** يُرجع نسخة Drizzle، مع إنشاء الـ Pool كسولًا عند أول استخدام فعلي. */
export function getDb(): NodePgDatabase {
  if (!globalForDb.__aroosDb) {
    const url = getConnectionString();
    if (isNeonUrl(url)) {
      const pool = new NeonPool({ connectionString: url });
      globalForDb.__aroosPool = pool;
      // نفس واجهة Drizzle تمامًا (select/insert/update/delete/execute/transaction).
      globalForDb.__aroosDb = drizzleNeon(pool) as unknown as NodePgDatabase;
    } else {
      const pool = new PgPool({ connectionString: url });
      globalForDb.__aroosPool = pool;
      globalForDb.__aroosDb = drizzleNode(pool);
    }
  }
  return globalForDb.__aroosDb;
}

/**
 * نفس اسم التصدير السابق `db` دون أي تغيير في المسارات.
 * Proxy يؤجّل إنشاء الاتصال حتى أول استدعاء فعلي (db.select, db.execute, ...)
 * داخل المعالجات وقت التشغيل — ولا يُنفَّذ أي شيء لحظة الاستيراد.
 */
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as unknown as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
