"use client";
import React, { useMemo, useState } from "react";

/* ---------- أداة خلط ---------- */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- لعبة المطابقة: اسحب المصطلح إلى وظيفته ---------- */
export function MatchGame({
  pairs, onResult,
}: {
  pairs: { term: string; desc: string }[];
  onResult: (score: number, max: number, correct: boolean) => void;
}) {
  const [targets] = useState(() => shuffle(pairs.map((p) => p.desc)));
  const [terms] = useState(() => shuffle(pairs.map((p) => p.term)));
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [dragTerm, setDragTerm] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const usedTerms = useMemo(() => new Set(Object.values(placed)), [placed]);
  const freeTerms = terms.filter((t) => !usedTerms.has(t));

  function place(term: string, desc: string) {
    if (checked) return;
    setPlaced((p) => {
      const np = { ...p };
      // remove term from any previous slot
      for (const k of Object.keys(np)) if (np[k] === term) delete np[k];
      np[desc] = term;
      return np;
    });
    setSelected(null);
  }
  function unplace(desc: string) {
    if (checked) return;
    setPlaced((p) => { const np = { ...p }; delete np[desc]; return np; });
  }
  function correctTermFor(desc: string) {
    return pairs.find((p) => p.desc === desc)?.term;
  }
  function check() {
    setChecked(true);
    let s = 0;
    for (const p of pairs) if (placed[p.desc] === p.term) s++;
    onResult(s, pairs.length, s === pairs.length);
  }
  function reset() {
    setPlaced({}); setChecked(false); setSelected(null);
  }

  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-500">🧲 اسحب كل مصطلح وأفلته في خانة وظيفته الصحيحة (أو اضغط على المصطلح ثم على الخانة).</p>
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-[#f4edde] p-3">
        {freeTerms.length === 0 && <span className="text-xs text-slate-500">تم وضع جميع المصطلحات ✅</span>}
        {freeTerms.map((t) => (
          <span
            key={t}
            draggable={!checked}
            onDragStart={(e) => { setDragTerm(t); e.dataTransfer.setData("text/plain", t); }}
            onDragEnd={() => setDragTerm(null)}
            onClick={() => !checked && setSelected(selected === t ? null : t)}
            className={`drag-item rounded-full border-2 px-4 py-2 text-sm font-black shadow-sm ${selected === t ? "border-[#0b6e3f] bg-[#0b6e3f] text-white" : "border-[#c9a86a] bg-white text-[#063d23]"} ${dragTerm === t ? "dragging" : ""}`}
          >{t}</span>
        ))}
      </div>
      <div className="space-y-2">
        {targets.map((d) => {
          const v = placed[d];
          const isOk = checked && v === correctTermFor(d);
          const isBad = checked && v && v !== correctTermFor(d);
          return (
            <div
              key={d}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                const t = e.dataTransfer.getData("text/plain") || dragTerm;
                if (t) place(t, d);
              }}
              onClick={() => { if (selected) place(selected, d); }}
              className={`drop-zone flex items-center gap-3 rounded-2xl border-2 border-dashed p-3 ${v ? "border-solid" : "border-[#e9dcc3] bg-[#faf7f0]"} ${isOk ? "filled-correct" : ""} ${isBad ? "filled-wrong" : ""}`}
            >
              <span className={`grid min-h-[2.5rem] min-w-[10rem] flex-1 place-items-center rounded-xl px-3 py-1.5 text-sm font-black ${v ? "bg-white shadow" : "text-slate-400"}`}>
                {v ? (
                  <span className="flex items-center gap-2">
                    {v}
                    {!checked && <button onClick={(e) => { e.stopPropagation(); unplace(d); }} className="text-red-500">✕</button>}
                    {checked && (isOk ? " ✅" : " ❌")}
                  </span>
                ) : "← أفلت المصطلح هنا"}
              </span>
              <span className="text-slate-400">⟵</span>
              <span className="flex-[1.4] text-sm leading-relaxed text-slate-700">{d}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        {!checked ? (
          <button onClick={check} disabled={Object.keys(placed).length < pairs.length} className="flex-1 rounded-2xl bg-[#0b6e3f] py-2.5 text-sm font-black text-white shadow disabled:opacity-40">
            ✅ تحقق من المطابقة
          </button>
        ) : (
          <button onClick={reset} className="flex-1 rounded-2xl bg-[#c9a86a] py-2.5 text-sm font-black text-[#063d23] shadow">🔄 حاول مرة أخرى</button>
        )}
      </div>
    </div>
  );
}

/* ---------- لعبة التصنيف: اسحب البطاقة إلى السلة الصحيحة ---------- */
export function ClassifyGame({
  categories, onResult,
}: {
  categories: { name: string; icon: string; items: string[] }[];
  onResult: (score: number, max: number, correct: boolean) => void;
}) {
  const allItems = useMemo(() => shuffle(categories.flatMap((c) => c.items.map((i) => ({ item: i, cat: c.name })))), [categories]);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const total = allItems.length;

  const free = allItems.filter((x) => !placed[x.item]);

  function place(item: string, cat: string) {
    if (checked) return;
    setPlaced((p) => ({ ...p, [item]: cat }));
    setSelected(null);
  }
  function check() {
    setChecked(true);
    let s = 0;
    for (const x of allItems) if (placed[x.item] === x.cat) s++;
    onResult(s, total, s === total);
  }

  return (
    <div>
      <p className="mb-3 text-xs font-bold text-slate-500">🧺 اسحب كل بطاقة إلى السلة الصحيحة (أو اضغط على البطاقة ثم على السلة).</p>
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl bg-[#f4edde] p-3">
        {free.length === 0 && <span className="text-xs text-slate-500">تم تصنيف جميع البطاقات ✅</span>}
        {free.map((x) => (
          <span
            key={x.item}
            draggable={!checked}
            onDragStart={(e) => e.dataTransfer.setData("text/plain", x.item)}
            onClick={() => !checked && setSelected(selected === x.item ? null : x.item)}
            className={`drag-item rounded-xl border-2 px-3 py-2 text-xs font-black shadow-sm ${selected === x.item ? "border-[#0b6e3f] bg-[#0b6e3f] text-white" : "border-[#c9a86a] bg-white text-[#063d23]"}`}
          >{x.item}</span>
        ))}
      </div>
      <div className={`grid gap-3 ${categories.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {categories.map((c) => {
          const mine = allItems.filter((x) => placed[x.item] === c.name);
          return (
            <div
              key={c.name}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("drag-over");
                const t = e.dataTransfer.getData("text/plain");
                if (t) place(t, c.name);
              }}
              onClick={() => { if (selected) place(selected, c.name); }}
              className="drop-zone min-h-[10rem] rounded-2xl border-2 border-dashed border-[#c9a86a] bg-[#faf3e3] p-3"
            >
              <div className="text-center text-sm font-black text-[#063d23]">{c.icon} {c.name}</div>
              <div className="mt-2 space-y-1.5">
                {mine.map((x) => {
                  const ok = checked && x.cat === c.name;
                  const bad = checked && x.cat !== c.name;
                  return (
                    <div key={x.item} className={`flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-xs font-bold shadow-sm ${ok ? "ring-2 ring-[#0b6e3f]" : ""} ${bad ? "ring-2 ring-red-400" : ""}`}>
                      <span>{x.item} {checked && (ok ? "✅" : "❌")}</span>
                      {!checked && <button onClick={(e) => { e.stopPropagation(); setPlaced((p) => { const np = { ...p }; delete np[x.item]; return np; }); }} className="text-red-500">✕</button>}
                    </div>
                  );
                })}
                {mine.length === 0 && <div className="py-6 text-center text-xs text-slate-400">أفلت البطاقات هنا</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <button onClick={check} disabled={Object.keys(placed).length < total} className="w-full rounded-2xl bg-[#0b6e3f] py-2.5 text-sm font-black text-white shadow disabled:opacity-40">
            ✅ تحقق من التصنيف
          </button>
        ) : (
          <button onClick={() => { setPlaced({}); setChecked(false); }} className="w-full rounded-2xl bg-[#c9a86a] py-2.5 text-sm font-black text-[#063d23] shadow">🔄 حاول مرة أخرى</button>
        )}
      </div>
    </div>
  );
}

/* ---------- لعبة الترتيب: رتب الخطوات بالسحب ---------- */
export function OrderGame({
  items, onResult, hint,
}: {
  items: string[];
  onResult: (score: number, max: number, correct: boolean) => void;
  hint?: string;
}) {
  const [order, setOrder] = useState<string[]>(() => shuffle(items));
  const [checked, setChecked] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (checked) return;
    setOrder((o) => {
      const n = [...o];
      const [x] = n.splice(from, 1);
      n.splice(to, 0, x);
      return n;
    });
  }
  function check() {
    setChecked(true);
    let s = 0;
    order.forEach((v, i) => { if (v === items[i]) s++; });
    onResult(s, items.length, s === items.length);
  }

  return (
    <div>
      {hint && <p className="mb-3 text-xs font-bold text-slate-500">{hint}</p>}
      <div className="space-y-2">
        {order.map((v, i) => {
          const ok = checked && v === items[i];
          const bad = checked && v !== items[i];
          return (
            <div
              key={v}
              draggable={!checked}
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIdx !== null && dragIdx !== i) move(dragIdx, i); setDragIdx(null); }}
              className={`drag-item flex items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-sm ${ok ? "border-[#0b6e3f] bg-[#eef7f1]" : bad ? "border-red-300 bg-red-50" : "border-[#e9dcc3]"} ${dragIdx === i ? "dragging" : ""}`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#063d23] text-sm font-black text-white">{i + 1}</span>
              <span className="flex-1 text-sm font-bold text-[#063d23]">{v}</span>
              <span className="flex gap-1 no-print">
                {!checked && (
                  <>
                    <button disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded-lg bg-[#f4edde] px-2 py-1 text-xs disabled:opacity-30">▲</button>
                    <button disabled={i === order.length - 1} onClick={() => move(i, i + 1)} className="rounded-lg bg-[#f4edde] px-2 py-1 text-xs disabled:opacity-30">▼</button>
                  </>
                )}
                {checked && (ok ? "✅" : "❌")}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        {!checked ? (
          <button onClick={check} className="w-full rounded-2xl bg-[#0b6e3f] py-2.5 text-sm font-black text-white shadow">✅ تحقق من الترتيب</button>
        ) : (
          <button onClick={() => { setOrder(shuffle(items)); setChecked(false); }} className="w-full rounded-2xl bg-[#c9a86a] py-2.5 text-sm font-black text-[#063d23] shadow">🔄 حاول مرة أخرى</button>
        )}
      </div>
    </div>
  );
}

/* ---------- أسئلة اختيار / صح وخطأ ---------- */
export function ChoiceQuiz({
  questions, onDone,
}: {
  questions: { q: string; options: string[]; correct: string; why: string }[];
  onDone: (score: number, max: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const cur = questions[idx];

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    if (o === cur.correct) setScore((s) => s + 1);
  }
  function next() {
    if (idx + 1 >= questions.length) {
      setDone(true);
      onDone(score + (picked === cur.correct ? 0 : 0), questions.length);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  if (done) {
    const finalScore = score;
    return (
      <div className="rounded-2xl bg-[#eef7f1] p-6 text-center">
        <div className="text-4xl">{finalScore === questions.length ? "🏆" : finalScore >= questions.length / 2 ? "👏" : "💪"}</div>
        <div className="mt-2 text-lg font-black text-[#063d23]">نتيجتك: {finalScore} / {questions.length}</div>
        <p className="mt-1 text-sm text-slate-600">
          {finalScore === questions.length ? "ممتاز! إجاباتك كلها صحيحة، أنت نجم الدرس! 🌟" : finalScore >= questions.length / 2 ? "أحسنت! راجع الأسئلة ثم حاول الوصول للعلامة الكاملة." : "لا بأس! راجع بطاقات الدرس أعلاه ثم أعد المحاولة."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>السؤال {idx + 1} من {questions.length}</span>
        <span>النقاط: {score}</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-[#0b6e3f] transition-all" style={{ width: `${((idx) / questions.length) * 100}%` }} />
      </div>
      <div className="rounded-2xl bg-[#faf7f0] p-4 font-black text-[#063d23]">{cur.q}</div>
      <div className="mt-3 grid gap-2">
        {cur.options.map((o) => {
          const isPick = picked === o;
          const isRight = picked && o === cur.correct;
          const isWrongPick = isPick && o !== cur.correct;
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              disabled={!!picked}
              className={`rounded-2xl border-2 p-3 text-right text-sm font-bold transition ${isRight ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : isWrongPick ? "border-red-400 bg-red-50 text-red-700" : "border-[#e9dcc3] bg-white hover:border-[#c9a86a]"}`}
            >
              {o} {isRight ? " ✅" : ""} {isWrongPick ? " ❌" : ""}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className={`animate-pop mt-3 rounded-2xl border-2 p-3 text-sm leading-relaxed ${picked === cur.correct ? "border-[#0b6e3f] bg-[#eef7f1] text-[#095c35]" : "border-[#c9a86a] bg-[#faf3e3] text-[#86683a]"}`}>
          {picked === cur.correct ? "✅ أحسنت! " : "💡 تذكّر: "}{cur.why}
          <button onClick={next} className="mt-3 block w-full rounded-xl bg-[#063d23] py-2 text-white">
            {idx + 1 >= questions.length ? "🏁 عرض النتيجة" : "السؤال التالي ←"}
          </button>
        </div>
      )}
    </div>
  );
}
