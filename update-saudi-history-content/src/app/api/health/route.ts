import { db } from "@/db";
import { sql } from "drizzle-orm";

// pg (عبر drizzle-orm/node-postgres) يستخدم Node.js APIs ولا يعمل على Edge.
export const runtime = "nodejs";
// المسار ديناميكي فعلًا: يستعلم قاعدة بيانات حيّة.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
