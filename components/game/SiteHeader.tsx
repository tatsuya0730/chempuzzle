export function SiteHeader({ gameOver, isRunning, onReset, onToggleRunning }: { gameOver: boolean; isRunning: boolean; onReset: () => void; onToggleRunning: () => void }) {
  return (
    <header className="site-header flex flex-col gap-2 border-b border-slate-200/80 pb-2 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">ChemPuzzle</h1>
        <p className="text-xs font-semibold text-slate-500">hex chemistry puzzle</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onToggleRunning} className="min-w-28 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-slate-800">
          {gameOver ? "Restart" : isRunning ? "Stop" : "Start"}
        </button>
        <button type="button" onClick={onReset} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
          Reset
        </button>
      </div>
    </header>
  );
}
