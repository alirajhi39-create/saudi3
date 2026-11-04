"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, Footer, Card } from "@/components/ui";
import { getStudent, api, type StudentSession } from "@/lib/store";

export default function CertificatePage() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [completed, setCompleted] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [bestMax, setBestMax] = useState(0);
  const [code, setCode] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const s = getStudent();
    setStudent(s);
    setDate(new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }));
    if (s) {
      api(`/api/progress?studentId=${s.id}`).then((d) => {
        setCompleted((d.progress || []).filter((p: { status: string }) => p.status === "completed").length);
      }).catch(() => {});
      api(`/api/quiz?studentId=${s.id}`).then((d) => {
        const at = d.attempts || [];
        if (at.length) {
          const sorted = [...at].sort((a, b) => b.percentage - a.percentage);
          setBest(sorted[0].percentage);
          setBestScore(sorted[0].score);
          setBestMax(sorted[0].maxScore);
        }
      }).catch(() => {});
      setCode(`AROOS-${s.id}-${s.studentCode}`);
    }
  }, []);

  const eligible = completed >= 7 && (best || 0) >= 60;

  function print() {
    window.print();
  }

  return (
    <div className="pattern-light min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {!student ? (
          <Card className="mx-auto max-w-xl text-center">
            <div className="text-5xl">🎓</div>
            <h2 className="mt-2 text-xl font-black text-[#063d23]">شهادة الإنجاز</h2>
            <p className="mt-1 text-sm text-slate-500">سجّل دخولك أولًا لعرض شهادتك.</p>
            <Link href="/#register" className="mt-4 inline-block rounded-full bg-[#0b6e3f] px-8 py-2.5 text-sm font-black text-white">✨ تسجيل / دخول</Link>
          </Card>
        ) : !eligible ? (
          <Card className="mx-auto max-w-xl text-center">
            <div className="text-5xl">📌</div>
            <h2 className="mt-2 text-xl font-black text-[#063d23]">شهادتك لم تجهز بعد</h2>
            <div className="mx-auto mt-4 max-w-sm space-y-2 text-right text-sm">
              <div className={`rounded-2xl p-3 ${completed >= 7 ? "bg-[#eef7f1] text-[#095c35]" : "bg-slate-100 text-slate-600"}`}>
                {completed >= 7 ? "✅" : "○"} إتمام 7 محطات على الأقل (أتممت {completed} من 10)
              </div>
              <div className={`rounded-2xl p-3 ${(best || 0) >= 60 ? "bg-[#eef7f1] text-[#095c35]" : "bg-slate-100 text-slate-600"}`}>
                {(best || 0) >= 60 ? "✅" : "○"} اجتياز الاختبار بنسبة 60%+ {best !== null ? `(نتيجتك ${best}%)` : "(لم تختبر بعد)"}
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/learn" className="rounded-full bg-[#0b6e3f] px-6 py-2 text-sm font-black text-white">🗺️ أكمل رحلتك</Link>
              <Link href="/stations/9" className="rounded-full bg-[#c9a86a] px-6 py-2 text-sm font-black text-[#063d23]">📝 الاختبار</Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="no-print mb-4 flex flex-wrap items-center justify-center gap-2">
              <button onClick={print} className="rounded-full bg-[#0b6e3f] px-8 py-2.5 text-sm font-black text-white shadow hover:bg-[#095c35]">
                🖨️ طباعة / حفظ PDF
              </button>
              <Link href="/learn" className="rounded-full border-2 border-[#0b6e3f] px-6 py-2 text-sm font-black text-[#095c35]">🗺️ العودة للمحطات</Link>
            </div>

            {/* الشهادة */}
            <div className="print-full overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-4 ring-[#c9a86a]">
              <div className="pattern-bg px-6 py-4 text-center text-white">
                <div className="text-xs font-bold text-[#f2e4c4]">المملكة العربية السعودية • وزارة التعليم</div>
                <div className="mt-0.5 text-sm font-black">🏫 منصة العروس الابتدائية</div>
              </div>
              <div className="relative px-6 py-8 text-center md:px-12">
                <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border-[3px] border-double border-[#c9a86a]" />
                <div className="text-5xl">🎓</div>
                <h1 className="font-amiri mt-2 text-3xl font-bold text-[#063d23] md:text-4xl">شهادة إنجاز وتفوق</h1>
                <p className="mt-1 text-sm text-[#86683a]">تشهد منصة العروس الابتدائية بأن الطالب/الطالبة</p>
                <div className="mx-auto mt-3 max-w-md rounded-2xl bg-[#faf3e3] px-6 py-3 ring-1 ring-[#c9a86a]">
                  <span className="text-2xl">{student.avatar}</span>
                  <div className="text-2xl font-black text-[#063d23]">{student.name}</div>
                  <div className="text-xs text-slate-500">{student.grade} • فصل {student.className}</div>
                </div>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-700">
                  قد أتمَّ بنجاح رحلة المحطات التعليمية العشر لدرس
                  <b className="text-[#063d23]"> «الجوانب الحضارية للدولتين السعوديتين الأولى والثانية» </b>
                  (الدراسات الاجتماعية — الصف السادس — ص 67–69)، واجتاز الاختبار الختامي الشامل بتفوق.
                </p>
                <div className="mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#eef7f1] p-3">
                    <div className="text-xl font-black text-[#0b6e3f]">{completed}/10</div>
                    <div className="text-[11px] text-slate-500">المحطات المكتملة</div>
                  </div>
                  <div className="rounded-2xl bg-[#faf3e3] p-3">
                    <div className="text-xl font-black text-[#86683a]">{best}%</div>
                    <div className="text-[11px] text-slate-500">نتيجة الاختبار</div>
                  </div>
                  <div className="rounded-2xl bg-[#f4edde] p-3">
                    <div className="text-xl font-black text-[#063d23]">{bestScore}/{bestMax}</div>
                    <div className="text-[11px] text-slate-500">الدرجة التفصيلية</div>
                  </div>
                </div>
                <div className="mx-auto mt-4 flex max-w-xl items-end justify-between text-xs">
                  <div className="text-right">
                    <div className="font-black text-[#063d23]">المعلم المشرف</div>
                    <div className="font-amiri mt-1 text-lg">توقيع وختم المدرسة</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block rounded-xl bg-[#063d23] px-4 py-1.5 font-mono font-black text-[#f2e4c4]" dir="ltr">{code}</div>
                    <div className="mt-1 text-slate-500">تاريخ الإصدار: {date}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-[#063d23]">إدارة المدرسة</div>
                    <div className="mt-1 text-2xl">🇸🇦</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#063d23] px-6 py-2 text-center text-[11px] text-[#f2e4c4]">
                المحاور السبعة: الإدارة والحكم • التعليم • الخدمات الاجتماعية • الأمن • خدمة الحرمين الشريفين • الجيش • العمران
              </div>
            </div>
            <p className="no-print mt-3 text-center text-xs text-slate-500">💡 لطباعة الشهادة: اضغط زر الطباعة واختر «حفظ كملف PDF» أو اطبعها مباشرة (يُنصح بالاتجاه الأفقي).</p>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
