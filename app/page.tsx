"use client";

import { useEffect, useState } from "react";

type Atom = "H" | "O" | "C" | "N";
type Grid = Array<Array<Atom | null>>;

type Molecule = {
  formula: string;
  pattern: Atom[];
  description: string;
  points: number;
};

const MOLECULES: Molecule[] = [
  { formula: "H2O", pattern: ["H", "H", "O"], description: "水", points: 120 },
  { formula: "CO2", pattern: ["C", "O", "O"], description: "二酸化炭素", points: 140 },
  { formula: "NH3", pattern: ["N", "H", "H", "H"], description: "アンモニア", points: 160 },
  { formula: "CH4", pattern: ["C", "H", "H", "H", "H"], description: "メタン", points: 180 },
  { formula: "O2", pattern: ["O", "O"], description: "酸素", points: 80 },
  { formula: "N2", pattern: ["N", "N"], description: "窒素", points: 90 },
  { formula: "H2O2", pattern: ["H", "H", "O", "O"], description: "過酸化水素", points: 220 },
  { formula: "NO2", pattern: ["N", "O", "O"], description: "二酸化窒素", points: 150 },
];

const ATOMS: Atom[] = ["H", "O", "C", "N"];
const ROWS = 10;
const COLS = 6;
const FALL_INTERVAL = 650;

const createEmptyGrid = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomAtom = (): Atom => ATOMS[Math.floor(Math.random() * ATOMS.length)];

const getNextTile = () => ({ atom: randomAtom(), column: Math.floor(COLS / 2), row: -1 });

const getAtomStyles = (atom: Atom | null) => {
  switch (atom) {
    case "H":
      return { bgClass: "from-cyan-300 to-sky-300", borderClass: "border-sky-300", textClass: "text-slate-950" };
    case "O":
      return { bgClass: "from-rose-300 to-red-300", borderClass: "border-red-300", textClass: "text-slate-950" };
    case "C":
      return { bgClass: "from-amber-300 to-orange-300", borderClass: "border-amber-300", textClass: "text-slate-950" };
    case "N":
      return { bgClass: "from-indigo-300 to-violet-300", borderClass: "border-violet-300", textClass: "text-slate-950" };
    default:
      return { bgClass: "bg-slate-100", borderClass: "border-slate-300", textClass: "text-slate-500" };
  }
};

const inBounds = (row: number, col: number) => row >= 0 && row < ROWS && col >= 0 && col < COLS;

const getNeighbor = (row: number, col: number, direction: "right" | "downLeft" | "downRight") => {
  const even = row % 2 === 0;
  if (direction === "right") return [row, col + 1];
  if (direction === "downLeft") return even ? [row + 1, col - 1] : [row + 1, col];
  return even ? [row + 1, col] : [row + 1, col + 1];
};

const compressGrid = (grid: Grid) => {
  const nextGrid = createEmptyGrid();

  for (let col = 0; col < COLS; col++) {
    let writeRow = ROWS - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      const cell = grid[row][col];
      if (cell !== null) {
        nextGrid[writeRow][col] = cell;
        writeRow -= 1;
      }
    }
  }

  return nextGrid;
};

const findMatches = (grid: Grid) => {
  const remove = new Set<string>();
  let points = 0;

  const directions: Array<"right" | "downLeft" | "downRight"> = ["right", "downLeft", "downRight"];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!grid[row][col]) continue;

      for (const molecule of MOLECULES) {
        for (const pattern of [molecule.pattern, [...molecule.pattern].reverse()]) {
          for (const direction of directions) {
            let r = row;
            let c = col;
            let matched = true;
            const positions: string[] = [];

            for (let i = 0; i < pattern.length; i++) {
              if (!inBounds(r, c) || grid[r][c] !== pattern[i]) {
                matched = false;
                break;
              }
              positions.push(`${r},${c}`);
              if (i < pattern.length - 1) {
                [r, c] = getNeighbor(r, c, direction);
              }
            }

            if (matched) {
              points += molecule.points;
              positions.forEach((pos) => remove.add(pos));
            }
          }
        }
      }
    }
  }

  return { remove, points };
};

