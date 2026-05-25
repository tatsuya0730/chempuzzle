import { RANKINGS } from "@/lib/game/config";
import { formatScore } from "@/lib/game/scoring";

export function RankingMock() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">オンラインランキング</h2>
          <p className="text-xs font-semibold text-slate-500">weekly leaderboard</p>
        </div>
        <p className="text-xs font-semibold text-slate-500">ログイン済みプレイヤーのベストスコア</p>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        {RANKINGS.map((entry) => (
          <div key={entry.rank} className="grid grid-cols-[52px_minmax(0,1fr)_96px_88px] items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
            <p className="font-black tabular-nums text-slate-500">#{entry.rank}</p>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{entry.name}</p>
              <p className="truncate text-xs font-black text-slate-500">@{entry.username}</p>
            </div>
            <p className="text-right font-black tabular-nums text-slate-950">{formatScore(entry.score)}</p>
            <p className="rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-black text-slate-600">{entry.molecule}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
