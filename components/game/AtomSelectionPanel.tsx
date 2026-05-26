"use client";

import type { TokenSymbol } from "@/types/game";
import { PERIODIC_ELEMENTS } from "@/lib/game/periodic";
import { TOKENS } from "@/lib/game/tokens";

export function AtomSelectionPanel({
  enabledAtoms,
  onChange,
  onReset,
}: {
  enabledAtoms: TokenSymbol[];
  onChange: (atoms: TokenSymbol[]) => void;
  onReset: () => void;
}) {
  const enabled = new Set(enabledAtoms);

  const toggleAtom = (symbol: TokenSymbol) => {
    const next = enabled.has(symbol) ? enabledAtoms.filter((atom) => atom !== symbol) : [...enabledAtoms, symbol];
    onChange(next);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">登場原子</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">周期表からゲームに出す原子を選びます。2種類以上が必要です。</p>
        </div>
        <button type="button" onClick={onReset} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-800 transition hover:bg-slate-50">
          初期設定
        </button>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(18,minmax(2.85rem,1fr))] gap-1 overflow-x-auto pb-1">
        {PERIODIC_ELEMENTS.map((element) => {
          const selected = enabled.has(element.symbol);
          const styles = TOKENS[element.symbol];
          return (
            <button
              key={element.symbol}
              type="button"
              onClick={() => toggleAtom(element.symbol)}
              className={`min-h-16 min-w-0 rounded-md border px-1.5 py-1 text-left transition ${
                selected ? `${styles.shell} ${styles.text} shadow-md ${styles.glow}` : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
              style={{ gridColumn: String(element.group), gridRow: String(element.period) }}
              aria-pressed={selected}
              title={element.name}
            >
              <span className="block text-[0.62rem] font-bold opacity-70">{element.atomicNumber}</span>
              <span className="block text-base font-black leading-5">{element.symbol}</span>
              <span className="block truncate text-[0.58rem] font-bold opacity-75">{element.name}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
        現在 {enabledAtoms.length} 種類: {enabledAtoms.join(", ")}
      </p>
    </section>
  );
}
