import type { ReactionLog } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { EFFECT_STYLES } from "@/lib/game/tokens";

function ProductPreview({ entry }: { entry: ReactionLog }) {
  if (entry.imageUrl) {
    return <img src={entry.imageUrl} alt={`${entry.name} image`} className="h-full w-full object-cover" loading="lazy" />;
  }

  return (
    <div className="product-mock relative h-full w-full overflow-hidden">
      <div className="product-mock-bottle" />
      <div className="product-mock-label">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500">Compound</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{entry.formula}</p>
        <p className="mt-1 text-xs font-semibold text-slate-600">{entry.name}</p>
      </div>
    </div>
  );
}

export function ReactionHistory({ reactionLog, score, level }: { reactionLog: ReactionLog[]; score: number; level: number }) {
  const latest = reactionLog[0];

  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr] lg:grid-cols-1 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.2rem] bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-300/40">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Score</p>
            <p className="mt-2 text-5xl font-black leading-none tabular-nums sm:text-6xl">{formatScore(score)}</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1">Lv {level}</span>
              <span>{reactionLog.length} reactions</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-50">
            {latest ? (
              <>
                <div className="h-40 bg-white">
                  <ProductPreview entry={latest} />
                </div>
                <div className="border-t border-slate-200 px-4 py-3">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-slate-500">Latest Product</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{latest.formula}</p>
                  <p className="text-sm font-semibold text-slate-600">{latest.name}</p>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm font-semibold leading-6 text-slate-500">
                生成物ができると、ここに画像プレビューと最新の分子情報が表示されます。
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="min-h-0 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">Formed Molecules</h2>
          <span className="text-xs font-semibold text-slate-500">history</span>
        </div>

        {reactionLog.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">形成された分子の履歴と特性がここに表示されます。</div>
        ) : null}

        <div className="mt-4 max-h-[calc(100vh-320px)] space-y-3 overflow-auto pr-1">
          {reactionLog.map((entry) => (
            <div key={entry.id} className={`rounded-lg border p-3 ${EFFECT_STYLES[entry.effect].panel}`}>
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/70 bg-white/80">
                  <ProductPreview entry={entry} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
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
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
