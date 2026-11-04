import bcrypt from "bcryptjs";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * المصادقة الآمنة لمنصة العروس الابتدائية.
 * - كلمات مرور المعلمين: bcrypt (لا يُخزَّن نص واضح أبدًا).
 * - جلسات المعلمين: رموز موقّعة بـ HMAC-SHA256 مع انتهاء صلاحية.
 * - لا توجد أي بيانات دخول ثابتة هنا — التهيئة الأولى عبر /api/setup المحمي بسرّ.
 */

const TOKEN_COOKIE = "aroos_teacher_token";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 أيام

function getAuthSecret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  // احتياطي حتمي عند غياب AUTH_SECRET: مشتق من رابط القاعدة (لا يُكشف أبدًا)،
  // يعمل دون إعداد إضافي وتبقى الجلسات صالحة عبر إعادة التشغيل.
  // يُنصح بتعيين AUTH_SECRET حقيقي في Vercel (32 حرفًا عشوائيًا على الأقل).
  const seed =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    "aroos-dev-only";
  return createHash("sha256").update(`aroos-auth:${seed}`).digest("hex");
}

/* ---------- كلمات المرور ---------- */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function isBcryptHash(stored: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(stored);
}

/** يتحقق من كلمة المرور مقابل المخزّن (يدعم bcrypt حصرًا بعد الترحيل). */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isBcryptHash(stored)) {
    try {
      return await bcrypt.compare(plain, stored);
    } catch {
      return false;
    }
  }
  // مسار ترحيلي لمرة واحدة: حسابات قديمة خُزّنت كنص واضح قبل الإصلاح.
  // عند نجاح الدخول يُعاد التشفير تلقائيًا إلى bcrypt (انظر مسار المعلم).
  return plain === stored;
}

/* ---------- رموز الجلسات ---------- */

interface TeacherTokenPayload {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

function b64urlEncode(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function b64urlDecode<T>(s: string): T | null {
  try {
    return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function issueTeacherToken(id: number, username: string): string {
  const now = Date.now();
  const payload: TeacherTokenPayload = {
    id,
    username,
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };
  const body = b64urlEncode(payload);
  const sig = createHmac("sha256", getAuthSecret()).update(`v1.${body}`).digest("base64url");
  return `v1.${body}.${sig}`;
}

export function verifyTeacherToken(token: string): TeacherTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const [, body, sig] = parts;
  const expected = createHmac("sha256", getAuthSecret()).update(`v1.${body}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  try {
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const payload = b64urlDecode<TeacherTokenPayload>(body);
  if (!payload || typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
  return payload;
}

export function getTokenCookieName(): string {
  return TOKEN_COOKIE;
}

/** يستخرج الرمز من ترويسة Authorization أو من الكوكي. */
export function extractToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) {
    const t = header.slice(7).trim();
    if (t) return t;
  }
  const cookie = req.cookies.get(TOKEN_COOKIE)?.value;
  return cookie || null;
}

/** حارس مسارات المعلم: يُستخدم داخل المعالجات المحمية. */
export function requireTeacher(req: NextRequest): TeacherTokenPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyTeacherToken(token);
}

/* ---------- سرّ الإعداد والتشخيص ---------- */

/** يتحقق من سرّ الإعداد/التشخيص (ترويسة x-setup-secret أو ?secret=). */
export function verifySetupSecret(req: NextRequest): boolean {
  const expected = process.env.SETUP_SECRET;
  if (!expected || expected.length < 8) return false; // غير مُعدّ = مغلق بأمان
  const viaHeader = req.headers.get("x-setup-secret")?.trim();
  let viaQuery: string | null = null;
  try {
    viaQuery = new URL(req.url).searchParams.get("secret")?.trim() || null;
  } catch {
    viaQuery = null;
  }
  const provided = viaHeader || viaQuery;
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/* ---------- تصنيف أخطاء قاعدة البيانات للسجلات ---------- */

/** يصنّف خطأ القاعدة لرسالة دعم عربية دون كشف أسرار. */
export function classifyDbError(e: unknown): { code: string; log: string } {
  const err = e as { code?: string; message?: string; cause?: { code?: string } };
  const code = err?.code || err?.cause?.code || "";
  const message = String(err?.message || e || "");
  if (message.includes("DATABASE_URL is not configured")) {
    return { code: "DB_NOT_CONFIGURED", log: "DATABASE_URL is missing in this environment" };
  }
  if (code === "42P01" || message.includes("does not exist")) {
    return { code: "DB_TABLES_MISSING", log: `missing table/relation: ${message.slice(0, 200)}` };
  }
  if (code === "28P01" || code === "28P00") {
    return { code: "DB_AUTH_FAILED", log: "database authentication failed (check user/password)" };
  }
  if (code === "3D000") {
    return { code: "DB_NOT_FOUND", log: "database name does not exist" };
  }
  if (
    code === "ENOTFOUND" || code === "EAI_AGAIN" || code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" || message.includes("getaddrinfo") || message.includes("Connect Timeout")
  ) {
    return { code: "DB_UNREACHABLE", log: `database host unreachable: ${message.slice(0, 200)}` };
  }
  if (code === "XX000" && message.includes("endpoint")) {
    return { code: "DB_ENDPOINT", log: `neon endpoint issue: ${message.slice(0, 200)}` };
  }
  return { code: code || "DB_ERROR", log: message.slice(0, 300) };
}
