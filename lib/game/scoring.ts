import type { Match, TokenSymbol } from "@/types/game";
import { BASE_FALL_INTERVAL } from "./config";

export const formatScore = (value: number) => value.toLocaleString("ja-JP");

export const getWeightedToken = (level: number): TokenSymbol => {
  const base: Array<[TokenSymbol, number]> = [
    ["H", 18],
    ["O", 15],
    ["C", 12],
    ["N", 10],
    ["S", 7],
    ["F", 7],
    ["Cl", 6],
    ["P", 4 + Math.floor(level / 4)],
    ["B", 4 + Math.floor(level / 4)],
    ["Ph", level >= 2 ? 4 + Math.floor(level / 5) : 1],
    ["Na", level >= 3 ? 2 + Math.floor(level / 5) : 0.6],
    ["Mg", level >= 4 ? 1.5 + Math.floor(level / 6) : 0.4],
    ["Ca", level >= 5 ? 1.3 + Math.floor(level / 7) : 0.25],
    ["Fe", level >= 6 ? 1.1 + Math.floor(level / 8) : 0.15],
    ["Cu", level >= 7 ? 1 + Math.floor(level / 8) : 0.1],
    ["Zn", level >= 8 ? 1 + Math.floor(level / 8) : 0.1],
    ["He", level >= 6 ? 0.45 + level * 0.08 : 0.05],
    ["Ne", level >= 7 ? 0.4 + level * 0.07 : 0.04],
    ["Ar", level >= 8 ? 0.35 + level * 0.06 : 0.03],
    ["Xe", level >= 9 ? 0.55 + level * 0.08 : 0.04],
  ];
  const total = base.reduce((sum, [, weight]) => sum + weight, 0);
  let pick = Math.random() * total;
  for (const [token, weight] of base) {
    pick -= weight;
    if (pick <= 0) return token;
  }
  return "H";
};

export const getFallInterval = (level: number) => Math.max(180, BASE_FALL_INTERVAL - level * 34);

export const getMatchPoints = (match: Match) => match.molecule.points + match.molecule.nodes.length * 24 + match.molecule.difficulty * 18;

export const getChainBonus = (basePoints: number, matchCount: number) => (matchCount > 1 ? Math.round(basePoints * (matchCount - 1) * 0.18) : 0);
