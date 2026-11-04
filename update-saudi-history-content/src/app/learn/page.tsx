"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, Footer, SectionTitle, Card } from "@/components/ui";
import { STATIONS, AXES } from "@/lib/content";
import { getStudent, api, type StudentSession } from "@/lib/store";

interface Prog { stationNumber: number; status: string; score: number; maxScore: number; }

export default function LearnPage() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [progress, setProgress] = useState<Prog[]>([]);
  const [quizBest, setQuizBest] = useState<number | null>(null);

  useEffect(() => {
    const s = getStudent();
    setStudent(s);
    if (s) {
      api(`/api/progress?studentId=${s.id}`).then((d) => setProgress(d.progress || [])).catch(() => {});
      api(`/api/quiz?studentId=${s.id}`).then((d) => {
        const at = d.attempts || [];
        if (at.length) setQuizBest(Math.max(...at.map((a: { percentage: number }) => a.percentage)));
      }).catch(() => {});
    }
  }, []);

  const completed = progress.filter((p) => p.status === "completed").length;
  const pct = Math.round((completed / 10) * 100);

  function statusOf(n: number) {
    return progress.find((p) => p.stationNumber === n)?.status || "not_started";
  }

  return (
    <div className="pattern-light min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle icon="🗺️" title="رحلة المحطات العشر" subtitle="أكمل المحطات بالترتيب، واحصل على شهادتك عند اجتياز الاختبار الختامي." />

        {!student ? (
          <Card className="mx-auto mb-6 max-w-2xl border-2 border-[#c9a86a] text-center">
            <p className="font-black text-[#063d23]">⚠️ سجّل دخولك أولًا لحفظ تقدمك ودرجاتك</p>
            <Link href="/#register" className="mt-3 inline-block rounded-full bg-[#0b6e3f] px-8 py-2.5 text-sm font-black text-white">✨ تسجيل / دخول الطالب</Link>
            <p className="mt-2 text-xs text-slate-500">يمكنك تصفح المحطات كزائر، لكن لن يُحفظ تقدمك.</p>
          </Card>
        ) : (
          <Card className="mx-auto mb-6 max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{student.avatar}</span>
                <div>
                  <div className="font-black text-[#063d23]">{student.name}</div>
                  <div className="text-xs text-slate-500">{student.grade} • فصل {student.className} • الرمز: <b dir="ltr">{student.studentCode}</b></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#0b6e3f]">{pct}%</div>
                <div className="text-xs text-slate-500">أنجزت {completed} من 10</div>
              </div>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-l from-[#0b6e3f] via-[#1e8a55] to-[#c9a86a] transition-all" style={{ width: `${pct}%` }} />
            </div>
            {quizBest !== null && (
              <div className="mt-2 text-center text-xs font-bold text-[#86683a]">🏆 أفضل نتيجة في الاختبار الختامي: {quizBest}%</div>
            )}
          </Card>
        )}

        <div className="station-path space-y-4">
          {STATIONS.map((s, idx) => {
            const st = statusOf(s.n);
            const axis = AXES.find((a) => a.key === (s as { axis?: string }).axis);
            return (
              <div key={s.n} className="animate-fadeUp relative" style={{ animationDelay: `${idx * 0.05}s` }}>
                <Link href={`/stations/${s.n}`} className="card-hover mx-auto flex max-w-3xl items-center gap-4 rounded-3xl border-2 bg-white p-4 shadow md:p-5"
                  style={{ borderColor: st === "completed" ? "#0b6e3f" : "#e9dcc3" }}>
                  <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl shadow" style={{ background: `${s.color}18` }}>
                    {s.icon}
                    <span className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-[#063d23] text-xs font-black text-white">{s.n}</span>
                  </span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <b className="text-[#063d23]">{s.title}</b>
                      {st === "completed" ? (
                        <span className="rounded-full bg-[#0b6e3f] px-2.5 py-0.5 text-[11px] font-black text-white">✅ مكتملة</span>
                      ) : st === "in_progress" ? (
                        <span className="rounded-full bg-[#c9a86a] px-2.5 py-0.5 text-[11px] font-black text-[#063d23]">⏳ جارية</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-500">○ لم تبدأ</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{s.subtitle} • ⏱️ {s.minutes} دقائق • {s.type}</span>
                    {axis && <span className="mt-1 block text-[11px] font-bold text-[#86683a]">📖 {axis.title} — {axis.page}</span>}
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4edde] text-lg">←</span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-3xl text-center">
          <Link href="/certificate" className="inline-block rounded-full bg-[#c9a86a] px-10 py-3 font-black text-[#063d23] shadow-lg hover:bg-[#d9b877]">
            🎓 الانتقال إلى الشهادة
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
