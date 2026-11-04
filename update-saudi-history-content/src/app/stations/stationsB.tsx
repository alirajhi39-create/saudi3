"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, AudioRecorder, Feedback, ScoreBar } from "@/components/ui";
import { MatchGame, OrderGame, ChoiceQuiz } from "@/components/games";
import { AXES, IMAGES, QUESTION_BANK, FINAL_QUIZ_IDS } from "@/lib/content";
import { getStudent, api, type StudentSession } from "@/lib/store";

async function markProgress(stationNumber: number, score = 0, maxScore = 0, status = "completed") {
  const s = getStudent();
  if (!s) return;
  try {
    await api("/api/progress", { method: "POST", body: JSON.stringify({ studentId: s.id, stationNumber, score, maxScore, status }) });
  } catch {}
}
async function saveAnswer(payload: Record<string, unknown>) {
  const s = getStudent();
  if (!s) return null;
  try {
    return await api("/api/answers", { method: "POST", body: JSON.stringify({ studentId: s.id, ...payload }) });
  } catch { return null; }
}

/* ================= المحطة 6: الأمن ================= */
export function Station6() {
  const axis = AXES[3];
  const [score, setScore] = useState<number | null>(null);

  const scenarios = [
    { q: "🌙 رأى العسس شخصًا يتجول ليلًا قرب البيوت بشكل مريب. ما الإجراء الصحيح؟", options: ["تفقد المكان والحراسة ليلًا (نظام العسس)", "تركه دون متابعة", "منع الناس من الخروج نهارًا"], correct: "تفقد المكان والحراسة ليلًا (نظام العسس)", why: "طورت الدولة نظام العسس ليلًا للحراسة والتفقد (ص 68)." },
    { q: "⚖️ حدث خلاف بين بائع ومشترٍ في السوق. كيف يُحل الخلاف بعدل؟", options: ["بتطبيق الشريعة الإسلامية والعدل والحزم", "بترك الخلاف يكبر", "بإغلاق السوق نهائيًا"], correct: "بتطبيق الشريعة الإسلامية والعدل والحزم", why: "نشرت الدولة الأمن بتطبيق الشريعة الإسلامية والعدل والحزم (ص 68)." },
    { q: "🏘️ مدينة بعيدة تحتاج من يقيم الأمن ويدير شؤون المواطنين. ما الحل؟", options: ["تعيين أمير فيها لإقامة الأمن وإدارة الشؤون", "تركها دون إدارة", "نقل سكانها لمدينة أخرى"], correct: "تعيين أمير فيها لإقامة الأمن وإدارة الشؤون", why: "عيّنت الدولة أمراء في أنحاء الدولة لإقامة الأمن وإدارة شؤون المواطنين (ص 68)." },
    { q: "👮‍♂️ أرادت الدولة حماية الأحياء والأسواق باستمرار. ماذا تفعل؟", options: ["إنشاء مجموعات لحفظ الأمن", "الاعتماد على الأفراد وحدهم", "إهمال الحراسة"], correct: "إنشاء مجموعات لحفظ الأمن", why: "أنشأت الدولة مجموعات لحفظ الأمن (ص 68)." },
  ];

  async function handleDone(s: number, max: number) {
    setScore(s);
    await saveAnswer({ stationNumber: 6, activityKey: "s6-scenarios", answerType: "mcq", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(6, s, max, s >= 3 ? "completed" : "in_progress");
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#063d23] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور الرابع</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {axis.points.map((p, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border-r-4 border-[#063d23] bg-slate-50 p-4">
              <span className="text-2xl">{["⚖️", "👮‍♂️", "🏘️", "🌙"][i]}</span>
              <span><b className="text-sm text-[#063d23]">{p.term}</b><span className="block text-xs text-slate-500">{p.desc}</span></span>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.desertFort} alt="حصن تاريخي" className="h-48 w-full object-cover" />
          <p className="bg-[#063d23] px-3 py-1.5 text-center text-[11px] text-white/85">صورة تعليمية توضيحية: حصن تاريخي للحماية والأمن</p>
        </div>
      </Card>
      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧠 النشاط: اختر الإجراء الصحيح لحفظ الأمن</h3>
        <p className="mt-1 text-xs text-slate-500">اقرأ كل موقف واختر التصرف الصحيح كما تعلمته من الكتاب.</p>
        <div className="mt-4"><ChoiceQuiz questions={scenarios} onDone={handleDone} /></div>
        {score !== null && (
          <>
            <ScoreBar score={score} max={scenarios.length} />
            <Feedback ok={score >= 3} text={score >= 3 ? "ممتاز! أنت حارس أمن متميز! 🛡️🌟" : "راجع إجراءات الأمن الأربعة أعلاه وحاول مرة أخرى! 💪"} />
          </>
        )}
      </Card>
    </div>
  );
}

/* ================= المحطة 7: خدمة الحرمين ================= */
export function Station7() {
  const axis = AXES[4];
  const [score, setScore] = useState<number | null>(null);
  const questions = [
    { q: "في عهد أي إمام بدأت الصناعة الوطنية لكسوة الكعبة المشرفة؟", options: ["الإمام سعود بن عبدالعزيز", "الإمام عبدالله بن سعود", "الإمام تركي بن عبدالله"], correct: "الإمام سعود بن عبدالعزيز", why: "بدأت في عهد الإمام سعود بن عبدالعزيز الذي أمر بحياكتها في الأحساء (ص 69)." },
    { q: "أين أمر الإمام سعود بن عبدالعزيز بحياكة كسوة الكعبة؟", options: ["في الأحساء", "في مصر", "في الشام"], correct: "في الأحساء", why: "أمر بحياكتها في الأحساء — بداية الصناعة الوطنية للكسوة (ص 69)." },
    { q: "صواب أم خطأ: وفّرت الدولة السعودية الأمن والخدمات للحجاج.", options: ["صواب", "خطأ"], correct: "صواب", why: "صواب — توفير الأمن والخدمات للحجاج (ص 69)." },
    { q: "لماذا تُعد حياكة الكسوة في الأحساء «صناعة وطنية»؟", options: ["لأنها صُنعت داخل الدولة وبأيدي أبنائها", "لأنها استُوردت من الخارج", "لأنها صُنعت مرة واحدة فقط"], correct: "لأنها صُنعت داخل الدولة وبأيدي أبنائها", why: "الصناعة الوطنية تعني الإنتاج داخل الوطن — وهذا فخر حضاري (استنتاج من ص 69)." },
    { q: "صواب أم خطأ: خدمة الحرمين الشريفين من الجوانب الحضارية للدولتين السعوديتين.", options: ["صواب", "خطأ"], correct: "صواب", why: "صواب — وهو المحور الخامس في الدرس (ص 69)." },
  ];
  async function handleDone(s: number, max: number) {
    setScore(s);
    await saveAnswer({ stationNumber: 7, activityKey: "s7-quiz", answerType: "mcq", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(7, s, max, s >= 3 ? "completed" : "in_progress");
  }
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#a8864a] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور الخامس</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-gradient-to-br from-[#063d23] to-[#0b6e3f] p-5 text-white">
            <div className="text-3xl">🕋</div>
            <b className="mt-2 block">بدء الصناعة الوطنية لكسوة الكعبة المشرفة</b>
            <p className="mt-1 text-sm text-white/85">في عهد <b className="text-[#f2e4c4]">الإمام سعود بن عبدالعزيز</b> الذي أمر بحياكتها في <b className="text-[#f2e4c4]">الأحساء</b>.</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#c9a86a] to-[#a8864a] p-5 text-[#063d23]">
            <div className="text-3xl">🤲</div>
            <b className="mt-2 block">توفير الأمن والخدمات للحجاج</b>
            <p className="mt-1 text-sm">ليؤدوا مناسكهم بطمأنينة وأمان وراحة.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[IMAGES.kaabaDoor, IMAGES.kaabaCloth, IMAGES.kaabaGolden].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="الكسوة المشرفة" className="h-40 w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">صور تعليمية: الكعبة المشرفة وكسوتها المطرزة بالذهب</p>
      </Card>
      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">✅❌ النشاط: اختيار من متعدد وصواب أم خطأ</h3>
        <div className="mt-4"><ChoiceQuiz questions={questions} onDone={handleDone} /></div>
        {score !== null && (
          <>
            <ScoreBar score={score} max={questions.length} />
            <Feedback ok={score >= 4} text={score >= 4 ? "ما شاء الله! معلوماتك عن خدمة الحرمين ممتازة! 🕋🌟" : `نتيجتك ${score} من ${questions.length}. راجع البطاقات وحاول مجددًا.`} />
          </>
        )}
      </Card>
    </div>
  );
}

/* ================= المحطة 8: الجيش ================= */
export function Station8() {
  const axis = AXES[5];
  const [orderScore, setOrderScore] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const orderItems = [
    "1️⃣ النداء لإخبار جميع البلدات",
    "2️⃣ التجمع في مكان محدد للتحرك",
    "3️⃣ الراية الخضراء بشعار التوحيد تتقدم",
    "4️⃣ التحرك العسكري في مجموعات منتظمة",
  ];
  const tfQuestions = [
    { q: "أنشأت الدولة سجلات لأفراد الجيش والفرسان.", options: ["صواب", "خطأ"], correct: "صواب", why: "صواب — إنشاء سجلات لأفراد الجيش والفرسان (ص 69)." },
    { q: "كانت قيادة الجيش برئاسة إمام الدولة أو من يكلفه.", options: ["صواب", "خطأ"], correct: "صواب", why: "صواب — القيادة برئاسة إمام الدولة أو من يكلفه بذلك (ص 69)." },
    { q: "كان الهدف من تنظيم الجيش حملات توحيد الدولة والدفاع عنها.", options: ["صواب", "خطأ"], correct: "صواب", why: "صواب — من أجل المشاركة في حملات توحيد الدولة والدفاع عنها (ص 69)." },
  ];

  async function handleOrder(s: number, max: number) {
    setOrderScore(s);
    await saveAnswer({ stationNumber: 8, activityKey: "s8-order", answerType: "ordering", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(8, s + (quizScore || 0), max + tfQuestions.length, "in_progress");
  }
  async function handleQuiz(s: number, max: number) {
    setQuizScore(s);
    await saveAnswer({ stationNumber: 8, activityKey: "s8-tf", answerType: "true_false", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    const total = (orderScore || 0) + s;
    await markProgress(8, total, orderItems.length + max, total >= 5 ? "completed" : "in_progress");
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#063d23] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور السادس</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 space-y-2">
          {axis.points.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-[#e9dcc3]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#063d23] text-sm font-black text-white">{i + 1}</span>
              <span className="text-sm"><b className="text-[#063d23]">{p.term}</b> <span className="text-slate-600">— {p.desc}</span></span>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.horsemen} alt="الفرسان" className="h-48 w-full object-cover" />
          <p className="bg-[#063d23] px-3 py-1.5 text-center text-[11px] text-white/85">صورة تعليمية توضيحية: الفرسان والرايات في التراث العربي</p>
        </div>
      </Card>
      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🔢 النشاط الأول: رتّب خطوات التعبئة والتحرك العسكري</h3>
        <p className="mt-1 text-xs text-slate-500">اسحب البطاقات أو استخدم الأسهم لترتيبها من الأولى إلى الأخيرة كما وردت في الكتاب.</p>
        <div className="mt-4">
          <OrderGame items={orderItems} onResult={handleOrder} hint="💡 تذكّر: يبدأ كل شيء بالنداء لإخبار البلدات!" />
        </div>
        {orderScore !== null && (
          <>
            <ScoreBar score={orderScore} max={orderItems.length} />
            <Feedback ok={orderScore === orderItems.length} text={orderScore === orderItems.length ? "ترتيب مثالي! أنت قائد عسكري بارع! ⚔️🌟" : "راجع ترتيب الخطوات في البطاقات أعلاه وحاول مجددًا."} />
          </>
        )}
      </Card>
      <Card>
        <h3 className="font-black text-[#063d23]">✅ النشاط الثاني: حدد العبارة الصحيحة</h3>
        <div className="mt-4"><ChoiceQuiz questions={tfQuestions} onDone={handleQuiz} /></div>
        {quizScore !== null && <ScoreBar score={quizScore} max={tfQuestions.length} />}
      </Card>
    </div>
  );
}

/* ================= المحطة 9: العمران + الاختبار الختامي ================= */
export function Station9() {
  const axis = AXES[6];
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPicked, setQuizPicked] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [student, setStudent] = useState<StudentSession | null>(null);

  useEffect(() => { setStudent(getStudent()); }, []);

  const finalQs = FINAL_QUIZ_IDS.map((id) => QUESTION_BANK.find((q) => q.id === id)!).filter(Boolean);
  const cur = finalQs[quizIdx];

  async function handleMatch(s: number, max: number) {
    setMatchScore(s);
    await saveAnswer({ stationNumber: 9, activityKey: "s9-match", answerType: "matching", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(9, s, max, "in_progress");
  }

  function pick(o: string) {
    if (quizPicked) return;
    setQuizPicked(o);
    setQuizAnswers((a) => ({ ...a, [cur.id]: o }));
    if (o === cur.correct) setQuizScore((s) => s + cur.points);
  }
  async function nextQuiz() {
    if (quizIdx + 1 >= finalQs.length) {
      setQuizDone(true);
      const max = finalQs.reduce((s, q) => s + q.points, 0);
      const finalScore = quizScore;
      if (student) {
        try {
          await api("/api/quiz", { method: "POST", body: JSON.stringify({ studentId: student.id, score: finalScore, maxScore: max, answers: { ...quizAnswers, [cur.id]: quizPicked } }) });
          await markProgress(9, (matchScore || 0) + finalScore, 4 + max, finalScore / max >= 0.6 ? "completed" : "in_progress");
        } catch {}
      }
    } else {
      setQuizIdx(quizIdx + 1);
      setQuizPicked(null);
    }
  }

  const maxTotal = finalQs.reduce((s, q) => s + q.points, 0);
  const pct = maxTotal ? Math.round((quizScore / maxTotal) * 100) : 0;

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#0b6e3f] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور السابع</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {axis.points.map((p, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border border-[#e9dcc3] bg-[#faf7f0] p-4">
              <span className="text-2xl">{["🧱", "🏰", "🏠", "🚪"][i]}</span>
              <span><b className="text-sm text-[#063d23]">{p.term}</b><span className="block text-xs text-slate-500">{p.desc}</span></span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[IMAGES.fortGate, IMAGES.desertGate, IMAGES.mudHouse].map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="العمران التاريخي" className="h-36 w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">صور تعليمية توضيحية: البوابات والأسوار والبيوت الطينية التاريخية</p>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧲 النشاط: طابِق كل عنصر عمراني بوظيفته</h3>
        <div className="mt-4">
          <MatchGame
            pairs={[
              { term: "الأسوار وأبراج الحماية", desc: "حماية المدن والبلدات" },
              { term: "قصور الحكم (قصر سلوى)", desc: "إدارة الدولة والحكم" },
              { term: "دُور الضيافة", desc: "استقبال الزائرين" },
              { term: "البوابات ونظام الدخول", desc: "تنظيم الدخول إلى المدن والبلدات" },
            ]}
            onResult={handleMatch}
          />
        </div>
        {matchScore !== null && (
          <>
            <ScoreBar score={matchScore} max={4} />
            <Feedback ok={matchScore === 4} text={matchScore === 4 ? "ممتاز! أتقنت عناصر العمران! 🏰🌟" : "راجع وظائف العناصر العمرانية وحاول مجددًا."} />
          </>
        )}
      </Card>

      <Card className="border-2 border-[#0b6e3f]">
        <div className="rounded-2xl bg-gradient-to-l from-[#063d23] to-[#0b6e3f] p-5 text-center text-white">
          <div className="text-4xl">📝</div>
          <h3 className="mt-1 text-xl font-black">الاختبار الختامي الشامل</h3>
          <p className="mt-1 text-sm text-white/85">{finalQs.length} سؤالًا تغطي المحاور السبعة جميعها • النجاح من 60% • يُصحح تلقائيًا</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-[11px] font-bold">
            {["الإدارة والحكم", "التعليم", "الخدمات", "الأمن", "الحرمين", "الجيش", "العمران"].map((a) => (
              <span key={a} className="rounded-full bg-white/15 px-2.5 py-1">{a}</span>
            ))}
          </div>
        </div>

        {!quizStarted ? (
          <div className="p-5 text-center">
            {!student && <p className="mb-3 rounded-xl bg-amber-50 p-2 text-xs font-bold text-amber-700">⚠️ سجّل دخولك أولًا لحفظ نتيجتك والحصول على الشهادة.</p>}
            <p className="text-sm text-slate-600">أسئلة متنوعة: اختيار من متعدد وصواب أم خطأ، مع تغذية راجعة تشرح سبب كل إجابة.</p>
            <button onClick={() => setQuizStarted(true)} className="mt-4 rounded-full bg-[#0b6e3f] px-10 py-3 font-black text-white shadow hover:bg-[#095c35]">
              🚀 ابدأ الاختبار الآن
            </button>
          </div>
        ) : !quizDone ? (
          <div className="p-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>السؤال {quizIdx + 1} / {finalQs.length} • محور: {cur.axisLabel}</span>
              <span>النقاط: {quizScore}</span>
            </div>
            <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-gradient-to-l from-[#0b6e3f] to-[#c9a86a] transition-all" style={{ width: `${(quizIdx / finalQs.length) * 100}%` }} />
            </div>
            <div className="rounded-2xl bg-[#faf7f0] p-4">
              <span className="rounded-full bg-[#f4edde] px-2.5 py-0.5 text-[11px] font-black text-[#86683a]">{cur.difficulty} • {cur.points} {cur.points > 1 ? "درجات" : "درجة"}</span>
              <p className="mt-2 font-black text-[#063d23]">{cur.question}</p>
            </div>
            <div className="mt-3 grid gap-2">
              {(cur.options || []).map((o) => {
                const isRight = quizPicked && o === cur.correct;
                const isWrong = quizPicked === o && o !== cur.correct;
                return (
                  <button key={o} onClick={() => pick(o)} disabled={!!quizPicked}
                    className={`rounded-2xl border-2 p-3 text-right text-sm font-bold ${isRight ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : isWrong ? "border-red-400 bg-red-50 text-red-700" : "border-[#e9dcc3] bg-white hover:border-[#c9a86a]"}`}>
                    {o} {isRight ? " ✅" : ""} {isWrong ? " ❌" : ""}
                  </button>
                );
              })}
            </div>
            {quizPicked && (
              <div className={`animate-pop mt-3 rounded-2xl border-2 p-3 text-sm ${quizPicked === cur.correct ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : "border-[#c9a86a] bg-[#faf3e3] text-[#86683a]"}`}>
                {quizPicked === cur.correct ? "✅ أحسنت! " : "💡 "}{cur.explanation}
                <button onClick={nextQuiz} className="mt-3 block w-full rounded-xl bg-[#063d23] py-2.5 font-black text-white">
                  {quizIdx + 1 >= finalQs.length ? "🏁 إنهاء الاختبار وعرض النتيجة" : "السؤال التالي ←"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-5xl">{pct >= 90 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</div>
            <h4 className="mt-2 text-xl font-black text-[#063d23]">نتيجتك: {quizScore} / {maxTotal} ({pct}%)</h4>
            <p className="mt-1 text-sm text-slate-600">
              {pct >= 90 ? "مذهل! أنت من نخبة المؤرخين الصغار! 🌟" : pct >= 60 ? "مبارك! اجتزت الاختبار بنجاح. أكمل رحلتك للحصول على الشهادة! 🎓" : "لم تحقق درجة النجاح (60%) بعد. راجع المحطات وأعد المحاولة — أنت قادر! 💪"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={() => { setQuizIdx(0); setQuizScore(0); setQuizDone(false); setQuizPicked(null); setQuizAnswers({}); }} className="rounded-full border-2 border-[#0b6e3f] px-6 py-2 text-sm font-black text-[#095c35]">
                🔄 إعادة الاختبار
              </button>
              {pct >= 60 && (
                <Link href="/stations/10" className="rounded-full bg-[#c9a86a] px-6 py-2 text-sm font-black text-[#063d23]">🎓 انتقل للحصاد والشهادة ←</Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================= المحطة 10: الحصاد والشهادة ================= */
export function Station10() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [completed, setCompleted] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [reflect, setReflect] = useState("");
  const [audio, setAudio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getStudent();
    setStudent(s);
    if (s) {
      api(`/api/progress?studentId=${s.id}`).then((d) => {
        setCompleted((d.progress || []).filter((p: { status: string }) => p.status === "completed").length);
      }).catch(() => {});
      api(`/api/quiz?studentId=${s.id}`).then((d) => {
        const at = d.attempts || [];
        if (at.length) setBest(Math.max(...at.map((a: { percentage: number }) => a.percentage)));
      }).catch(() => {});
    }
  }, []);

  async function saveReflect() {
    if (!reflect.trim() && !audio) return;
    await saveAnswer({ stationNumber: 10, activityKey: "s10-reflect", answerType: "text+audio", answerText: reflect, audioData: audio || undefined, maxScore: 2, score: 2, status: "completed" });
    await markProgress(10, 2, 2, "completed");
    setSaved(true);
    setCompleted((c) => Math.max(c, 10));
  }

  const eligible = completed >= 7 && (best || 0) >= 60;
  const pct = Math.round((completed / 10) * 100);

  return (
    <div className="space-y-5">
      <Card className="border-2 border-[#c9a86a]">
        <h3 className="text-center font-black text-[#063d23]">🗺️ خريطة المفاهيم: حصاد الرحلة</h3>
        <p className="mt-1 text-center text-xs text-slate-500">ملخص بصري للمحاور السبعة — الجوانب الحضارية للدولتين السعوديتين الأولى والثانية</p>
        <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#063d23] via-[#0b6e3f] to-[#063d23] p-5 text-white">
          <div className="mx-auto max-w-md rounded-2xl bg-[#c9a86a] p-3 text-center font-black text-[#063d23]">
            🕌 الجوانب الحضارية للدولتين السعوديتين
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {AXES.map((a) => (
              <div key={a.key} className="rounded-2xl bg-white/10 p-3 text-center backdrop-blur">
                <div className="text-2xl">{a.icon}</div>
                <div className="mt-1 text-xs font-black">{a.title}</div>
                <div className="mt-1 space-y-0.5">
                  {a.points.slice(0, 2).map((p, i) => (
                    <div key={i} className="rounded-lg bg-white/10 px-1.5 py-0.5 text-[10px] text-white/90">{p.term}</div>
                  ))}
                  <div className="text-[10px] text-[#f2e4c4]">+{a.points.length - 2} أخرى</div>
                </div>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl bg-[#c9a86a]/20 p-3 text-center ring-1 ring-[#c9a86a] md:col-span-3">
              <div className="text-xs font-black text-[#f2e4c4]">💎 القاعدة الذهبية من مقدمة الدرس</div>
              <div className="mt-1 text-xs leading-relaxed text-white/90">«تأسيس أي دولة قوية نابع من إرثها الحضاري وقوتها في أنظمتها السياسية والاقتصادية والاجتماعية والدينية»</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">💭 سؤال تأملي</h3>
        <p className="mt-1 font-black text-[#86683a]">«أي جانب حضاري من الدولتين السعوديتين الأولى والثانية أعجبك أكثر؟ ولماذا؟»</p>
        <textarea value={reflect} onChange={(e) => setReflect(e.target.value)} rows={4}
          placeholder="مثال: أعجبني جانب التعليم أكثر، لأن الأئمة شاركوا في المجالس العلمية ورعوا العلماء..."
          className="mt-3 w-full rounded-2xl border-2 border-[#e9dcc3] p-3 text-sm leading-relaxed outline-none focus:border-[#0b6e3f]" />
        <div className="mt-3"><AudioRecorder onSave={setAudio} /></div>
        <button onClick={saveReflect} disabled={!reflect.trim() && !audio} className="mt-3 w-full rounded-2xl bg-[#0b6e3f] py-2.5 text-sm font-black text-white shadow disabled:opacity-40">
          💾 حفظ تأملي وإتمام الرحلة
        </button>
        <Feedback ok={saved ? true : null} text={saved ? "رائع! تم حفظ تأملك وإتمام رحلتك التعليمية! 🎉" : ""} />
      </Card>

      <Card>
        <h3 className="font-black text-[#063d23]">📊 نتيجتك النهائية</h3>
        {!student ? (
          <p className="mt-2 text-sm text-slate-500">سجّل دخولك لعرض نتيجتك وشهادتك. <Link href="/#register" className="font-black text-[#0b6e3f] underline">تسجيل الدخول</Link></p>
        ) : (
          <div className="mt-3">
            <div className="grid gap-3 text-center md:grid-cols-3">
              <div className="rounded-2xl bg-[#eef7f1] p-4">
                <div className="text-2xl font-black text-[#0b6e3f]">{completed}/10</div>
                <div className="text-xs text-slate-500">المحطات المكتملة</div>
              </div>
              <div className="rounded-2xl bg-[#faf3e3] p-4">
                <div className="text-2xl font-black text-[#86683a]">{best !== null ? `${best}%` : "—"}</div>
                <div className="text-xs text-slate-500">أفضل نتيجة اختبار</div>
              </div>
              <div className="rounded-2xl bg-[#f4edde] p-4">
                <div className="text-2xl font-black text-[#063d23]">{pct}%</div>
                <div className="text-xs text-slate-500">نسبة الإنجاز</div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl p-4 text-center text-sm font-bold" style={{ background: eligible ? "#eef7f1" : "#fef3c7", color: eligible ? "#095c35" : "#92400e" }}>
              {eligible
                ? "🎉 مبارك! حققت شروط الشهادة (إتمام 7 محطات على الأقل + اجتياز الاختبار بـ 60%+). شهادتك جاهزة!"
                : `📌 شروط الشهادة: إتمام 7 محطات على الأقل (أتممت ${completed}) + اجتياز الاختبار بنسبة 60%+ ${best !== null ? `(نتيجتك ${best}%)` : "(لم تختبر بعد)"}.`}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link href="/learn" className="rounded-full border-2 border-[#0b6e3f] px-6 py-2 text-sm font-black text-[#095c35]">🗺️ مراجعة المحطات</Link>
              {eligible && (
                <Link href="/certificate" className="shimmer rounded-full px-8 py-2 text-sm font-black text-[#063d23]">🎓 عرض شهادتي وطباعتها</Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
