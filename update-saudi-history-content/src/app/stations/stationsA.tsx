"use client";
import { useEffect, useState } from "react";
import { Card, AudioRecorder, Feedback, ScoreBar } from "@/components/ui";
import { MatchGame, ClassifyGame } from "@/components/games";
import { AXES, LESSON_INTRO, LESSON_QUESTION, IMAGES, SUBALAT_MUDI } from "@/lib/content";
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

/* ================= المحطة 1 ================= */
export function Station1() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [text, setText] = useState("");
  const [audio, setAudio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { setStudent(getStudent()); }, []);

  async function save() {
    if (!text.trim() && !audio) return;
    await saveAnswer({ stationNumber: 1, activityKey: "s1-brainstorm", answerType: audio && text ? "text+audio" : audio ? "audio" : "text", answerText: text, audioData: audio || undefined, maxScore: 2, score: text.trim() && audio ? 2 : 1, status: "completed" });
    await markProgress(1, text.trim() && audio ? 2 : 1, 2);
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <Card className="border-2 border-[#c9a86a]">
        <div className="rounded-2xl bg-gradient-to-br from-[#0b6e3f] to-[#063d23] p-6 text-center text-white">
          <div className="text-4xl">💡</div>
          <h3 className="font-amiri mt-2 text-xl leading-relaxed md:text-2xl">«{LESSON_INTRO}»</h3>
          <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-[#c9a86a] p-4 font-black text-[#063d23]">
            {LESSON_QUESTION}
          </div>
          <p className="mt-3 text-xs text-white/70">📖 مقدمة الدرس كما وردت في الكتاب — صفحة 67</p>
        </div>
      </Card>

      <Card>
        <h3 className="font-black text-[#063d23]">🗺️ خريطة رحلتنا: سبعة جوانب حضارية</h3>
        <p className="mt-1 text-xs text-slate-500">ستكتشف في هذه الرحلة كيف بنت الدولتان السعوديتان حضارة عظيمة في سبعة جوانب:</p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {AXES.map((a) => (
            <div key={a.key} className="rounded-2xl border border-[#e9dcc3] bg-[#faf7f0] p-3 text-center">
              <div className="text-2xl">{a.icon}</div>
              <div className="mt-1 text-xs font-black text-[#063d23]">{a.number}. {a.title}</div>
              <div className="text-[10px] text-slate-500">{a.page}</div>
            </div>
          ))}
          <div className="rounded-2xl bg-[#063d23] p-3 text-center text-white">
            <div className="text-2xl">🎓</div>
            <div className="mt-1 text-xs font-black">+ الشهادة</div>
            <div className="text-[10px] text-white/70">في نهاية الرحلة</div>
          </div>
        </div>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧠 نشاط العصف الذهني: ماذا تتوقع؟</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          قبل أن نبدأ الرحلة.. <b>اكتب توقعاتك</b>: ما الجوانب الحضارية التي تتوقع أن تجدها في الدولتين السعوديتين؟
          يمكنك أيضًا <b>تسجيل توقعاتك صوتيًا</b> 🎙️
        </p>
        {!student && <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs font-bold text-amber-700">⚠️ سجّل دخولك من الصفحة الرئيسية لحفظ إجابتك.</p>}
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="مثال: أتوقع أن أتعلم عن نظام الحكم، والتعليم، والجيش، وكيف خدموا الحجاج..."
          className="mt-3 w-full rounded-2xl border-2 border-[#e9dcc3] p-3 text-sm leading-relaxed outline-none focus:border-[#0b6e3f]"
        />
        <div className="mt-3">
          <AudioRecorder onSave={setAudio} />
        </div>
        <button onClick={save} disabled={!text.trim() && !audio} className="mt-4 w-full rounded-2xl bg-[#0b6e3f] py-3 font-black text-white shadow disabled:opacity-40">
          🚀 احفظ توقعاتي وابدأ الرحلة
        </button>
        <Feedback ok={saved ? true : null} text={saved ? "رائع! تم حفظ توقعاتك. هيا نبدأ رحلة الاكتشاف في المحطة الثانية! 🎉" : ""} />
      </Card>
    </div>
  );
}

/* ================= المحطة 2: الإدارة والحكم ================= */
export function Station2() {
  const axis = AXES[0];
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function handleResult(s: number, max: number) {
    setScore(s);
    setDone(true);
    await saveAnswer({ stationNumber: 2, activityKey: "s2-match", answerType: "matching", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(2, s, max, s === max ? "completed" : "in_progress");
    if (s === max) await markProgress(2, s, max, "completed");
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#0b6e3f] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور الأول</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {axis.points.map((p, i) => (
            <div key={i} className="flex gap-3 rounded-2xl border-r-4 border-[#0b6e3f] bg-[#eef7f1] p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b6e3f] font-black text-white">{i + 1}</span>
              <span>
                <b className="text-[#063d23]">{p.term}</b>
                <span className="block text-sm text-slate-600">{p.desc}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.adobeRiyadh} alt="العمارة الطينية في نجد" className="h-48 w-full object-cover" />
          <p className="bg-[#063d23] px-3 py-1.5 text-center text-[11px] text-white/85">صورة تعليمية توضيحية: العمارة الطينية التقليدية في نجد</p>
        </div>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧲 النشاط التفاعلي: طابِق كل مفهوم مع وظيفته</h3>
        <p className="mt-1 text-xs text-slate-500">مثال: بيت المال ← موارد الدولة ومصروفاتها • البيعة ← جزء أساسي من نظام الحكم</p>
        <div className="mt-4">
          <MatchGame pairs={axis.points} onResult={handleResult} />
        </div>
        {done && (
          <>
            <ScoreBar score={score} max={axis.points.length} />
            <Feedback ok={score === axis.points.length} text={score === axis.points.length ? "ممتاز! طابقت جميع المفاهيم بشكل صحيح. أحسنت يا بطل! 🌟" : `أصبت ${score} من ${axis.points.length}. راجع البطاقات أعلاه وحاول مرة أخرى! 💪`} />
          </>
        )}
      </Card>
    </div>
  );
}

/* ================= المحطة 3: التعليم ================= */
export function Station3() {
  const axis = AXES[1];
  const [score, setScore] = useState(0);
  const [doneSort, setDoneSort] = useState(false);
  const [answer, setAnswer] = useState("");
  const [audio, setAudio] = useState("");
  const [savedActivity, setSavedActivity] = useState(false);

  async function handleClassify(s: number, max: number) {
    setScore(s); setDoneSort(true);
    await saveAnswer({ stationNumber: 3, activityKey: "s3-classify", answerType: "classification", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(3, s, max, "in_progress");
  }
  async function saveBookActivity() {
    if (!answer.trim() && !audio) return;
    await saveAnswer({ stationNumber: 3, activityKey: "s3-book-activity-1", answerType: "text+audio", answerText: answer, audioData: audio || undefined, maxScore: 5, score: 0, status: "needs_review" });
    await markProgress(3, score, 4 + 5, "completed");
    setSavedActivity(true);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#86683a] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور الثاني</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {axis.points.map((p, i) => (
            <div key={i} className="rounded-2xl border border-[#e9dcc3] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">{["👨‍🏫", "🏛️", "🌟", "📝"][i]}</span>
                <b className="text-sm text-[#063d23]">{p.term}</b>
              </div>
              <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {( [IMAGES.manuscripts, IMAGES.islamicLibrary] as string[]).map((src, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="المخطوطات والمكتبات" className="h-40 w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500">صور تعليمية توضيحية: المخطوطات العربية والمكتبات الإسلامية</p>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧺 النشاط الأول: صنّف البطاقات التعليمية</h3>
        <p className="mt-1 text-xs text-slate-500">صنّف كل بطاقة: هل هي من مظاهر التعليم في الدولة السعودية أم لا؟</p>
        <div className="mt-4">
          <ClassifyGame
            categories={[
              { name: "من مظاهر التعليم ✅", icon: "📚", items: ["عقد المجالس العلمية بمشاركة الأئمة", "إنشاء دُور العلم والمكتبات", "رعاية العلماء وتشجيعهم", "التوسع في التأليف ونسخ الكتب"] },
              { name: "ليس من المظاهر ❌", icon: "🚫", items: ["إغلاق المكتبات", "منع التأليف ونسخ الكتب"] },
            ]}
            onResult={handleClassify}
          />
        </div>
        {doneSort && (
          <>
            <ScoreBar score={score} max={6} />
            <Feedback ok={score === 6} text={score === 6 ? "رائع! صنّفت جميع البطاقات بشكل صحيح! 🌟" : `أصبت ${score} من 6. تذكّر مظاهر التعليم الأربعة من الكتاب وحاول مجددًا.`} />
          </>
        )}
      </Card>

      <Card className="border-2 border-red-200 bg-red-50/30">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">📝 نشاط الكتاب الأول — ص 67</span>
        </div>
        <h3 className="mt-2 text-lg font-black text-[#063d23]">لماذا اعتنت الدولة السعودية بالتعليم؟</h3>
        <p className="mt-1 text-xs text-slate-500">أجب كتابةً أو صوتيًا. سيراجع المعلم إجابتك ويقيّمها (5 درجات).</p>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4}
          placeholder="اكتب تفسيرك هنا... فكّر: ما فائدة العلم للدولة والمجتمع؟"
          className="mt-3 w-full rounded-2xl border-2 border-[#e9dcc3] bg-white p-3 text-sm leading-relaxed outline-none focus:border-[#0b6e3f]" />
        <div className="mt-3"><AudioRecorder onSave={setAudio} /></div>
        <button onClick={saveBookActivity} disabled={!answer.trim() && !audio} className="mt-3 w-full rounded-2xl bg-red-700 py-2.5 text-sm font-black text-white shadow disabled:opacity-40">
          📩 إرسال إجابتي للمعلم
        </button>
        <Feedback ok={savedActivity ? true : null} text={savedActivity ? "تم إرسال إجابتك! سيطّلع عليها المعلم ويقيّمها قريبًا. 👩‍🏫" : ""} />
      </Card>
    </div>
  );
}

/* ================= المحطة 4: الخدمات الاجتماعية ================= */
export function Station4() {
  const axis = AXES[2];
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function handleResult(s: number, max: number) {
    setScore(s); setDone(true);
    await saveAnswer({ stationNumber: 4, activityKey: "s4-classify", answerType: "classification", answerJson: { score: s, max }, score: s, maxScore: max, status: "completed" });
    await markProgress(4, s, max, s === max ? "completed" : "in_progress");
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-[#1e8a55] px-3 py-1 text-white">📖 {axis.page}</span>
          <span className="rounded-full bg-[#f4edde] px-3 py-1 text-[#86683a]">المحور الثالث</span>
        </div>
        <h3 className="mt-3 font-black text-[#063d23]">{axis.icon} {axis.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{axis.subtitle}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {axis.points.map((p, i) => (
            <div key={i} className="rounded-2xl bg-gradient-to-b from-[#eef7f1] to-white p-4 text-center shadow-sm ring-1 ring-[#d7ecdd]">
              <div className="text-3xl">{["🏠", "🎁", "💍"][i]}</div>
              <b className="mt-2 block text-sm text-[#063d23]">{p.term}</b>
              <span className="text-xs text-slate-500">{p.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-2 border-[#c9a86a] bg-[#faf3e3]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#86683a] px-3 py-1 text-xs font-black text-white">🔍 بطاقة للاطلاع — ص 68</span>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-amiri text-xl font-bold text-[#063d23]">🕌 {SUBALAT_MUDI.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{SUBALAT_MUDI.text}</p>
          </div>
          <ul className="space-y-1.5">
            {SUBALAT_MUDI.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-white p-2.5 text-xs shadow-sm">
                <span className="text-[#c9a86a]">◆</span><span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.mosqueInterior} alt="عمارة إسلامية" className="h-44 w-full object-cover" />
          <p className="bg-[#063d23] px-3 py-1.5 text-center text-[11px] text-white/85">صورة تعليمية توضيحية: عمارة إسلامية تاريخية (وليست صورة أرشيفية لسبالة موضي)</p>
        </div>
      </Card>

      <Card className="gold-frame">
        <h3 className="font-black text-[#063d23]">🧺 النشاط: صنّف الخدمات بحسب المستفيد منها</h3>
        <div className="mt-4">
          <ClassifyGame
            categories={[
              { name: "المحتاجون", icon: "🏠", items: ["إنشاء الأوقاف", "إنشاء الأسبلة"] },
              { name: "الأسر وطلبة العلم", icon: "🎁", items: ["إعانات الأسر", "إعانات طلبة العلم"] },
              { name: "الشباب", icon: "💍", items: ["إعانة الشباب على الزواج"] },
            ]}
            onResult={handleResult}
          />
        </div>
        {done && (
          <>
            <ScoreBar score={score} max={5} />
            <Feedback ok={score === 5} text={score === 5 ? "ممتاز! عرفت مستفيد كل خدمة اجتماعية! 🤝🌟" : `أصبت ${score} من 5. تذكّر: الأوقاف والأسبلة للمحتاجين، والإعانات للأسر وطلبة العلم، وإعانة الزواج للشباب.`} />
          </>
        )}
      </Card>
    </div>
  );
}

/* ================= المحطة 5: نشاط سبالة موضي ================= */
const MUDI_LIBRARY = [
  { src: IMAGES.taifArches, label: "أقواس حجرية تاريخية", note: "توضيحية" },
  { src: IMAGES.ahsaRuins, label: "آثار وأقواس قديمة", note: "توضيحية" },
  { src: IMAGES.mosqueInterior, label: "أعمدة وأروقة", note: "توضيحية" },
  { src: IMAGES.adobeRiyadh, label: "برج طيني نجدي", note: "توضيحية" },
  { src: IMAGES.mudHouse, label: "بيت طيني قديم", note: "توضيحية" },
  { src: IMAGES.fortGate, label: "بوابة وسور تاريخي", note: "توضيحية" },
];

export function Station5() {
  const [selected, setSelected] = useState<number[]>([]);
  const [zoom, setZoom] = useState<number | null>(null);
  const [descs, setDescs] = useState<Record<number, string>>({});
  const [audios, setAudios] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState(false);

  function toggle(i: number) {
    setSelected((s) => {
      if (s.includes(i)) return s.filter((x) => x !== i);
      if (s.length >= 3) return s;
      return [...s, i];
    });
  }
  async function save() {
    if (selected.length !== 3) return;
    const payload = selected.map((imgIdx, order) => ({
      image: MUDI_LIBRARY[imgIdx].label,
      desc: descs[imgIdx] || "",
      hasAudio: !!audios[imgIdx],
      order: order + 1,
    }));
    const audioCombined = selected.map((i) => audios[i] || "").filter(Boolean);
    await saveAnswer({
      stationNumber: 5, activityKey: "s5-mudi-descriptions", answerType: "image_desc",
      answerText: payload.map((p) => `الصورة ${p.order} (${p.image}): ${p.desc}`).join("\n"),
      audioData: audioCombined[0] || undefined,
      answerJson: { descriptions: payload, audioCount: audioCombined.length },
      maxScore: 9, score: 0, status: "needs_review",
    });
    await markProgress(5, 0, 9, "completed");
    setSaved(true);
  }

  return (
    <div className="space-y-5">
      <Card className="border-2 border-red-200">
        <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">📝 نشاط الكتاب الثاني — ص 68</span>
        <h3 className="mt-2 font-black text-[#063d23]">🕌 نشاط سبالة موضي</h3>
        <div className="mt-2 rounded-2xl bg-red-50 p-4 text-sm leading-relaxed text-slate-700">
          <b>تعليمات النشاط الأصلي:</b> «بالرجوع إلى مصادر التعلم يختار الطلبة ثلاث صور لآثار مبنى سبالة موضي ويكتبون وصفًا موجزًا لها.»
        </div>
        <div className="mt-2 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          ⚠️ <b>تنبيه أمانة علمية:</b> الصور أدناه <b>صور تعليمية توضيحية للعمارة الطينية والتاريخية</b> وليست صورًا أرشيفية موثقة لمبنى سبالة موضي نفسه.
          اختر 3 صور وتدرّب على وصف الآثار بأسلوبك، وارجع مع معلمك إلى مصادر التعلم الموثوقة لرؤية آثار الموقع الحقيقية في حي الطريف بالدرعية.
        </div>
      </Card>

      <Card>
        <h3 className="font-black text-[#063d23]">🖼️ مكتبة الصور المعتمدة <span className="text-xs font-bold text-slate-500">(اختر 3 صور — اخترت {selected.length}/3)</span></h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {MUDI_LIBRARY.map((img, i) => {
            const isSel = selected.includes(i);
            const order = selected.indexOf(i) + 1;
            return (
              <div key={i} className={`relative overflow-hidden rounded-2xl border-3 shadow ${isSel ? "border-[#0b6e3f] ring-4 ring-[#0b6e3f]/30" : "border-transparent"}`} style={{ borderWidth: 3 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.label} className="h-36 w-full cursor-zoom-in object-cover" onClick={() => setZoom(i)} />
                <div className="flex items-center justify-between bg-white px-2 py-1.5">
                  <span className="text-[11px] font-bold text-slate-600">{img.label} <span className="text-amber-600">({img.note})</span></span>
                  <button onClick={() => toggle(i)} className={`rounded-full px-3 py-1 text-[11px] font-black ${isSel ? "bg-red-100 text-red-700" : "bg-[#0b6e3f] text-white"}`}>
                    {isSel ? `✓ صورة ${order} — إلغاء` : "اختيار"}
                  </button>
                </div>
                <button onClick={() => setZoom(i)} className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">🔍 تكبير</button>
              </div>
            );
          })}
        </div>
      </Card>

      {selected.length > 0 && (
        <Card className="gold-frame">
          <h3 className="font-black text-[#063d23]">✍️ اكتب وصفًا موجزًا أسفل كل صورة (مع إمكانية الوصف الصوتي)</h3>
          <div className="mt-3 space-y-5">
            {selected.map((imgIdx, order) => (
              <div key={imgIdx} className="rounded-2xl border border-[#e9dcc3] bg-[#faf7f0] p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={MUDI_LIBRARY[imgIdx].src} alt="" className="h-20 w-28 cursor-zoom-in rounded-xl object-cover" onClick={() => setZoom(imgIdx)} />
                  <div>
                    <div className="font-black text-[#063d23]">الصورة {order + 1}: {MUDI_LIBRARY[imgIdx].label}</div>
                    <div className="text-[11px] text-slate-500">اضغط على الصورة للتكبير 🔍</div>
                  </div>
                </div>
                <textarea
                  value={descs[imgIdx] || ""}
                  onChange={(e) => setDescs((d) => ({ ...d, [imgIdx]: e.target.value }))}
                  rows={3}
                  placeholder={`صِف الصورة ${order + 1} وصفًا موجزًا: ما الذي تشاهده؟ (الأقواس، الأعمدة، الطين، الأحجار...) وما الذي يدل على عراقة المكان؟`}
                  className="mt-3 w-full rounded-2xl border-2 border-[#e9dcc3] bg-white p-3 text-sm outline-none focus:border-[#0b6e3f]"
                />
                <div className="mt-2">
                  <p className="mb-1 text-xs font-bold text-slate-500">🎙️ أو سجّل وصفك صوتيًا:</p>
                  <AudioRecorder onSave={(u) => setAudios((a) => ({ ...a, [imgIdx]: u }))} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={save}
            disabled={selected.length !== 3 || !selected.every((i) => (descs[i]?.trim() || audios[i]))}
            className="mt-4 w-full rounded-2xl bg-[#0b6e3f] py-3 font-black text-white shadow disabled:opacity-40"
          >
            📩 إرسال أوصافي الثلاثة للمعلم
          </button>
          <p className="mt-1 text-center text-[11px] text-slate-500">يشترط اختيار 3 صور وكتابة أو تسجيل وصف لكل صورة.</p>
          <Feedback ok={saved ? true : null} text={saved ? "تم حفظ أوصافك وإرسالها للمعلم للمراجعة! أحسنت يا مؤرخ صغير! 🏛️" : ""} />
        </Card>
      )}

      {zoom !== null && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4" onClick={() => setZoom(null)}>
          <div className="max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MUDI_LIBRARY[zoom].src} alt={MUDI_LIBRARY[zoom].label} className="max-h-[70vh] w-full object-contain" />
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-black">{MUDI_LIBRARY[zoom].label} <span className="text-xs text-amber-600">(صورة توضيحية)</span></span>
              <button onClick={() => setZoom(null)} className="rounded-full bg-[#063d23] px-5 py-2 text-sm font-black text-white">✕ إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
