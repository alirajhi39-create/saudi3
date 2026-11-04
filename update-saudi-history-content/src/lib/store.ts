"use client";

export interface StudentSession {
  id: number;
  name: string;
  className: string;
  grade: string;
  studentCode: string;
  avatar: string;
}

export interface TeacherSession {
  id: number;
  username: string;
  name: string;
  token?: string;
}

const STUDENT_KEY = "aroos_student";
const TEACHER_KEY = "aroos_teacher";

export function saveStudent(s: StudentSession) {
  try { localStorage.setItem(STUDENT_KEY, JSON.stringify(s)); } catch {}
}
export function getStudent(): StudentSession | null {
  try {
    const v = localStorage.getItem(STUDENT_KEY);
    return v ? (JSON.parse(v) as StudentSession) : null;
  } catch { return null; }
}
export function clearStudent() {
  try { localStorage.removeItem(STUDENT_KEY); } catch {}
}
export function saveTeacher(t: TeacherSession) {
  try { localStorage.setItem(TEACHER_KEY, JSON.stringify(t)); } catch {}
}
export function getTeacher(): TeacherSession | null {
  try {
    const v = localStorage.getItem(TEACHER_KEY);
    return v ? (JSON.parse(v) as TeacherSession) : null;
  } catch { return null; }
}
export function clearTeacher() {
  try { localStorage.removeItem(TEACHER_KEY); } catch {}
}
export function getTeacherToken(): string | null {
  return getTeacher()?.token || null;
}

export async function api(path: string, options?: RequestInit) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getTeacherToken();
  // رمز المعلم يُرسل تلقائيًا عند توفره (للمسارات المحمية) — والكوكي httpOnly يُرسل أيضًا.
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> | undefined) },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path.startsWith("/api/")) {
    // انتهت جلسة المعلم — تنظيف تلقائي مع رسالة واضحة.
    const err = new Error(data?.error || "انتهت الجلسة، فضلًا سجّل الدخول مجددًا") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error(data?.error || "حدث خطأ");
  return data;
}
