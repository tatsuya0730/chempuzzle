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

export function GameHud({ score, level, nextQueue, comboNotice }: { score: number; level: number; nextQueue: TokenSymbol[]; comboNotice: ComboNotice | null }) {
  return (
    <div className="mb-3 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:grid-cols-[minmax(260px,1fr)_auto] lg:grid-cols-[minmax(340px,1fr)_auto_minmax(190px,220px)] lg:items-center">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(92px,0.75fr)] gap-2">
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
        <p className="text-xs font-bold uppercase text-slate-500">Next</p>
        <div className="mt-2 flex gap-2">
          {nextQueue.map((token, index) => (
            <MiniToken key={`${token}-${index}`} token={token} />
          ))}
        </div>
      </div>
      <div className="min-h-[76px] min-w-[190px]">
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
