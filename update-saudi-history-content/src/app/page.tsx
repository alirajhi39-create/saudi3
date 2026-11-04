"use client";
import { useState } from "react";
import Link from "next/link";
import { Header, Footer, Card, SectionTitle } from "@/components/ui";
import { AXES, STATIONS, GLOSSARY, LESSON_INTRO, LESSON_QUESTION, IMAGES } from "@/lib/content";
import { api, saveStudent } from "@/lib/store";

const AVATARS = ["🦅", "🐪", "🌴", "⭐", "🦁", "🐎", "🌙", "💎"];

export default function HomePage() {
  const [tab, setTab] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("6 / 1");
  const [avatar, setAvatar] = useState("🦅");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState("");

  async function handleRegister() {
    setMsg(""); setLoading(true);
    try {
      const data = await api("/api/students", { method: "POST", body: JSON.stringify({ action: "register", name, className, avatar }) });
      saveStudent({ id: data.student.id, name: data.student.name, className: data.student.className, grade: data.student.grade, studentCode: data.student.studentCode, avatar: data.student.avatar });
      setNewCode(data.student.studentCode);
      setOk(true);
      setMsg(`أهلًا بك يا ${data.student.name}! 🎉 تم تسجيلك بنجاح. رمزك الخاص: ${data.student.studentCode}`);
    } catch (e: unknown) {
      setOk(false);
      setMsg(e instanceof Error ? e.message : "حدث خطأ");
    } finally { setLoading(false); }
  }

  async function handleLogin() {
    setMsg(""); setLoading(true);
    try {
      const data = await api("/api/students", { method: "POST", body: JSON.stringify({ action: "login", studentCode: code }) });
      saveStudent({ id: data.student.id, name: data.student.name, className: data.student.className, grade: data.student.grade, studentCode: data.student.studentCode, avatar: data.student.avatar });
      setOk(true);
      setMsg(`مرحبًا بعودتك يا ${data.student.name}! 👋 تم استعادة تقدمك.`);
      setTimeout(() => { window.location.href = "/learn"; }, 900);
    } catch (e: unknown) {
      setOk(false);
      setMsg(e instanceof Error ? e.message : "حدث خطأ");
    } finally { setLoading(false); }
  }

  return (
    <div className="pattern-light min-h-screen">
      <Header />

      {/* HERO */}
      <section className="pattern-bg relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a86a] px-4 py-1.5 text-xs font-black text-[#063d23]">
              🇸🇦 الدراسات الاجتماعية • الصف السادس الابتدائي • الدرس التاسع
            </div>
            <h1 className="font-amiri mt-4 text-3xl font-bold leading-snug md:text-5xl">
              الجوانب الحضارية
              <br />
              <span className="text-[#f2e4c4]">للدولتين السعوديتين</span>
              <br />
              الأولى والثانية
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-white/90">
              {LESSON_INTRO}
            </p>
            <p className="mt-2 rounded-2xl bg-white/10 p-3 font-black text-[#f2e4c4]">
              {LESSON_QUESTION}
            </p>
            <p className="mt-2 text-xs text-white/70">📖 المصدر الرسمي: كتاب الدراسات الاجتماعية، صفحات 67–69</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#register" className="rounded-full bg-[#c9a86a] px-8 py-3 font-black text-[#063d23] shadow-lg hover:bg-[#d9b877]">
                🚀 ابدأ رحلة التعلم
              </a>
              <Link href="/learn" className="rounded-full border-2 border-white/40 px-8 py-3 font-black hover:bg-white/10">
                🗺️ استكشف المحطات
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs font-bold">
              {[["10", "محطات"], ["7", "محاور"], ["🎙️", "تسجيل صوتي"], ["🎓", "شهادة"]].map(([v, l]) => (
                <div key={l} className="rounded-2xl bg-white/10 p-3">
                  <div className="text-xl font-black text-[#f2e4c4]">{v}</div>
                  <div className="text-white/80">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-fadeUp relative">
            <div className="gold-frame overflow-hidden rounded-3xl shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.saudiFlagArch} alt="العمارة السعودية التقليدية" className="h-72 w-full object-cover md:h-96" />
            </div>
            <div className="animate-floaty absolute -bottom-5 right-6 rounded-2xl bg-white px-5 py-3 text-[#063d23] shadow-xl">
              <div className="text-xs font-bold text-[#86683a]">صورة تعليمية توضيحية</div>
              <div className="text-sm font-black">🏛️ العمارة الطينية النجدية الأصيلة</div>
            </div>
            <div className="absolute -top-4 left-4 rounded-full bg-[#c9a86a] px-4 py-2 text-xs font-black text-[#063d23] shadow">
              ✨ تجربة تفاعلية ممتعة
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 60" className="block w-full text-[#faf7f0]" fill="currentColor"><path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" /></svg>
      </section>

      {/* REGISTRATION */}
      <section id="register" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-10">
        <SectionTitle icon="✨" title="دخول الطالب" subtitle="سجّل اسمك واحصل على رمزك الخاص، أو ادخل برمزك لاستعادة تقدمك ومواصلة الرحلة من حيث توقفت." />
        <Card className="gold-frame">
          <div className="mb-5 flex rounded-full bg-[#f4edde] p-1 text-sm font-black">
            <button onClick={() => setTab("register")} className={`flex-1 rounded-full py-2.5 ${tab === "register" ? "bg-[#0b6e3f] text-white shadow" : "text-[#86683a]"}`}>📝 تسجيل جديد</button>
            <button onClick={() => setTab("login")} className={`flex-1 rounded-full py-2.5 ${tab === "login" ? "bg-[#0b6e3f] text-white shadow" : "text-[#86683a]"}`}>🔑 دخول برمزي</button>
          </div>
          {tab === "register" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-black text-[#063d23]">اسم الطالب الكريم</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: عبدالله محمد السالم" className="w-full rounded-2xl border-2 border-[#e9dcc3] p-3 text-sm outline-none focus:border-[#0b6e3f]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-black text-[#063d23]">الفصل الدراسي</label>
                <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full rounded-2xl border-2 border-[#e9dcc3] p-3 text-sm outline-none focus:border-[#0b6e3f]">
                  {["6 / 1", "6 / 2", "6 / 3", "6 / 4", "6 / 5"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-black text-[#063d23]">اختر شخصيتك المفضلة</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setAvatar(a)} className={`grid h-12 w-12 place-items-center rounded-2xl border-2 text-2xl ${avatar === a ? "border-[#0b6e3f] bg-[#eef7f1] shadow" : "border-[#e9dcc3] bg-white"}`}>{a}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleRegister} disabled={loading} className="rounded-2xl bg-[#0b6e3f] py-3 font-black text-white shadow hover:bg-[#095c35] disabled:opacity-50 md:col-span-2">
                {loading ? "⏳ جارٍ التسجيل..." : "🎉 تسجيل وبدء الرحلة"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-black text-[#063d23]">رمز الدخول الخاص بك (6 أحرف)</label>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="مثال: A7K9P2" maxLength={6} className="w-full rounded-2xl border-2 border-[#e9dcc3] p-3 text-center text-xl font-black tracking-[0.3em] outline-none focus:border-[#0b6e3f]" dir="ltr" />
              </div>
              <button onClick={handleLogin} disabled={loading} className="rounded-2xl bg-[#c9a86a] py-3 font-black text-[#063d23] shadow hover:bg-[#d9b877] disabled:opacity-50">
                {loading ? "⏳ جارٍ الدخول..." : "👋 دخول واستعادة تقدمي"}
              </button>
            </div>
          )}
          {msg && (
            <div className={`animate-pop mt-4 rounded-2xl border-2 p-4 text-center text-sm font-black ${ok ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : "border-red-300 bg-red-50 text-red-700"}`}>
              {msg}
              {ok && newCode && tab === "register" && (
                <div className="mt-3">
                  <div className="text-xs">⚠️ احفظ رمزك للدخول لاحقًا واستعادة تقدمك</div>
                  <Link href="/learn" className="mt-2 inline-block rounded-full bg-[#0b6e3f] px-8 py-2.5 text-white">🗺️ انتقل إلى المحطات ←</Link>
                </div>
              )}
              {ok && tab === "login" && (
                <div className="mt-2"><Link href="/learn" className="text-[#0b6e3f] underline">انتقل إلى المحطات ←</Link></div>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* 7 AXES */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <SectionTitle icon="📖" title="المحاور الحضارية السبعة" subtitle="كما وردت في الكتاب المدرسي (ص 67–69) — اضغط على أي محور لاستكشاف محطته التعليمية." gold />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AXES.map((axis) => (
            <Link key={axis.key} href="/learn" className="card-hover rounded-3xl border border-[#e9dcc3] bg-white p-5 shadow">
              <div className="flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `${axis.color}15` }}>{axis.icon}</span>
                <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[11px] font-black text-[#86683a]">{axis.page}</span>
              </div>
              <h3 className="mt-3 font-black text-[#063d23]">{axis.number}. {axis.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{axis.subtitle}</p>
              <div className="mt-3 space-y-1.5">
                {axis.points.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 text-[#c9a86a]">◆</span>
                    <span><b className="text-[#063d23]">{p.term}</b> <span className="text-slate-500">— {p.desc}</span></span>
                  </div>
                ))}
                {axis.points.length > 3 && <div className="text-[11px] font-bold text-[#86683a]">+ {axis.points.length - 3} نقاط أخرى...</div>}
              </div>
            </Link>
          ))}
          <div className="card-hover rounded-3xl bg-gradient-to-br from-[#0b6e3f] to-[#063d23] p-5 text-white shadow">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9a86a] text-2xl">🎓</span>
            <h3 className="mt-3 font-black">رحلة من 10 محطات تفاعلية</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/85">سحب وإفلات • مطابقة • ترتيب • تصنيف • تسجيل صوتي • اختبار شامل • شهادة إنجاز</p>
            <Link href="/learn" className="mt-4 block rounded-2xl bg-[#c9a86a] py-2.5 text-center text-sm font-black text-[#063d23] hover:bg-white">ابدأ الآن ←</Link>
          </div>
        </div>
      </section>

      {/* STATIONS PREVIEW */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle icon="🗺️" title="خريطة المحطات العشر" subtitle="رحلة متدرجة من التهيئة والعصف الذهني حتى الحصاد والشهادة." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STATIONS.map((s) => (
              <Link key={s.n} href={`/stations/${s.n}`} className="card-hover group rounded-3xl border-2 border-[#f4edde] bg-[#faf7f0] p-4 text-center hover:border-[#c9a86a]">
                <div className="text-3xl">{s.icon}</div>
                <div className="mt-1 text-[11px] font-black text-[#86683a]">المحطة {s.n} • {s.type}</div>
                <div className="text-sm font-black text-[#063d23]">{s.title}</div>
                <div className="text-[11px] text-slate-500">{s.subtitle}</div>
                <div className="mt-2 text-[11px] font-bold text-[#0b6e3f] opacity-0 group-hover:opacity-100">ادخل المحطة ←</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionTitle icon="⚡" title="لماذا منصة العروس؟" subtitle="تجربة تعليمية متكاملة صُممت خصيصًا لطلاب الصف السادس." />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["🎙️", "تسجيل صوتي", "سجّل إجاباتك ووصفك صوتيًا كما في الأنشطة الصفية"],
            ["🧲", "سحب وإفلات", "مطابقة وتصنيف وترتيب تفاعلي ممتع باللمس"],
            ["🤖", "تصحيح فوري", "تغذية راجعة تشرح سبب الصواب والخطأ دون كشف الحل"],
            ["🎓", "شهادة معتمدة", "شهادة إنجاز قابلة للطباعة PDF عند اجتياز الاختبار"],
            ["👩‍🏫", "متابعة المعلم", "لوحة تحكم وتقارير أداء وتقييم للإجابات المفتوحة"],
            ["💾", "حفظ التقدم", "رمز خاص لكل طالب لاستعادة التقدم في أي وقت"],
            ["📚", "محتوى رسمي", "مطابق حرفيًا لكتاب الدراسات الاجتماعية ص 67–69"],
            ["📱", "يعمل everywhere", "تصميم متجاوب يعمل على الجوال والحاسوب"],
          ].map(([i, t, d]) => (
            <Card key={t} className="card-hover text-center">
              <div className="text-3xl">{i}</div>
              <h4 className="mt-2 text-sm font-black text-[#063d23]">{t}</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* GLOSSARY */}
      <section className="mx-auto max-w-7xl px-4 pb-6">
        <SectionTitle icon="📜" title="قاموس مصطلحات الكتاب" subtitle="مصطلحات الدرس الأساسية كما وردت في الكتاب دون تغيير." gold />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-2xl border-r-4 border-[#c9a86a] bg-white p-4 shadow-sm">
              <div className="font-black text-[#095c35]">{g.term}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-600">{g.def}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
