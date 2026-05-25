"use client";

import { useState } from "react";
import type { ComboNotice, EffectKind, Molecule, ReactionLog } from "@/types/game";
import type { TokenSymbol } from "@/types/game";
import { MOLECULES } from "@/lib/game/molecules";
import { formatScore } from "@/lib/game/scoring";
import { EFFECT_STYLES } from "@/lib/game/tokens";
import { MiniToken } from "./MiniToken";

const EFFECT_ORDER: EffectKind[] = ["clean", "toxic", "sleep", "energy", "reactive", "salt", "inert"];

function ComboRecordCard({ maxCombo }: { maxCombo: number }) {
  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2">
      <p className="text-xs font-bold uppercase text-cyan-700">Max Combo</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-cyan-950">{maxCombo}</p>
    </div>
  );
}

const getRecipeLayout = (molecule: Molecule) => {
  const hubLike = molecule.nodes.length > 2 && molecule.bonds.every((bond) => bond.a === 0 || bond.b === 0);
  if (hubLike) {
    const leaves = molecule.nodes.length - 1;
    const radius = leaves <= 2 ? 30 : 35;
    return molecule.nodes.map((_, index) => {
      if (index === 0) return { x: 50, y: 50 };
      const angle = -Math.PI / 2 + ((Math.PI * 2) / leaves) * (index - 1);
      return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
    });
  }

  if (molecule.nodes.length === 2) {
    return [
      { x: 30, y: 50 },
      { x: 70, y: 50 },
    ];
  }

  return molecule.nodes.map((_, index) => {
    const span = molecule.nodes.length - 1;
    return { x: 16 + (68 * index) / span, y: index % 2 === 0 ? 42 : 58 };
  });
};

function RecipeDiagram({ molecule }: { molecule: Molecule }) {
  const positions = getRecipeLayout(molecule);

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-md border border-slate-200 bg-white">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        {molecule.bonds.map((bond, index) => {
          const start = positions[bond.a];
          const end = positions[bond.b];
          return <line key={`${molecule.formula}-bond-${index}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#64748b" strokeWidth={bond.order === 3 ? 3 : bond.order === 2 ? 2.4 : 1.8} strokeLinecap="round" />;
        })}
      </svg>
      {molecule.nodes.map((token, index) => {
        const point = positions[index];
        return (
          <span key={`${molecule.formula}-${token}-${index}`} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
            <MiniToken token={token} />
          </span>
        );
      })}
    </div>
  );
}

export function GameStatusPanel({ score, level, reactionLog, maxCombo }: { score: number; level: number; reactionLog: ReactionLog[]; comboNotice: ComboNotice | null; maxCombo: number }) {
  const [attributeOpen, setAttributeOpen] = useState(false);
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
      <div className="grid grid-cols-[1fr_0.72fr_0.72fr] gap-2">
        <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-bold uppercase text-slate-400">Score</p>
          <p className="text-3xl font-black leading-tight tabular-nums">{formatScore(score)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold uppercase text-slate-500">Level</p>
          <p className="text-2xl font-black tabular-nums text-slate-950">{level}</p>
        </div>
        <ComboRecordCard maxCombo={maxCombo} />
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50">
        <button type="button" onClick={() => setAttributeOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
          <div>
            <h2 className="text-sm font-black text-slate-950">Attribute</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{total > 0 ? `${total} reactions analyzed` : "collapsed"}</p>
          </div>
          <span className={`rounded-md px-2 py-1 text-xs font-black ${total > 0 ? EFFECT_STYLES[dominantEffect].panel : "border border-slate-200 bg-white text-slate-500"}`}>
            {attributeOpen ? "閉じる" : total > 0 ? EFFECT_STYLES[dominantEffect].tag : "表示"}
          </span>
        </button>

        {attributeOpen ? (
          <div className="space-y-2 border-t border-slate-200 px-3 py-3">
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
        ) : null}
      </div>
    </section>
  );
}

export function MoleculeGrowthList({ enabledAtoms }: { enabledAtoms: TokenSymbol[] }) {
  const enabled = new Set(enabledAtoms);
  const molecules = MOLECULES.filter((molecule) => molecule.nodes.every((atom) => enabled.has(atom))).toSorted((a, b) => a.nodes.length - b.nodes.length || a.points - b.points).slice(0, 14);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950">Growth List</h2>
        <span className="text-xs font-semibold text-slate-500">{molecules.length} recipes</span>
      </div>
      <div className="mt-4 grid gap-3">
        {molecules.map((molecule) => (
          <div key={molecule.formula} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">{molecule.formula}</p>
                <p className="truncate text-[0.68rem] font-semibold text-slate-500">{molecule.name}</p>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-1 text-[0.65rem] font-black ${EFFECT_STYLES[molecule.effect].panel}`}>{EFFECT_STYLES[molecule.effect].tag}</span>
            </div>
            <RecipeDiagram molecule={molecule} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FormedMoleculesHistory({ reactionLog, className = "" }: { reactionLog: ReactionLog[]; className?: string }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950">Formed Molecules</h2>
        <span className="text-xs font-semibold text-slate-500">{reactionLog.length} reactions</span>
      </div>

      {reactionLog.length === 0 ? <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">形成された分子の履歴と特性がここに表示されます。</div> : null}

      <div className="mt-3 grid max-h-72 gap-2 overflow-auto pr-1">
        {reactionLog.map((entry) => (
          <div key={entry.id} className={`rounded-lg border px-3 py-2 ${EFFECT_STYLES[entry.effect].panel}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-black">{entry.formula}</p>
                <p className="text-xs font-semibold opacity-75">{entry.name} / pH {entry.ph.toFixed(1)}</p>
              </div>
              <p className="text-sm font-black tabular-nums">+{formatScore(entry.points)}</p>
            </div>
            <div className="mt-2 flex items-start justify-between gap-2">
              <p className="text-xs leading-5 opacity-80">
                {entry.property}
                {entry.fact ? ` ${entry.fact}` : ""}
              </p>
              <span className="shrink-0 rounded-md bg-white/70 px-2 py-1 text-xs font-black">{EFFECT_STYLES[entry.effect].tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReactionHistory({ reactionLog, score, level, comboNotice }: { reactionLog: ReactionLog[]; score: number; level: number; comboNotice: ComboNotice | null }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <GameStatusPanel score={score} level={level} reactionLog={reactionLog} comboNotice={comboNotice} maxCombo={comboNotice?.matchCount ?? 0} />
      <FormedMoleculesHistory reactionLog={reactionLog} />
    </aside>
  );
}
