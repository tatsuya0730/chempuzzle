import type { TokenSymbol } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { MiniToken } from "./MiniToken";

export function GameHud({ score, level, nextQueue }: { score: number; level: number; nextQueue: TokenSymbol[] }) {
  return (
    <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
        <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-bold uppercase text-slate-400">Score</p>
          <p className="text-2xl font-black tabular-nums">{formatScore(score)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-slate-500">Level</p>
          <p className="text-2xl font-black tabular-nums">{level}</p>
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-bold uppercase text-slate-500">Next</p>
        <div className="mt-2 flex gap-2">
          {nextQueue.map((token, index) => (
            <MiniToken key={`${token}-${index}`} token={token} />
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
        ←/A 右左移動
        <br />
        ↓/S ソフトドロップ
        <br />
        Space ハードドロップ / Enter Start
      </div>
    </div>
  );
}
