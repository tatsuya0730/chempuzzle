"use client";

export function GameDisplaySettings({
  showMoleculeHints,
  showAtomicNumbers,
  onToggleMoleculeHints,
  onToggleAtomicNumbers,
}: {
  showMoleculeHints: boolean;
  showAtomicNumbers: boolean;
  onToggleMoleculeHints: (enabled: boolean) => void;
  onToggleAtomicNumbers: (enabled: boolean) => void;
}) {
  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-lg shadow-slate-200/60 sm:grid-cols-2">
      <button type="button" role="switch" aria-checked={showMoleculeHints} onClick={() => onToggleMoleculeHints(!showMoleculeHints)} className="flex items-center justify-between gap-3 text-left">
        <span>生成ヒント</span>
        <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${showMoleculeHints ? "bg-slate-950" : "bg-slate-300"}`}>
          <span className={`h-4 w-4 rounded-full bg-white shadow transition ${showMoleculeHints ? "translate-x-4" : ""}`} />
        </span>
      </button>
      <button type="button" role="switch" aria-checked={showAtomicNumbers} onClick={() => onToggleAtomicNumbers(!showAtomicNumbers)} className="flex items-center justify-between gap-3 text-left">
        <span>原子番号</span>
        <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${showAtomicNumbers ? "bg-slate-950" : "bg-slate-300"}`}>
          <span className={`h-4 w-4 rounded-full bg-white shadow transition ${showAtomicNumbers ? "translate-x-4" : ""}`} />
        </span>
      </button>
    </div>
  );
}
