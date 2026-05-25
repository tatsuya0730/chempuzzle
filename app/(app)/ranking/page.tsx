import { RankingMock } from "@/components/game/RankingMock";

export default function RankingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">オンラインランキング</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">シングルプレイとマルチプレイのスコアをオンライン集計するためのランキングページです。</p>
      </header>

      <RankingMock />
    </div>
  );
}
