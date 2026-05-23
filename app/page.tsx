"use client";

import { GameBoard } from "@/components/game/GameBoard";
import { GameHud } from "@/components/game/GameHud";
import { RankingMock } from "@/components/game/RankingMock";
import { ReactionHistory } from "@/components/game/ReactionHistory";
import { ResultModal } from "@/components/game/ResultModal";
import { SiteFooter } from "@/components/game/SiteFooter";
import { SiteHeader } from "@/components/game/SiteHeader";
import { useChemPuzzleGame } from "@/lib/game/useChemPuzzleGame";

export default function Home() {
  const game = useChemPuzzleGame();

  return (
    <main className="min-h-screen bg-[#eef4f8] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <SiteHeader gameOver={game.gameOver} isRunning={game.isRunning} onReset={game.resetGame} onToggleRunning={game.toggleRunning} />

        <section className="grid flex-1 gap-5 lg:grid-cols-[minmax(650px,1fr)_360px]">
          <div className="flex min-h-0 flex-col">
            <GameHud score={game.score} level={game.level} nextQueue={game.nextQueue} />
            <GameBoard
              displayGrid={game.displayGrid}
              current={game.current}
              predictedLanding={game.predictedLanding}
              clearing={game.clearing}
              clearingMatches={game.clearingMatches}
            />
          </div>

          <ReactionHistory reactionLog={game.reactionLog} />
        </section>

        <RankingMock />
        <SiteFooter />
        <ResultModal gameOver={game.gameOver} result={game.resultSummary} onRestart={game.resetGame} />
      </div>
    </main>
  );
}
