"use client";

import { useMemo, useState } from "react";

type Puzzle = {
  id: string;
  name: string;
  hint: string;
  answer: string;
  tiles: string[];
};

const PUZZLES: Puzzle[] = [
  {
    id: "water",
    name: "Water",
    hint: "水",
    answer: "H2O",
    tiles: ["H", "2", "O", "H", "O", "2"],
  },
  {
    id: "carbon-dioxide",
    name: "Carbon Dioxide",
    hint: "二酸化炭素",
    answer: "CO2",
    tiles: ["C", "O", "2", "O", "C", "2"],
  },
  {
    id: "ammonia",
    name: "Ammonia",
    hint: "アンモニア",
    answer: "NH3",
    tiles: ["N", "H", "3", "H", "3", "N"],
  },
  {
    id: "glucose",
    name: "Glucose",
    hint: "グルコース",
    answer: "C6H12O6",
    tiles: ["C", "6", "H", "1", "2", "O", "6", "C", "H", "2"],
  },
];

export default function Home() {
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  const puzzle = PUZZLES[selectedPuzzleIndex];

  const isCorrect = useMemo(
    () => selectedTiles.join("") === puzzle.answer,
    [selectedTiles, puzzle.answer],
  );

  const selectedFormula = selectedTiles.join("");

  const addTile = (tile: string) => {
    setSelectedTiles((prev) => [...prev, tile]);
  };

  const removeTile = (index: number) => {
    setSelectedTiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const reset = () => {
    setSelectedTiles([]);
  };

  const nextPuzzle = () => {
    setSelectedTiles([]);
    setSelectedPuzzleIndex((prev) => (prev + 1) % PUZZLES.length);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10">
        <section className="rounded-3xl border border-slate-300 bg-white/90 p-8 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">ChemPuzzle</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                化学式パズルゲーム
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                マッチする元素と数字を選んで、表示された物質の化学式を完成させよう。鉛直配置されたタイルをタップして式を組み立ててください。
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white shadow-xl shadow-slate-900/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Current goal</p>
              <p className="mt-2 text-2xl font-semibold">{puzzle.name}</p>
              <p className="mt-1 text-slate-300">{puzzle.hint}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                ターゲット式: {puzzle.answer}
              </span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
                現在: {selectedFormula || "(選択なし)"}
              </span>
              {selectedFormula && (
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isCorrect ? "正解!" : "まだ違います"}
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">選択中の式</h2>
                <div className="min-h-[120px] rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-xl font-semibold text-slate-900">
                  {selectedFormula || "ここに化学式が表示されます"}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTiles.map((tile, index) => (
                    <button
                      key={`${tile}-${index}`}
                      type="button"
                      onClick={() => removeTile(index)}
                      className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      {tile} × 削除
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">操作</h2>
                <div className="grid grid-cols-3 gap-3">
                  {puzzle.tiles.map((tile, index) => (
                    <button
                      key={`${tile}-${index}`}
                      type="button"
                      onClick={() => addTile(tile)}
                      className="rounded-3xl bg-slate-950 px-4 py-3 text-lg font-semibold text-white transition hover:bg-slate-800"
                    >
                      {tile}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    リセット
                  </button>
                  <button
                    type="button"
                    onClick={nextPuzzle}
                    className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    次の問題へ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">ヒント</h2>
            <p className="mt-3 leading-7 text-slate-600">
              下のタイルから化学式を組み立てます。数字は元素記号の後に続けてください。例えば水は「H」「2」「O」の順番です。
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="text-sm font-medium text-slate-700">1. 正しい順番を考える</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">化学式は元素の順序と数字を正しく組み合わせる必要があります。</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="text-sm font-medium text-slate-700">2. 同じタイルを複数回使える</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">選択したタイルはタップで削除できます。間違えたら戻して再挑戦。</p>
              </div>
              <div className="rounded-3xl bg-slate-100 p-4">
                <p className="text-sm font-medium text-slate-700">3. 次の問題</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">「次の問題へ」で別の物質に挑戦できます。</p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
