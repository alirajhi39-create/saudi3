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

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "حدث خطأ");
  return data;
}
