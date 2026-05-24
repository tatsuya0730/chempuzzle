"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComboNotice, Match, ReactionLog, ResultSummary, TokenSymbol } from "@/types/game";
import { CLEAR_DELAY, COLS, INITIAL_CURRENT, INITIAL_HANDS, INITIAL_QUEUE, MAX_LOG, ROWS } from "./config";
import { compressGrid, createEmptyGrid, getCurrentVisualCenter, getDropDestination, getNextDropPosition, makeTile, tileKey, positionKey } from "./board";
import { getChainBonus, getFallInterval, getWeightedToken } from "./scoring";
import { pickBestMatches } from "./reactions";

export function useChemPuzzleGame() {
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [current, setCurrent] = useState(() => makeTile(INITIAL_CURRENT, [...INITIAL_HANDS]));
  const [nextQueue, setNextQueue] = useState<TokenSymbol[]>(INITIAL_QUEUE);
  const [clearing, setClearing] = useState<Map<string, Match>>(new Map());
  const [clearingMatches, setClearingMatches] = useState<Match[]>([]);
  const [reactionLog, setReactionLog] = useState<ReactionLog[]>([]);
  const [comboNotice, setComboNotice] = useState<ComboNotice | null>(null);
  const logId = useRef(0);
  const comboId = useRef(0);
  const chainDepth = useRef(0);
  const reactionInFlight = useRef(false);
  const reactionTimers = useRef<number[]>([]);
  const comboTimer = useRef<number | null>(null);

  const canMoveTo = useCallback(
    (row: number, col: number) => {
      if (col < 0 || col >= COLS || row >= ROWS) return false;
      return row < 0 || grid[row][col] === null;
    },
    [grid],
  );

  const spawnNext = useCallback(() => {
    const [token, ...rest] = nextQueue;
    setCurrent(makeTile(token));
    setNextQueue([...rest, getWeightedToken(level)]);
  }, [level, nextQueue]);

  const settleTile = useCallback(
    (row: number, col: number) => {
      if (row < 0) {
        setGameOver(true);
        setIsRunning(false);
        return;
      }

      setGrid((prevGrid) => {
        const nextGrid = prevGrid.map((cells) => [...cells]);
        nextGrid[row][col] = { token: current.token, hands: current.hands };
        return compressGrid(nextGrid);
      });
      spawnNext();
    },
    [current.hands, current.token, spawnNext],
  );

  const moveCurrent = useCallback(
    (direction: -1 | 1) => {
      if (gameOver || isResolving || !isRunning) return;
      const nextCol = current.col + direction;
      if (canMoveTo(current.row, nextCol)) {
        setCurrent((prev) => ({
          ...prev,
          col: nextCol,
          screenX: getCurrentVisualCenter(prev.row, nextCol).x,
        }));
      }
    },
    [canMoveTo, current.col, current.row, gameOver, isResolving, isRunning],
  );

  const softDrop = useCallback(() => {
    if (gameOver || isResolving || !isRunning) return;

    const nextPosition = getNextDropPosition(grid, current);
    if (nextPosition === null) {
      settleTile(current.row, current.col);
      return;
    }

    const { x, y } = getCurrentVisualCenter(nextPosition.row, nextPosition.col);
    setCurrent((prev) => ({
      ...prev,
      row: nextPosition.row,
      col: nextPosition.col,
      screenX: x,
      screenY: y,
    }));
  }, [current, gameOver, grid, isResolving, isRunning, settleTile]);

  const hardDrop = useCallback(() => {
    if (gameOver || isResolving || !isRunning) return;
    const landing = getDropDestination(grid, current);
    settleTile(landing.row, landing.col);
  }, [current, gameOver, grid, isResolving, isRunning, settleTile]);

  const resetGame = useCallback(() => {
    reactionTimers.current.forEach((timer) => window.clearTimeout(timer));
    reactionTimers.current = [];
    if (comboTimer.current !== null) {
      window.clearTimeout(comboTimer.current);
      comboTimer.current = null;
    }
    reactionInFlight.current = false;
    chainDepth.current = 0;
    setGrid(createEmptyGrid());
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsResolving(false);
    setIsRunning(true);
    setCurrent(makeTile(getWeightedToken(1)));
    setNextQueue([getWeightedToken(1), getWeightedToken(1), getWeightedToken(1)]);
    setClearing(new Map());
    setClearingMatches([]);
    setReactionLog([]);
    setComboNotice(null);
  }, []);

  const toggleRunning = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    setIsRunning((value) => !value);
  }, [gameOver, resetGame]);

  useEffect(() => {
    if (!isRunning || gameOver || isResolving) return;
    const interval = setInterval(softDrop, getFallInterval(level));
    return () => clearInterval(interval);
  }, [gameOver, isResolving, isRunning, level, softDrop]);

  useEffect(() => {
    if (reactionInFlight.current) return;
    const matches = pickBestMatches(grid);
    if (matches.length === 0) {
      chainDepth.current = 0;
      return;
    }
    reactionInFlight.current = true;
    chainDepth.current += 1;

    const nextClearing = new Map<string, Match>();
    matches.forEach((match) => match.positions.forEach((pos) => nextClearing.set(positionKey(pos), match)));
    const basePoints = matches.reduce((sum, match) => sum + match.points, 0);
    const chainBonus = getChainBonus(basePoints, matches.length);
    const gained = basePoints + chainBonus;
    const nextComboNotice: ComboNotice = {
      id: (comboId.current += 1),
      chain: chainDepth.current,
      matchCount: matches.length,
      bonusPoints: chainBonus,
      gainedPoints: gained,
      formulas: matches.map((match) => match.molecule.formula),
    };

    const startTimer = window.setTimeout(() => {
      setIsResolving(true);
      setClearing(nextClearing);
      setClearingMatches(matches);
      setComboNotice(nextComboNotice);
      if (comboTimer.current !== null) {
        window.clearTimeout(comboTimer.current);
      }
      comboTimer.current = window.setTimeout(() => {
        setComboNotice(null);
        comboTimer.current = null;
      }, CLEAR_DELAY + 760);
      setScore((prev) => prev + gained);
      setLevel((prev) => Math.min(20, prev + matches.length));
      setReactionLog((prev) =>
        [
          ...matches.map((match) => ({
            id: (logId.current += 1),
            formula: match.molecule.formula,
            name: match.molecule.name,
            property: match.molecule.property,
            effect: match.molecule.effect,
            ph: match.molecule.ph,
            acidity: match.molecule.acidity,
            count: match.positions.length,
            points: match.points + (matches.length > 1 ? Math.round(chainBonus / matches.length) : 0),
            imageUrl: match.molecule.imageUrl,
          })),
          ...prev,
        ].slice(0, MAX_LOG),
      );
    }, 0);

    const clearTimer = window.setTimeout(() => {
      setGrid((prevGrid) => {
        const removed = prevGrid.map((row, rowIndex) => row.map((cell, colIndex) => (nextClearing.has(tileKey(rowIndex, colIndex)) ? null : cell)));
        return compressGrid(removed);
      });
      setClearing(new Map());
      setClearingMatches([]);
      setIsResolving(false);
      reactionInFlight.current = false;
      reactionTimers.current = [];
    }, CLEAR_DELAY);

    reactionTimers.current = [startTimer, clearTimer];

    return () => {
      window.clearTimeout(startTimer);
    };
  }, [grid]);

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
          softDrop();
          break;
        case " ":
          event.preventDefault();
          hardDrop();
          break;
        case "Enter":
          event.preventDefault();
          toggleRunning();
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hardDrop, moveCurrent, softDrop, toggleRunning]);

  const displayGrid = useMemo(() => grid, [grid]);
  const predictedLanding = useMemo(() => getDropDestination(grid, current), [current, grid]);
  const resultSummary = useMemo<ResultSummary>(() => {
    const counts = reactionLog.reduce(
      (acc, entry) => {
        acc[entry.acidity] += 1;
        return acc;
      },
      { acidic: 0, neutral: 0, basic: 0 },
    );
    const entries = Object.entries(counts) as Array<[ResultSummary["dominant"], number]>;
    const [dominant, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return {
      score,
      reactionCount: reactionLog.length,
      acidic: counts.acidic,
      neutral: counts.neutral,
      basic: counts.basic,
      dominant: count > 0 ? dominant : "none",
    };
  }, [reactionLog, score]);

  return {
    score,
    level,
    gameOver,
    isRunning,
    current,
    nextQueue,
    clearing,
    clearingMatches,
    comboNotice,
    reactionLog,
    resultSummary,
    displayGrid,
    predictedLanding,
    resetGame,
    toggleRunning,
  };
}
