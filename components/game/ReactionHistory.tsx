import type { ComboNotice, EffectKind, ReactionLog } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { EFFECT_STYLES } from "@/lib/game/tokens";

const EFFECT_ORDER: EffectKind[] = ["clean", "toxic", "sleep", "energy", "reactive", "salt", "inert"];

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

function SideStatus({ score, level, reactionLog, comboNotice }: { score: number; level: number; reactionLog: ReactionLog[]; comboNotice: ComboNotice | null }) {
  const total = reactionLog.length;
  const effectCounts = reactionLog.reduce(
    (counts, entry) => {
      counts[entry.effect] += 1;
      return counts;
    },
    Object.fromEntries(EFFECT_ORDER.map((effect) => [effect, 0])) as Record<EffectKind, number>,
  );
  const dominantEffect = EFFECT_ORDER.toSorted((a, b) => effectCounts[b] - effectCounts[a])[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-bold uppercase text-slate-400">Score</p>
          <p className="text-3xl font-black leading-tight tabular-nums">{formatScore(score)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-slate-500">Level</p>
          <p className="text-2xl font-black tabular-nums text-slate-950">{level}</p>
        </div>
      </div>

      <div className="mt-3 min-h-[76px]">
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-950">Attribute</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">{total > 0 ? `${total} reactions analyzed` : "No reactions yet"}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-black ${total > 0 ? EFFECT_STYLES[dominantEffect].panel : "border border-slate-200 bg-slate-50 text-slate-500"}`}>
          {total > 0 ? EFFECT_STYLES[dominantEffect].tag : "待機"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {EFFECT_ORDER.filter((effect) => effectCounts[effect] > 0 || total === 0).map((effect) => {
          const count = effectCounts[effect];
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={effect} className="grid grid-cols-[58px_1fr_24px] items-center gap-2 text-xs font-bold text-slate-600">
              <span>{EFFECT_STYLES[effect].tag}</span>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-right tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ReactionHistory({ reactionLog, score, level, comboNotice }: { reactionLog: ReactionLog[]; score: number; level: number; comboNotice: ComboNotice | null }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <SideStatus score={score} level={level} reactionLog={reactionLog} comboNotice={comboNotice} />

      <section className="min-h-0 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">Formed Molecules</h2>
          <span className="text-xs font-semibold text-slate-500">{reactionLog.length} reactions</span>
        </div>

        {reactionLog.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">形成された分子の履歴と特性がここに表示されます。</div>
        ) : null}

        <div className="mt-4 max-h-[calc(100vh-470px)] space-y-3 overflow-auto pr-1">
          {reactionLog.map((entry) => (
            <div key={entry.id} className={`rounded-lg border p-3 ${EFFECT_STYLES[entry.effect].panel}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-black">{entry.formula}</p>
                  <p className="text-xs font-semibold opacity-75">
                    {entry.name} / {entry.count} tiles
                  </p>
                  <p className="mt-1 text-xs font-black opacity-80">
                    {entry.acidity === "acidic" ? "酸性" : entry.acidity === "basic" ? "塩基性" : "中性"} / pH {entry.ph.toFixed(1)}
                  </p>
                </div>
                <p className="text-sm font-black tabular-nums">+{formatScore(entry.points)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs leading-5 opacity-80">{entry.property}</p>
                <span className="shrink-0 rounded-md bg-white/70 px-2 py-1 text-xs font-black">{EFFECT_STYLES[entry.effect].tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
