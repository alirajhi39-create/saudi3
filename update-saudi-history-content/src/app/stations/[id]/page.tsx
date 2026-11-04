import Link from "next/link";
import { Header, Footer, StationNav } from "@/components/ui";
import { STATIONS } from "@/lib/content";
import { Station1, Station2, Station3, Station4, Station5 } from "../stationsA";
import { Station6, Station7, Station8, Station9, Station10 } from "../stationsB";

export default async function StationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Math.max(1, Math.min(10, parseInt(id) || 1));
  const meta = STATIONS[n - 1];

  return (
    <div className="pattern-light min-h-screen">
      <Header />
      {/* Station hero */}
      <div className="pattern-bg text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex items-center gap-2 text-xs font-bold text-white/70">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>‹</span>
            <Link href="/learn" className="hover:text-white">المحطات</Link>
            <span>‹</span>
            <span className="text-[#f2e4c4]">المحطة {n}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="grid h-20 w-20 place-items-center rounded-3xl bg-[#c9a86a] text-4xl shadow-xl">{meta.icon}</span>
            <div>
              <div className="text-xs font-black text-[#f2e4c4]">المحطة {n} من 10 • {meta.type} • ⏱️ {meta.minutes} دقائق</div>
              <h1 className="text-2xl font-black md:text-3xl">{meta.title}</h1>
              <p className="text-sm text-white/80">{meta.subtitle}</p>
            </div>
          </div>
          {/* progress dots */}
          <div className="mt-5 flex items-center gap-1.5" dir="ltr">
            {STATIONS.map((s) => (
              <Link
                key={s.n}
                href={`/stations/${s.n}`}
                title={s.title}
                className={`h-2.5 flex-1 rounded-full transition ${s.n === n ? "bg-[#c9a86a]" : s.n < n ? "bg-white/60" : "bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="animate-fadeUp">
          {n === 1 && <Station1 />}
          {n === 2 && <Station2 />}
          {n === 3 && <Station3 />}
          {n === 4 && <Station4 />}
          {n === 5 && <Station5 />}
          {n === 6 && <Station6 />}
          {n === 7 && <Station7 />}
          {n === 8 && <Station8 />}
          {n === 9 && <Station9 />}
          {n === 10 && <Station10 />}
        </div>
        <StationNav current={n} />
      </div>
      <Footer />
    </div>
  );
}
