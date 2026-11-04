"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, Footer, Card, SectionTitle } from "@/components/ui";
import { STATIONS } from "@/lib/content";
import { api, saveTeacher, getTeacher, clearTeacher, type TeacherSession } from "@/lib/store";

type Tab = "stats" | "students" | "review" | "questions" | "content";

interface StatsData {
  totals: { students: number; completedActivities: number; attempts: number; answers: number; avgQuiz: number; passRate: number; needsReview: number };
  perStation: Record<number, { completed: number; avg: number }>;
  perStudent: { id: number; name: string; className: string; studentCode: string; avatar: string; completedStations: number; bestQuiz: number; answersCount: number; attemptsCount: number }[];
}

export default function TeacherPage() {
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [username, setUsername] = useState("teacher");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);

  // review
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [filterStation, setFilterStation] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<Record<number, { text: string; score: string }>>({});

  // questions
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  const [qForm, setQForm] = useState({ axis: "الإدارة والحكم", type: "mcq", questionText: "", options: "", correct: "", explanation: "", difficulty: "فهم", points: "1" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qMsg, setQMsg] = useState("");

  // content
  const [contents, setContents] = useState<Record<string, unknown>[]>([]);
  const [cMsg, setCMsg] = useState("");

  useEffect(() => {
    const t = getTeacher();
    if (t) { setTeacher(t); loadAll(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const s = await api("/api/teacher?view=stats");
      setStats(s);
      const r = await api("/api/answers?needsReview=1");
      setReviews(r.answers || []);
      const q = await api("/api/questions");
      setQuestions(q.questions || []);
      const c = await api("/api/content");
      setContents(c.contents || []);
    } catch (e: unknown) {
      // انتهت الجلسة أو رمز غير صالح → خروج تلقائي وطلب الدخول مجددًا.
      if ((e as { status?: number })?.status === 401) {
        clearTeacher();
        setTeacher(null);
        setLoginMsg("انتهت الجلسة، فضلًا سجّل الدخول مجددًا");
      }
    } finally { setLoading(false); }
  }

  async function login() {
    setLoginMsg("");
    try {
      const d = await api("/api/teacher", { method: "POST", body: JSON.stringify({ action: "login", username, password }) });
      saveTeacher(d.teacher);
      setTeacher(d.teacher);
      loadAll();
    } catch (e: unknown) {
      setLoginMsg(e instanceof Error ? e.message : "خطأ");
    }
  }

  async function submitReview(id: number, maxScore: number) {
    const f = feedbackMap[id] || { text: "", score: "" };
    try {
      await api("/api/answers", { method: "PUT", body: JSON.stringify({ id, teacherFeedback: f.text, teacherScore: f.score ? Number(f.score) : undefined, status: "reviewed" }) });
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch {}
  }

  async function saveQuestion() {
    setQMsg("");
    try {
      const optionsArr = qForm.options.split("\n").map((s) => s.trim()).filter(Boolean);
      const payload = {
        axis: qForm.axis, type: qForm.type, questionText: qForm.questionText,
        options: optionsArr.length ? optionsArr : null,
        correctAnswer: qForm.correct ? { value: qForm.correct } : null,
        explanation: qForm.explanation, difficulty: qForm.difficulty, points: Number(qForm.points) || 1,
      };
      if (editingId) {
        await api("/api/questions", { method: "PUT", body: JSON.stringify({ id: editingId, ...payload }) });
        setQMsg("✅ تم حفظ التعديلات");
      } else {
        await api("/api/questions", { method: "POST", body: JSON.stringify(payload) });
        setQMsg("✅ تمت إضافة السؤال");
      }
      setEditingId(null);
      setQForm({ axis: "الإدارة والحكم", type: "mcq", questionText: "", options: "", correct: "", explanation: "", difficulty: "فهم", points: "1" });
      const q = await api("/api/questions");
      setQuestions(q.questions || []);
    } catch { setQMsg("❌ حدث خطأ"); }
  }

  function startEdit(q: Record<string, unknown>) {
    setEditingId(q.id as number);
    const opts = q.options as string[] | null;
    const corr = q.correctAnswer as { value?: string } | null;
    setQForm({
      axis: String(q.axis || ""), type: String(q.type || "mcq"),
      questionText: String(q.questionText || ""),
      options: Array.isArray(opts) ? opts.join("\n") : "",
      correct: corr?.value ? String(corr.value) : "",
      explanation: String(q.explanation || ""),
      difficulty: String(q.difficulty || "فهم"),
      points: String((q.points as number) ?? 1),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteQuestion(id: number) {
    if (!confirm("حذف هذا السؤال؟")) return;
    await api(`/api/questions?id=${id}`, { method: "DELETE" });
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  async function toggleActive(q: Record<string, unknown>) {
    await api("/api/questions", { method: "PUT", body: JSON.stringify({ id: q.id, isActive: !q.isActive }) });
    setQuestions((qs) => qs.map((x) => x.id === q.id ? { ...x, isActive: !x.isActive } : x));
  }

  async function saveContent(stationNumber: number, title: string) {
    try {
      await api("/api/content", { method: "PUT", body: JSON.stringify({ stationNumber, title }) });
      setCMsg("✅ تم الحفظ");
      setTimeout(() => setCMsg(""), 2000);
    } catch { setCMsg("❌ خطأ"); }
  }

  if (!teacher) {
    return (
      <div className="pattern-light min-h-screen">
        <Header />
        <div className="mx-auto max-w-md px-4 py-14">
          <Card className="gold-frame text-center">
            <div className="text-5xl">👩‍🏫</div>
            <h2 className="mt-2 text-xl font-black text-[#063d23]">لوحة تحكم المعلم</h2>
            <p className="mt-1 text-xs text-slate-500">الدخول الافتراضي: teacher / 1234</p>
            <div className="mt-4 space-y-3 text-right">
              <div>
                <label className="text-xs font-black text-[#063d23]">اسم المستخدم</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-2xl border-2 border-[#e9dcc3] p-2.5 text-sm outline-none focus:border-[#0b6e3f]" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-black text-[#063d23]">كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} className="mt-1 w-full rounded-2xl border-2 border-[#e9dcc3] p-2.5 text-sm outline-none focus:border-[#0b6e3f]" dir="ltr" />
              </div>
              <button onClick={login} className="w-full rounded-2xl bg-[#0b6e3f] py-2.5 font-black text-white">🔓 دخول اللوحة</button>
              {loginMsg && <p className="rounded-xl bg-red-50 p-2 text-center text-xs font-bold text-red-600">{loginMsg}</p>}
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const filtered = filterStation ? reviews.filter((r) => String(r.stationNumber) === filterStation) : reviews;

  return (
    <div className="pattern-light min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-[#063d23]">👩‍🏫 لوحة تحكم المعلم — {teacher.name}</h1>
            <p className="text-xs text-slate-500">إحصائيات • تقارير طلاب • مراجعة إجابات • بنك أسئلة • محرر محتوى</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAll} className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#095c35] shadow ring-1 ring-[#e9dcc3]">🔄 تحديث</button>
            <button onClick={() => { clearTeacher(); window.location.href = "/"; }} className="rounded-full bg-red-100 px-4 py-2 text-xs font-black text-red-700">خروج</button>
          </div>
        </div>

        <div className="no-print mt-4 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow">
          {([["stats", "📊 الإحصائيات"], ["students", "🧑‍🎓 الطلاب والتقارير"], ["review", `📝 المراجعة (${reviews.length})`], ["questions", `❓ بنك الأسئلة (${questions.length})`], ["content", "✏️ محرر المحتوى"]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-black ${tab === k ? "bg-[#0b6e3f] text-white shadow" : "bg-[#faf7f0] text-[#86683a]"}`}>{label}</button>
          ))}
        </div>

        {loading && <p className="mt-4 text-center text-sm text-slate-500">⏳ جارٍ التحميل...</p>}

        {/* STATS */}
        {tab === "stats" && stats && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["🧑‍🎓", "الطلاب المسجلون", stats.totals.students],
                ["📝", "محاولات الاختبار", stats.totals.attempts],
                ["📊", "متوسط الاختبار", `${stats.totals.avgQuiz}%`],
                ["🎓", "نسبة النجاح", `${stats.totals.passRate}%`],
                ["✅", "أنشطة مكتملة", stats.totals.completedActivities],
                ["💬", "إجابات محفوظة", stats.totals.answers],
                ["⏳", "بانتظار المراجعة", stats.totals.needsReview],
                ["🗺️", "المحطات", "10"],
              ].map(([i, l, v]) => (
                <Card key={l as string} className="text-center">
                  <div className="text-2xl">{i}</div>
                  <div className="text-xl font-black text-[#063d23]">{v}</div>
                  <div className="text-xs text-slate-500">{l}</div>
                </Card>
              ))}
            </div>
            <Card>
              <h3 className="font-black text-[#063d23]">📈 الإنجاز حسب المحطة</h3>
              <div className="mt-3 space-y-2">
                {STATIONS.map((s) => {
                  const p = stats.perStation[s.n] || { completed: 0, avg: 0 };
                  return (
                    <div key={s.n} className="flex items-center gap-3 text-xs">
                      <span className="w-40 shrink-0 truncate font-bold text-[#063d23]">{s.icon} {s.n}. {s.title}</span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-l from-[#0b6e3f] to-[#c9a86a]" style={{ width: `${stats.totals.students ? Math.round((p.completed / Math.max(1, stats.totals.students)) * 100) : 0}%` }} />
                      </div>
                      <span className="w-24 shrink-0 text-slate-500">{p.completed} أكملوا • {p.avg}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* STUDENTS */}
        {tab === "students" && stats && (
          <Card className="mt-4 overflow-x-auto">
            <h3 className="font-black text-[#063d23]">🧑‍🎓 تقارير الطلاب ({stats.perStudent.length})</h3>
            <table className="mt-3 w-full min-w-[700px] text-xs">
              <thead>
                <tr className="bg-[#063d23] text-white">
                  {["الطالب", "الفصل", "الرمز", "المحطات", "أفضل اختبار", "الإجابات", "المحاولات", "الحالة"].map((h) => (
                    <th key={h} className="p-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.perStudent.map((s) => (
                  <tr key={s.id} className="border-b border-[#f4edde] hover:bg-[#faf7f0]">
                    <td className="p-2.5 font-black text-[#063d23]">{s.avatar} {s.name}</td>
                    <td className="p-2.5 text-center">{s.className}</td>
                    <td className="p-2.5 text-center font-mono" dir="ltr">{s.studentCode}</td>
                    <td className="p-2.5 text-center">
                      <span className="rounded-full bg-[#eef7f1] px-2.5 py-0.5 font-black text-[#095c35]">{s.completedStations}/10</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 font-black ${s.bestQuiz >= 60 ? "bg-[#0b6e3f] text-white" : "bg-slate-100 text-slate-500"}`}>{s.bestQuiz}%</span>
                    </td>
                    <td className="p-2.5 text-center">{s.answersCount}</td>
                    <td className="p-2.5 text-center">{s.attemptsCount}</td>
                    <td className="p-2.5 text-center">{s.completedStations >= 7 && s.bestQuiz >= 60 ? "🎓 مستحق للشهادة" : s.completedStations > 0 ? "⏳ جارٍ" : "○ لم يبدأ"}</td>
                  </tr>
                ))}
                {stats.perStudent.length === 0 && (
                  <tr><td colSpan={8} className="p-6 text-center text-slate-400">لا يوجد طلاب مسجلون بعد.</td></tr>
                )}
              </tbody>
            </table>
          </Card>
        )}

        {/* REVIEW */}
        {tab === "review" && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black text-[#063d23]">تصفية حسب المحطة:</span>
              <select value={filterStation} onChange={(e) => setFilterStation(e.target.value)} className="rounded-xl border-2 border-[#e9dcc3] bg-white px-3 py-1.5 text-sm">
                <option value="">الكل ({reviews.length})</option>
                {[1, 3, 5, 10].map((n) => (
                  <option key={n} value={String(n)}>المحطة {n}</option>
                ))}
              </select>
            </div>
            {filtered.length === 0 && <Card className="text-center text-sm text-slate-500">🎉 لا توجد إجابات بانتظار المراجعة!</Card>}
            {filtered.map((r) => {
              const id = r.id as number;
              const f = feedbackMap[id] || { text: String(r.teacherFeedback || ""), score: r.teacherScore !== null && r.teacherScore !== undefined ? String(r.teacherScore) : "" };
              const stName = stats?.perStudent.find((s) => s.id === r.studentId);
              return (
                <Card key={id} className="border-r-4 border-[#c9a86a]">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-black text-[#063d23]">
                      {stName ? `${stName.avatar} ${stName.name} (${stName.className})` : `طالب #${String(r.studentId)}`} • المحطة {String(r.stationNumber)} • {String(r.activityKey)}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-black text-amber-800">{String(r.status)}</span>
                  </div>
                  {r.answerText ? (
                    <p className="mt-2 rounded-2xl bg-[#faf7f0] p-3 text-sm leading-relaxed">{String(r.answerText)}</p>
                  ) : <p className="mt-2 text-xs text-slate-400">(لا يوجد نص — قد تكون إجابة صوتية فقط)</p>}
                  {r.audioData ? (
                    <div className="mt-2">
                      <audio controls src={String(r.audioData)} className="h-9 w-full max-w-md" />
                    </div>
                  ) : null}
                  <div className="mt-3 grid gap-2 md:grid-cols-[1fr_120px_auto]">
                    <input
                      value={f.text}
                      onChange={(e) => setFeedbackMap((m) => ({ ...m, [id]: { ...f, text: e.target.value } }))}
                      placeholder="✍️ اكتب تغذيتك الراجعة للطالب..."
                      className="rounded-xl border-2 border-[#e9dcc3] p-2 text-sm outline-none focus:border-[#0b6e3f]"
                    />
                    <input
                      value={f.score}
                      onChange={(e) => setFeedbackMap((m) => ({ ...m, [id]: { ...f, score: e.target.value } }))}
                      placeholder={`الدرجة / ${String(r.maxScore)}`}
                      type="number" min={0} max={Number(r.maxScore) || 10}
                      className="rounded-xl border-2 border-[#e9dcc3] p-2 text-center text-sm"
                    />
                    <button onClick={() => submitReview(id, Number(r.maxScore) || 10)} className="rounded-xl bg-[#0b6e3f] px-5 py-2 text-sm font-black text-white">
                      ✅ اعتماد التقييم
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* QUESTIONS */}
        {tab === "questions" && (
          <div className="mt-4 space-y-4">
            <Card className="gold-frame">
              <h3 className="font-black text-[#063d23]">{editingId ? `✏️ تعديل السؤال #${editingId}` : "➕ إضافة سؤال جديد لبنك الأسئلة"}</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <div>
                  <label className="text-xs font-black">المحور</label>
                  <select value={qForm.axis} onChange={(e) => setQForm({ ...qForm, axis: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm">
                    {["الإدارة والحكم", "التعليم", "الخدمات الاجتماعية", "الأمن", "خدمة الحرمين", "الجيش", "العمران", "مراجعة شاملة"].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-black">النوع</label>
                    <select value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm">
                      <option value="mcq">اختيار</option>
                      <option value="true_false">صح/خطأ</option>
                      <option value="matching">مطابقة</option>
                      <option value="ordering">ترتيب</option>
                      <option value="classification">تصنيف</option>
                      <option value="short">تفسير قصير</option>
                      <option value="image_desc">وصف صورة</option>
                      <option value="audio">إجابة صوتية</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black">الصعوبة</label>
                    <select value={qForm.difficulty} onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm">
                      {["تذكر", "فهم", "تطبيق", "استنتاج"].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black">الدرجة</label>
                    <input value={qForm.points} onChange={(e) => setQForm({ ...qForm, points: e.target.value })} type="number" min={1} className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-black">نص السؤال *</label>
                  <input value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} placeholder="اكتب السؤال هنا..." className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-black">الخيارات (سطر لكل خيار)</label>
                  <textarea value={qForm.options} onChange={(e) => setQForm({ ...qForm, options: e.target.value })} rows={3} placeholder={"الخيار الأول\nالخيار الثاني\nالخيار الثالث"} className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-black">الإجابة الصحيحة</label>
                  <input value={qForm.correct} onChange={(e) => setQForm({ ...qForm, correct: e.target.value })} placeholder="نص الإجابة الصحيحة حرفيًا" className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm" />
                  <label className="mt-2 block text-xs font-black">التغذية الراجعة (سبب الصواب)</label>
                  <input value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} placeholder="اشرح سبب صحة الإجابة..." className="mt-1 w-full rounded-xl border-2 border-[#e9dcc3] p-2 text-sm" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveQuestion} className="flex-1 rounded-xl bg-[#0b6e3f] py-2.5 text-sm font-black text-white">{editingId ? "💾 حفظ التعديل" : "➕ إضافة السؤال"}</button>
                {editingId && <button onClick={() => { setEditingId(null); setQForm({ axis: "الإدارة والحكم", type: "mcq", questionText: "", options: "", correct: "", explanation: "", difficulty: "فهم", points: "1" }); }} className="rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-black">إلغاء</button>}
              </div>
              {qMsg && <p className="mt-2 text-center text-xs font-bold text-[#095c35]">{qMsg}</p>}
            </Card>

            <div className="space-y-2">
              {questions.map((q) => (
                <Card key={String(q.id)} className={q.isActive ? "" : "opacity-60"}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-black">
                        <span className="rounded-full bg-[#eef7f1] px-2 py-0.5 text-[#095c35]">{String(q.axis)}</span>
                        <span className="rounded-full bg-[#f4edde] px-2 py-0.5 text-[#86683a]">{String(q.type)} • {String(q.difficulty)} • {String(q.points)}°</span>
                        {!q.isActive && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">معطّل</span>}
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-[#063d23]">#{String(q.id)} — {String(q.questionText)}</p>
                      {q.explanation ? <p className="mt-0.5 text-xs text-slate-500">💡 {String(q.explanation)}</p> : null}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleActive(q)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black">{q.isActive ? "⏸️ تعطيل" : "▶️ تفعيل"}</button>
                      <button onClick={() => startEdit(q)} className="rounded-lg bg-[#f4edde] px-3 py-1.5 text-xs font-black text-[#86683a]">✏️</button>
                      <button onClick={() => deleteQuestion(q.id as number)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-black text-red-700">🗑️</button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT */}
        {tab === "content" && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500">✏️ حرّر عناوين المحطات وملاحظاتها (المحتوى الرسمي من الكتاب محفوظ ولا يُحذف).</p>
            {cMsg && <p className="rounded-xl bg-[#eef7f1] p-2 text-center text-xs font-black text-[#095c35]">{cMsg}</p>}
            {contents.map((c) => (
              <Card key={String(c.id)} className="flex flex-wrap items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#063d23] font-black text-white">{String(c.stationNumber)}</span>
                <input
                  defaultValue={String(c.title)}
                  id={`ct-${String(c.stationNumber)}`}
                  className="min-w-[200px] flex-1 rounded-xl border-2 border-[#e9dcc3] p-2 text-sm font-bold"
                />
                <span className="text-xs text-slate-400">{STATIONS[Number(c.stationNumber) - 1]?.subtitle}</span>
                <button
                  onClick={() => {
                    const el = document.getElementById(`ct-${String(c.stationNumber)}`) as HTMLInputElement;
                    saveContent(Number(c.stationNumber), el.value);
                  }}
                  className="rounded-xl bg-[#0b6e3f] px-4 py-2 text-xs font-black text-white"
                >💾 حفظ</button>
                <Link href={`/stations/${String(c.stationNumber)}`} className="rounded-xl bg-[#f4edde] px-4 py-2 text-xs font-black text-[#86683a]">👁️ معاينة</Link>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
