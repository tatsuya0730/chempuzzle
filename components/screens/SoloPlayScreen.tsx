"use client";

import { useRef, useState } from "react";
import { GameHud } from "@/components/game/GameHud";
import { INITIAL_PHYSICS_GAME_SNAPSHOT, PhysicsChemPuzzle, type PhysicsGameHandle } from "@/components/game/PhysicsChemPuzzle";
import { FormedMoleculesHistory, GameStatusPanel, MoleculeGrowthList } from "@/components/game/ReactionHistory";
import { ResultModal } from "@/components/game/ResultModal";
import { SiteFooter } from "@/components/game/SiteFooter";
import { SiteHeader } from "@/components/game/SiteHeader";
import { useAtomSelection } from "@/components/game/useAtomSelection";

export function SoloPlayScreen() {
  const gameRef = useRef<PhysicsGameHandle | null>(null);
  const [game, setGame] = useState(INITIAL_PHYSICS_GAME_SNAPSHOT);
  const { enabledAtoms } = useAtomSelection();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-[620px]">
        <SiteHeader title="Single Play" gameOver={game.gameOver} isRunning={game.isRunning} onReset={() => gameRef.current?.resetGame()} onToggleRunning={() => gameRef.current?.toggleRunning()} />
      </div>

      <section className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,620px)_360px]">
        <div className="flex min-h-0 flex-col">
          <div className="mx-auto w-full max-w-[632px]">
            <GameHud
              holdToken={game.holdToken}
              nextQueue={game.nextQueue}
              reactionLog={game.reactionLog}
              canUseTokenAction={game.canUseTokenAction}
              onHold={() => gameRef.current?.holdCurrent()}
              onSwapNext={() => gameRef.current?.swapWithNext()}
            />
            <PhysicsChemPuzzle key={enabledAtoms.join("-")} ref={gameRef} enabledAtoms={enabledAtoms} onSnapshot={setGame} />
            <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-lg shadow-slate-200/60 sm:grid-cols-3">
              <p className="font-black uppercase text-slate-500">Controls</p>
              <p>マウス移動 投下位置</p>
              <p>クリック 落下</p>
              <p>← / → 微調整</p>
              <p>C ホールド</p>
              <p>X Next交換</p>
            </div>
            <div className="mt-4">
              <MoleculeGrowthList enabledAtoms={enabledAtoms} />
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <GameStatusPanel score={game.score} level={game.level} reactionLog={game.reactionLog} comboNotice={game.comboNotice} maxCombo={game.maxCombo} />
          <FormedMoleculesHistory reactionLog={game.reactionLog} />
        </aside>
      </section>

      <SiteFooter />
      <ResultModal gameOver={game.gameOver} result={game.resultSummary} onRestart={() => gameRef.current?.resetGame()} />
    </div>
  );
}