export default function Home() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [current, setCurrent] = useState(() => getNextTile());
  const [next, setNext] = useState(() => getNextTile());
  const [tick, setTick] = useState(0);

  const canMoveTo = (row: number, column: number) => {
    if (column < 0 || column >= COLS) return false;
    if (row >= ROWS) return false;
    return row < 0 || grid[row][column] === null;
  };

  const settleTile = (row: number, column: number) => {
    if (row < 0) {
      setGameOver(true);
      setIsRunning(false);
      return;
    }

    setGrid((prevGrid) => {
      const nextGrid = prevGrid.map((rowCells) => [...rowCells]);
      nextGrid[row][column] = current.atom;
      return nextGrid;
    });
    setCurrent(next);
    setNext(getNextTile());
  };

  const moveCurrent = (direction: -1 | 1) => {
    if (gameOver) return;
    const nextColumn = current.column + direction;
    if (canMoveTo(current.row, nextColumn)) {
      setCurrent((prev) => ({ ...prev, column: nextColumn }));
    }
  };

  const dropCurrent = () => {
    if (gameOver) return;
    let row = current.row;
    while (row + 1 < ROWS && grid[row + 1][current.column] === null) {
      row += 1;
    }
    settleTile(row, current.column);
  };

  const tickGame = () => {
    if (!isRunning || gameOver) return;
    const nextRow = current.row + 1;
    if (nextRow >= ROWS || !canMoveTo(nextRow, current.column)) {
      settleTile(current.row, current.column);
      return;
    }
    setCurrent((prev) => ({ ...prev, row: nextRow }));
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsRunning(true);
    setCurrent(getNextTile());
    setNext(getNextTile());
    setTick((t) => t + 1);
  };

  useEffect(() => {
    if (!isRunning || gameOver) return;
    const interval = setInterval(() => setTick((value) => value + 1), Math.max(250, FALL_INTERVAL - level * 20));
    return () => clearInterval(interval);
  }, [isRunning, gameOver, level]);

  useEffect(() => {
    if (!isRunning || gameOver) return;
    tickGame();
  }, [tick]);

  useEffect(() => {
    if (!isRunning) return;
    let updated = true;
    let totalPoints = 0;
    let nextGrid = grid;

    while (updated) {
      const { remove, points } = findMatches(nextGrid);
      if (remove.size === 0) {
        updated = false;
        break;
      }
      totalPoints += points;
      nextGrid = nextGrid.map((rowCells, rowIndex) => rowCells.map((cell, colIndex) => (remove.has(`${rowIndex},${colIndex}`) ? null : cell)));
      nextGrid = compressGrid(nextGrid);
    }

    if (totalPoints > 0) {
      setScore((prev) => prev + totalPoints);
      setLevel((prev) => Math.min(10, prev + 1));
      setGrid(nextGrid);
    }
  }, [grid, isRunning]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          moveCurrent(-1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          moveCurrent(1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          dropCurrent();
          break;
        case "Enter":
        case " ":
          if (!isRunning) {
            event.preventDefault();
            setIsRunning(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [current, isRunning, gameOver, grid]);

  const canMoveLeft = canMoveTo(current.row, current.column - 1);
  const canMoveRight = canMoveTo(current.row, current.column + 1);

  const displayRows = grid.map((row, rowIndex) => {
    if (rowIndex === current.row && current.row >= 0) {
      return row.map((cell, colIndex) => (colIndex === current.column ? current.atom : cell));
    }
    return row;
  });

  const statusMessage = gameOver
    ? "ゲームオーバーです。リセットして再挑戦してください。"
    : isRunning
    ? "操作: WASD / 矢印キーで移動、S / ↓ で落下"
    : "スタートボタンを押して開始してください。";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-300/30 backdrop-blur-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-600/90">ChemPuzzle Drop</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">六角形風 化学式落ち物ゲーム</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                6角形に近い見た目のグリッドで、原子を落として分子を揃えよう。WASD / 矢印キーに対応しています。
              </p>
            </div>
            <div className="rounded-[2rem] bg-slate-100 px-6 py-5 shadow-xl shadow-slate-300/20">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Score</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">{score}</p>
              <p className="mt-3 text-sm text-slate-500">Level {level}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr,0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/20 xl:max-w-[38rem]">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-600">Now Falling</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{current.atom}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={resetGame}
                  className="rounded-3xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  リセット
                </button>
                <button
                  type="button"
                  onClick={() => setIsRunning(true)}
                  className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  スタート
                </button>
              </div>
            </div>

            <div className="mx-auto max-w-[23rem] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 rounded-[1.5rem] bg-slate-100 p-3">
                {displayRows.map((row, rowIndex) => (
                  <div
                    key={`row-${rowIndex}`}
                    className="grid grid-cols-6 gap-2"
                    style={rowIndex % 2 !== 0 ? { marginLeft: "1.5rem" } : undefined}
                  >
                    {row.map((cell, colIndex) => {
                      const styles = getAtomStyles(cell);
                      return (
                        <div
                          key={`cell-${rowIndex}-${colIndex}`}
                          className={`flex h-14 w-14 items-center justify-center border ${styles.borderClass} bg-gradient-to-br ${styles.bgClass} text-xl font-semibold`}
                          style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
                        >
                          <span className={styles.textClass}>{cell || ""}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] bg-slate-100 p-4 text-sm text-slate-700 shadow-sm">
              <p>{statusMessage}</p>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-xl shadow-slate-300/20">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">操作</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => moveCurrent(-1)}
                  disabled={!canMoveLeft}
                  className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← 左
                </button>
                <button
                  type="button"
                  onClick={() => moveCurrent(1)}
                  disabled={!canMoveRight}
                  className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  右 →
                </button>
                <button
                  type="button"
                  onClick={dropCurrent}
                  className="rounded-3xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  どーん！
                </button>
              </div>
              <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
                <p>キーボード: WASD / 矢印キー</p>
                <p className="mt-2">A / ← : 左移動</p>
                <p>D / → : 右移動</p>
                <p>S / ↓ : どーん落下</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">目標分子</h2>
              <div className="mt-4 space-y-3">
                {MOLECULES.map((molecule) => (
                  <div key={molecule.formula} className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                    <p className="text-sm text-slate-600">{molecule.description}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{molecule.formula}</p>
                    <p className="mt-1 text-sm text-slate-600">揃えると +{molecule.points} ポイント</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">次の原子</h2>
              <div className="mt-4 flex items-center justify-center rounded-3xl bg-slate-50 p-6 text-4xl font-bold text-slate-900">
                {next.atom}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
