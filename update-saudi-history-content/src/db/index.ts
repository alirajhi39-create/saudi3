import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * عميل قاعدة البيانات — تهيئة كسولة (Lazy) آمنة لمرحلة البناء.
 *
 * السبب: أثناء `next build` في مرحلة "Collecting page data" يستورد Next.js
 * كل ملفات المسارات (routes) لجمع بياناتها. أي كود يُنفَّذ على مستوى الوحدة
 * (top-level) مثل رمي خطأ عند غياب DATABASE_URL أو إنشاء Pool فورًا،
 * سيُسقط البناء بخطأ مثل:
 *   `Failed to collect page data for /api/answers`
 * لذلك لا يجوز هنا أي `throw` أو اتصال فعلي خارج دوال المعالجات.
 * الاتصال الحقيقي يُنشأ فقط عند أول استعلام داخل GET/POST/PUT وقت التشغيل.
 */

type GlobalDb = typeof globalThis & {
  __aroosPool?: Pool;
  __aroosDb?: NodePgDatabase;
};

const globalForDb = globalThis as GlobalDb;

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // يُرمى هذا فقط وقت التشغيل داخل المعالج (حيث يوجد try/catch يُرجع 500)،
    // وليس أبدًا أثناء استيراد الوحدة في مرحلة البناء.
    throw new Error(
      "DATABASE_URL is not configured. Please set it in Vercel: Project Settings → Environment Variables."
    );
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return pool;
}

/** هل متغير قاعدة البيانات مُعدّ؟ (للتحقق الآمن دون رمي خطأ) */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** يُرجع نسخة Drizzle، مع إنشاء الـ Pool كسولًا عند أول استخدام فعلي. */
export function getDb(): NodePgDatabase {
  if (!globalForDb.__aroosPool) {
    globalForDb.__aroosPool = createPool();
  }
  if (!globalForDb.__aroosDb) {
    globalForDb.__aroosDb = drizzle(globalForDb.__aroosPool);
  }
  return globalForDb.__aroosDb;
}

/**
 * التوافق العكسي: نفس اسم التصدير السابق `db` دون أي تغيير في المسارات.
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
