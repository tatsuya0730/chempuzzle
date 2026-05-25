"use client";

import { useRef, useState } from "react";
import { GameHud } from "@/components/game/GameHud";
import { INITIAL_PHYSICS_GAME_SNAPSHOT, PhysicsChemPuzzle, type PhysicsGameHandle } from "@/components/game/PhysicsChemPuzzle";
import { ReactionHistory } from "@/components/game/ReactionHistory";
import { ResultModal } from "@/components/game/ResultModal";
import { SiteFooter } from "@/components/game/SiteFooter";
import { SiteHeader } from "@/components/game/SiteHeader";

export function SoloPlayScreen() {
  const gameRef = useRef<PhysicsGameHandle | null>(null);
  const [game, setGame] = useState(INITIAL_PHYSICS_GAME_SNAPSHOT);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <SiteHeader title="Single Play" subtitle="分子が転がり結合する物理演算プレイ" gameOver={game.gameOver} isRunning={game.isRunning} onReset={() => gameRef.current?.resetGame()} onToggleRunning={() => gameRef.current?.toggleRunning()} />

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
            <PhysicsChemPuzzle ref={gameRef} onSnapshot={setGame} />
            <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 shadow-lg shadow-slate-200/60 sm:grid-cols-3">
              <p className="font-black uppercase text-slate-500">Controls</p>
              <p>← / A 右左移動</p>
              <p>↓ / S ソフトドロップ</p>
              <p>Space 落下固定 / Enter Start</p>
              <p>C ホールド</p>
              <p>X Next交換</p>
            </div>
          </div>
        </div>

        <ReactionHistory reactionLog={game.reactionLog} score={game.score} level={game.level} comboNotice={game.comboNotice} />
      </section>

      <SiteFooter />
      <ResultModal gameOver={game.gameOver} result={game.resultSummary} onRestart={() => gameRef.current?.resetGame()} />
    </div>
  );
}
