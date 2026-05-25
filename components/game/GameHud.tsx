import type { ComboNotice, TokenSymbol } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { MiniToken } from "./MiniToken";

function ComboFlash({ combo }: { combo: ComboNotice }) {
  const showCombo = combo.matchCount > 1;
  const showChain = combo.chain > 1;

  return (
    <div key={combo.id} className="combo-flash rounded-lg border border-cyan-200 bg-cyan-950 px-4 py-3 text-white shadow-lg shadow-cyan-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-cyan-200">{showChain ? `${combo.chain} Chain` : showCombo ? `${combo.matchCount} Combo` : "Reaction"}</p>
          <p className="mt-1 text-xl font-black tabular-nums">+{formatScore(combo.gainedPoints)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {showChain && showCombo ? <p className="rounded-md bg-white/12 px-2 py-1 text-xs font-black">{combo.matchCount} Combo</p> : null}
          {combo.bonusPoints > 0 ? <p className="rounded-md bg-white/12 px-2 py-1 text-xs font-black tabular-nums">Bonus +{formatScore(combo.bonusPoints)}</p> : null}
        </div>
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-cyan-100/85">{combo.formulas.join(" + ")}</p>
    </div>
  );
}

export function GameHud({
  score,
  level,
  holdToken,
  nextQueue,
  comboNotice,
  canUseTokenAction,
  onHold,
  onSwapNext,
}: {
  score: number;
  level: number;
  holdToken: TokenSymbol | null;
  nextQueue: TokenSymbol[];
  comboNotice: ComboNotice | null;
  canUseTokenAction: boolean;
  onHold: () => void;
  onSwapNext: () => void;
}) {
  return (
    <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:grid-cols-2">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(92px,0.75fr)] gap-2 sm:col-span-2">
        <div className="rounded-lg bg-slate-950 px-5 py-3 text-white">
          <p className="text-xs font-bold uppercase text-slate-400">Score</p>
          <p className="text-3xl font-black leading-tight tabular-nums">{formatScore(score)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-slate-500">Level</p>
          <p className="text-2xl font-black tabular-nums">{level}</p>
        </div>
      </div>
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
      <div className="min-h-[76px] min-w-0">
        {comboNotice ? (
          <ComboFlash combo={comboNotice} />
        ) : (
          <div className="flex h-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Combo</p>
              <p className="mt-1 text-xl font-black text-slate-400">Ready</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
