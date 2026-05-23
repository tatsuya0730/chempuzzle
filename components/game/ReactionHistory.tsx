import type { ReactionLog } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { EFFECT_STYLES } from "@/lib/game/tokens";

export function ReactionHistory({ reactionLog }: { reactionLog: ReactionLog[] }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <section className="min-h-0 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">Formed Molecules</h2>
          <span className="text-xs font-semibold text-slate-500">{reactionLog.length} reactions</span>
        </div>

        {reactionLog.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">形成された分子の履歴と特性がここに表示されます。</div>
        ) : null}

        <div className="mt-4 max-h-[calc(100vh-180px)] space-y-3 overflow-auto pr-1">
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
