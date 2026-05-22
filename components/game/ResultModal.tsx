import type { ResultSummary } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";

const dominantLabel: Record<ResultSummary["dominant"], string> = {
  acidic: "酸性",
  neutral: "中性",
  basic: "塩基性",
  none: "未反応",
};

export function ResultModal({ gameOver, result, onRestart }: { gameOver: boolean; result: ResultSummary; onRestart: () => void }) {
  if (!gameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/30">
        <p className="text-xs font-black uppercase text-slate-500">Game Over</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">Result</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase text-slate-400">Score</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{formatScore(result.score)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Reactions</p>
            <p className="mt-1 text-3xl font-black tabular-nums text-slate-950">{result.reactionCount}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">生成物の傾向: {dominantLabel[result.dominant]}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-600">
            <div className="rounded-md bg-rose-50 p-2 text-rose-950">酸性 {result.acidic}</div>
            <div className="rounded-md bg-emerald-50 p-2 text-emerald-950">中性 {result.neutral}</div>
            <div className="rounded-md bg-blue-50 p-2 text-blue-950">塩基性 {result.basic}</div>
          </div>
        </div>
        <button type="button" onClick={onRestart} className="mt-5 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
          Restart
        </button>
      </section>
    </div>
  );
}
