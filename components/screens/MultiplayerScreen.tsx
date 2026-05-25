"use client";

import { useRef, useState } from "react";
import { GameHud } from "@/components/game/GameHud";
import { INITIAL_PHYSICS_GAME_SNAPSHOT, PhysicsChemPuzzle, type PhysicsGameHandle } from "@/components/game/PhysicsChemPuzzle";
import { ReactionHistory } from "@/components/game/ReactionHistory";
import { ResultModal } from "@/components/game/ResultModal";

function BoardColumn({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
        <p className="text-base font-black text-slate-950">{title}</p>
        <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      </div>
      <div className="mx-auto w-full max-w-[632px]">{children}</div>
    </section>
  );
}

export function MultiplayerScreen() {
  const gameRef = useRef<PhysicsGameHandle | null>(null);
  const [game, setGame] = useState(INITIAL_PHYSICS_GAME_SNAPSHOT);
  const [password, setPassword] = useState("");
  const [joined, setJoined] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  if (!joined) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-8">
        <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-xs font-black uppercase text-slate-500">Multiplayer room</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">マルチ部屋に入室</h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">招待されたルームコードを入力して、1v1 対戦ルームに入室します。</p>

          <form
            className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              if (password.trim() === "mock") {
                setJoined(true);
                setPasswordError("");
                return;
              }
              setPasswordError("ルームコードを確認してください。");
            }}
          >
            <label className="min-w-0">
              <span className="text-xs font-black uppercase text-slate-500">Room code</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition focus:border-slate-950 focus:bg-white"
                placeholder="room-code"
                type="text"
                maxLength={12}
              />
              <span className="mt-1 block text-right text-xs font-bold text-slate-400">{password.length}/12</span>
            </label>
            <button type="submit" className="self-end rounded-lg bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-300">
              入室
            </button>
          </form>
          {passwordError ? <p className="mt-3 text-sm font-bold text-rose-600">{passwordError}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">Mode</p>
              <p className="mt-1 text-lg font-black text-slate-950">1v1</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">Gimmick</p>
              <p className="mt-1 text-lg font-black text-slate-950">Water / Fire</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">Room</p>
              <p className="mt-1 text-lg font-black text-slate-950">Private</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-3 sm:px-5">
      <header className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-950">Multiplayer</h1>
          <p className="text-xs font-semibold text-slate-500">リアルタイム対戦用の 1v1 レイアウト</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-950">Room: Private</span>
          <button type="button" onClick={() => gameRef.current?.toggleRunning()} className="min-w-28 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-300">
            {game.gameOver ? "Restart" : game.isRunning ? "Stop" : "Start"}
          </button>
          <button type="button" onClick={() => gameRef.current?.resetGame()} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800">
            Reset
          </button>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,520px)_340px_minmax(0,520px)]">
        <BoardColumn title="You" subtitle="自分の盤面">
          <GameHud
            holdToken={game.holdToken}
            nextQueue={game.nextQueue}
            reactionLog={game.reactionLog}
            canUseTokenAction={game.canUseTokenAction}
            onHold={() => gameRef.current?.holdCurrent()}
            onSwapNext={() => gameRef.current?.swapWithNext()}
          />
          <PhysicsChemPuzzle ref={gameRef} onSnapshot={setGame} />
        </BoardColumn>

        <ReactionHistory reactionLog={game.reactionLog} score={game.score} level={game.level} comboNotice={game.comboNotice} />

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
          <div className="beaker-frame physics-beaker flex min-h-[690px] items-center justify-center p-6">
            <div className="rounded-lg border border-dashed border-cyan-200 bg-white/70 px-5 py-4 text-center shadow-lg shadow-cyan-100/50">
              <p className="text-sm font-black text-slate-950">Physics sync standby</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">相手のPhaser/Matter盤面はリアルタイム同期実装時にここへ表示します。</p>
            </div>
          </div>
        </BoardColumn>
      </section>

      <ResultModal gameOver={game.gameOver} result={game.resultSummary} onRestart={() => gameRef.current?.resetGame()} />
    </div>
  );
}
