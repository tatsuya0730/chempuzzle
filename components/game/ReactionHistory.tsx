import type { EffectKind, ReactionLog } from "@/types/game";
import { formatScore } from "@/lib/game/scoring";
import { EFFECT_STYLES } from "@/lib/game/tokens";

const ACIDITY_LABELS: Record<ReactionLog["acidity"], string> = {
  acidic: "酸性",
  neutral: "中性",
  basic: "塩基性",
};

const EFFECT_ORDER: EffectKind[] = ["clean", "toxic", "sleep", "energy", "reactive", "salt", "inert"];

function ChemistryMeter({ reactionLog }: { reactionLog: ReactionLog[] }) {
  const total = reactionLog.length;
  const acidityCounts = reactionLog.reduce(
    (counts, entry) => {
      counts[entry.acidity] += 1;
      return counts;
    },
    { acidic: 0, neutral: 0, basic: 0 },
  );
  const effectCounts = reactionLog.reduce(
    (counts, entry) => {
      counts[entry.effect] += 1;
      return counts;
    },
    Object.fromEntries(EFFECT_ORDER.map((effect) => [effect, 0])) as Record<EffectKind, number>,
  );
  const averagePh = total > 0 ? reactionLog.reduce((sum, entry) => sum + entry.ph, 0) / total : 7;
  const phPosition = Math.max(0, Math.min(100, (averagePh / 14) * 100));
  const dominantEffect = EFFECT_ORDER.toSorted((a, b) => effectCounts[b] - effectCounts[a])[0];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-950">pH / Attribute</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">{total > 0 ? `${total} reactions analyzed` : "No reactions yet"}</p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-black ${total > 0 ? EFFECT_STYLES[dominantEffect].panel : "border border-slate-200 bg-slate-50 text-slate-500"}`}>
          {total > 0 ? EFFECT_STYLES[dominantEffect].tag : "待機"}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <p className="text-xs font-bold uppercase text-slate-500">Average pH</p>
          <p className="text-2xl font-black tabular-nums text-slate-950">{averagePh.toFixed(1)}</p>
        </div>
        <div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-rose-400 via-emerald-300 to-sky-500">
          <span className="absolute top-1/2 h-5 w-2 rounded-full border border-white bg-slate-950 shadow-md" style={{ left: `${phPosition}%`, transform: "translate(-50%, -50%)" }} />
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] font-bold text-slate-500">
          <span>0 acid</span>
          <span>7 neutral</span>
          <span>14 basic</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["acidic", "neutral", "basic"] as const).map((acidity) => {
          const count = acidityCounts[acidity];
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={acidity} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="text-xs font-black text-slate-700">{ACIDITY_LABELS[acidity]}</p>
              <p className="mt-1 text-lg font-black tabular-nums text-slate-950">{percent}%</p>
            </div>
          );
        })}
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

export function ReactionHistory({ reactionLog }: { reactionLog: ReactionLog[] }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <ChemistryMeter reactionLog={reactionLog} />

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
