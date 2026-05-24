"use client";

import { useMemo } from "react";
import type { Grid } from "@/types/game";
import { createEmptyGrid, makeTile } from "@/lib/game/board";
import { BOARD_WIDTH } from "@/lib/game/config";
import { GameBoard } from "@/components/game/GameBoard";
import { GameHud } from "@/components/game/GameHud";
import { ReactionHistory } from "@/components/game/ReactionHistory";
import { ResultModal } from "@/components/game/ResultModal";
import { useChemPuzzleGame } from "@/lib/game/useChemPuzzleGame";

function createOpponentGrid(): Grid {
  const grid = createEmptyGrid();
  const placements = [
    [9, 3, "C"],
    [9, 4, "O"],
    [10, 2, "H"],
    [10, 3, "O"],
    [10, 4, "H"],
    [11, 2, "Na"],
    [11, 3, "Cl"],
    [11, 5, "N"],
    [12, 2, "S"],
    [12, 3, "O"],
    [12, 4, "O"],
    [12, 5, "F"],
  ] as const;

  placements.forEach(([row, col, token]) => {
    grid[row][col] = { token, hands: [] };
  });

  return grid;
}

function BoardColumn({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <div className="mb-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/60">
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <div className="mx-auto w-full" style={{ maxWidth: `${BOARD_WIDTH + 72}px` }}>
        {children}
      </div>
    </section>
  );
}

export function MultiplayerScreen() {
  const game = useChemPuzzleGame();
  const opponentGrid = useMemo(() => createOpponentGrid(), []);
  const opponentCurrent = useMemo(() => makeTile("Xe"), []);

  return (
    <div className="min-h-screen px-4 py-3 sm:px-5">
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Multiplayer</h1>
          <p className="text-xs font-semibold text-slate-500">リアルタイム対戦用の 1v1 レイアウト</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-950">Room: demo-lab</span>
          <button type="button" onClick={game.toggleRunning} className="min-w-28 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300">
            {game.gameOver ? "Restart" : game.isRunning ? "Stop" : "Start"}
          </button>
          <button type="button" onClick={game.resetGame} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">
            Reset
          </button>
        </div>
      </header>

      <section className="grid gap-4 2xl:grid-cols-[minmax(0,560px)_360px_minmax(0,560px)]">
        <BoardColumn title="You" subtitle="自分の盤面">
          <GameHud
            score={game.score}
            level={game.level}
            holdToken={game.holdToken}
            nextQueue={game.nextQueue}
            comboNotice={game.comboNotice}
            canUseTokenAction={game.canUseTokenAction}
            onHold={game.holdCurrent}
            onSwapNext={game.swapWithNext}
          />
          <GameBoard displayGrid={game.displayGrid} current={game.current} predictedLanding={game.predictedLanding} clearing={game.clearing} clearingMatches={game.clearingMatches} />
        </BoardColumn>

        <ReactionHistory reactionLog={game.reactionLog} />

        <BoardColumn title="Opponent" subtitle="相手の盤面プレビュー">
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
            <div className="rounded-lg bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs font-bold uppercase text-slate-400">Score</p>
              <p className="text-3xl font-black leading-tight tabular-nums">12,480</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase text-slate-500">Status</p>
              <p className="text-xl font-black text-emerald-700">Live</p>
            </div>
          </div>
          <GameBoard displayGrid={opponentGrid} current={opponentCurrent} predictedLanding={{ row: -1, col: 0 }} clearing={new Map()} clearingMatches={[]} />
        </BoardColumn>
      </section>

      <ResultModal gameOver={game.gameOver} result={game.resultSummary} onRestart={game.resetGame} />
    </div>
  );
}
