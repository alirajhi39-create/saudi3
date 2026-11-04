"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getStudent, clearStudent, type StudentSession } from "@/lib/store";

export function Header() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  useEffect(() => { setStudent(getStudent()); }, []);
  return (
    <header className="sticky top-0 z-50 pattern-bg text-white shadow-lg no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9a86a] text-2xl shadow">🏫</span>
          <span>
            <span className="block text-lg font-black leading-tight">منصة العروس الابتدائية</span>
            <span className="block text-xs text-[#f2e4c4]">الدراسات الاجتماعية • الصف السادس • الدرس التاسع</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-bold md:flex">
          <Link href="/" className="rounded-full px-4 py-2 hover:bg-white/10">الرئيسية</Link>
          <Link href="/learn" className="rounded-full px-4 py-2 hover:bg-white/10">المحطات العشر</Link>
          <Link href="/certificate" className="rounded-full px-4 py-2 hover:bg-white/10">الشهادة</Link>
          <Link href="/teacher" className="rounded-full bg-[#c9a86a] px-4 py-2 text-[#063d23] hover:bg-[#d9b877]">👩‍🏫 المعلم</Link>
        </nav>
        <div className="flex items-center gap-2">
          {student ? (
            <div className="flex items-center gap-2 rounded-full bg-white/10 py-1 pe-1 ps-3">
              <span className="text-xl">{student.avatar}</span>
              <span className="max-w-[120px] truncate text-sm font-bold">{student.name}</span>
              <button
                onClick={() => { clearStudent(); window.location.href = "/"; }}
                className="rounded-full bg-white/15 px-3 py-1 text-xs hover:bg-white/25"
              >خروج</button>
            </div>
          ) : (
            <Link href="/#register" className="rounded-full bg-white px-5 py-2 text-sm font-black text-[#095c35] shadow hover:bg-[#f2e4c4]">
              ✨ دخول الطالب
            </Link>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-2 border-t border-white/10 px-4 py-2 text-xs font-bold md:hidden">
        <Link href="/" className="rounded-full bg-white/10 px-4 py-1.5">الرئيسية</Link>
        <Link href="/learn" className="rounded-full bg-white/10 px-4 py-1.5">المحطات</Link>
        <Link href="/certificate" className="rounded-full bg-white/10 px-4 py-1.5">الشهادة</Link>
        <Link href="/teacher" className="rounded-full bg-[#c9a86a] px-4 py-1.5 text-[#063d23]">المعلم</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="pattern-bg mt-10 text-white no-print">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <h4 className="text-lg font-black text-[#f2e4c4]">🏫 منصة العروس الابتدائية</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            منصة تعليمية تفاعلية لدرس «الجوانب الحضارية للدولتين السعوديتين الأولى والثانية»
            — الدراسات الاجتماعية، الصف السادس الابتدائي، صفحات 67–69.
          </p>
        </div>
        <div>
          <h4 className="font-black text-[#f2e4c4]">المحاور السبعة</h4>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {["الإدارة والحكم","التعليم","الخدمات الاجتماعية","الأمن","خدمة الحرمين","الجيش","العمران"].map(a=>(
              <span key={a} className="rounded-full bg-white/10 px-3 py-1">{a}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-black text-[#f2e4c4]">روابط سريعة</h4>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            <Link href="/learn" className="hover:text-[#f2e4c4]">← رحلة المحطات العشر</Link>
            <Link href="/certificate" className="hover:text-[#f2e4c4]">← شهادة الإنجاز</Link>
            <Link href="/teacher" className="hover:text-[#f2e4c4]">← لوحة تحكم المعلم</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/70">
        جميع المعلومات مطابقة لكتاب الدراسات الاجتماعية للصف السادس (ص 67–69) • وزارة التعليم 🇸🇦
      </div>
    </footer>
  );
}

export function SectionTitle({ icon, title, subtitle, gold }: { icon: string; title: string; subtitle?: string; gold?: boolean }) {
  return (
    <div className="mb-6 text-center">
      <span className={`inline-grid h-16 w-16 place-items-center rounded-3xl text-3xl shadow-lg ${gold ? "bg-[#c9a86a]" : "bg-[#0b6e3f] text-white"}`}>{icon}</span>
      <h2 className="mt-3 text-2xl font-black text-[#063d23] md:text-3xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[#e9dcc3] bg-white p-5 shadow-[0_10px_30px_rgba(6,61,35,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export function Feedback({ ok, text }: { ok: boolean | null; text: string }) {
  if (ok === null || !text) return null;
  return (
    <div className={`animate-pop mt-3 rounded-2xl border-2 p-3 text-sm font-bold leading-relaxed ${ok ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : "border-red-300 bg-red-50 text-red-700"}`}>
      <span className="me-1">{ok ? "✅" : "💡"}</span>{text}
    </div>
  );
}

export function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>الدرجة: {score} / {max}</span><span>{pct}%</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-l from-[#0b6e3f] to-[#c9a86a] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// مسجل الصوت — يعمل فعليًا عبر MediaRecorder ويحفظ base64
export function AudioRecorder({ onSave, initialUrl }: { onSave: (dataUrl: string) => void; initialUrl?: string }) {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | undefined>(initialUrl);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setUrl(initialUrl); }, [initialUrl]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function start() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setUrl(dataUrl);
          onSave(dataUrl);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("تعذّر الوصول إلى الميكروفون. تأكد من السماح بالوصول ثم حاول مجددًا.");
    }
  }
  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#c9a86a] bg-[#faf3e3] p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button onClick={start} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow hover:bg-red-700">
            🎙️ بدء التسجيل الصوتي
          </button>
        ) : (
          <button onClick={stop} className="animate-pulse rounded-full bg-[#063d23] px-5 py-2.5 text-sm font-black text-white shadow">
            ⏹️ إيقاف التسجيل ({seconds} ث)
          </button>
        )}
        {recording && (
          <div className="flex items-end gap-1" dir="ltr">
            {[0,1,2,3,4,5,6].map(i => (
              <span key={i} className="wave-bar w-1.5 rounded-full bg-red-500" style={{ animationDelay: `${i*0.12}s` }} />
            ))}
          </div>
        )}
        {url && !recording && (
          <audio controls src={url} className="h-9 max-w-[220px]" />
        )}
        {url && !recording && <span className="text-xs font-bold text-[#095c35]">✅ تم حفظ تسجيلك</span>}
      </div>
      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
      <p className="mt-2 text-[11px] text-slate-500">يُحفظ تسجيلك الصوتي في ملفك ويستطيع المعلم الاستماع إليه وتقييمه.</p>
    </div>
  );
}

export function StationNav({ current, total = 10 }: { current: number; total?: number }) {
  return (
    <div className="no-print mt-8 flex items-center justify-between gap-3">
      {current > 1 ? (
        <Link href={`/stations/${current - 1}`} className="rounded-full border-2 border-[#0b6e3f] px-6 py-2.5 text-sm font-black text-[#095c35] hover:bg-[#eef7f1]">
          → المحطة السابقة
        </Link>
      ) : <span />}
      <Link href="/learn" className="rounded-full bg-[#f4edde] px-5 py-2.5 text-xs font-black text-[#86683a] hover:bg-[#f2e4c4]">
        🗺️ خريطة المحطات
      </Link>
      {current < total ? (
        <Link href={`/stations/${current + 1}`} className="rounded-full bg-[#0b6e3f] px-6 py-2.5 text-sm font-black text-white shadow hover:bg-[#095c35]">
          المحطة التالية ←
        </Link>
      ) : (
        <Link href="/certificate" className="rounded-full bg-[#c9a86a] px-6 py-2.5 text-sm font-black text-[#063d23] shadow hover:bg-[#d9b877]">
          🎓 الشهادة
        </Link>
      )}
    </div>
  );
}
