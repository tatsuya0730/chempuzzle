import type { ReactionLog, TokenSymbol } from "@/types/game";
import { MiniToken } from "./MiniToken";

export function GameHud({
  holdToken,
  nextQueue,
  reactionLog,
  canUseTokenAction,
  onHold,
  onSwapNext,
}: {
  holdToken: TokenSymbol | null;
  nextQueue: TokenSymbol[];
  reactionLog: ReactionLog[];
  canUseTokenAction: boolean;
  onHold: () => void;
  onSwapNext: () => void;
}) {
  const averagePh = reactionLog.length > 0 ? reactionLog.reduce((sum, entry) => sum + entry.ph, 0) / reactionLog.length : 7;
  const phPosition = Math.max(0, Math.min(100, (averagePh / 14) * 100));

  return (
    <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase text-slate-500">Hold</p>
          <button
            type="button"
            onClick={onHold}
            disabled={!canUseTokenAction}
            className="rounded-md bg-slate-950 px-2 py-1 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            C
          </button>
        </div>
        <div className="mt-2 flex h-8 items-center">
          {holdToken ? <MiniToken token={holdToken} /> : <span className="text-xs font-bold text-slate-400">empty</span>}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase text-slate-500">Next</p>
          <button
            type="button"
            onClick={onSwapNext}
            disabled={!canUseTokenAction}
            className="rounded-md bg-slate-950 px-2 py-1 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            X
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          {nextQueue.map((token, index) => (
            <MiniToken key={`${token}-${index}`} token={token} />
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
        <div className="flex items-end justify-between">
          <p className="text-xs font-bold uppercase text-slate-500">pH</p>
          <p className="text-xl font-black tabular-nums text-slate-950">{averagePh.toFixed(1)}</p>
        </div>
        <div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-rose-400 via-emerald-300 to-sky-500">
          <span className="absolute top-1/2 h-5 w-2 rounded-full border border-white bg-slate-950 shadow-md" style={{ left: `${phPosition}%`, transform: "translate(-50%, -50%)" }} />
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] font-bold text-slate-500">
          <span>acid</span>
          <span>neutral</span>
          <span>basic</span>
        </div>
      </div>
    </div>
  );
}
