import type { Match, TokenSymbol } from "@/types/game";
import { BASE_FALL_INTERVAL } from "./config";
import { DEFAULT_GAME_ATOMS } from "./periodic";

export const formatScore = (value: number) => value.toLocaleString("ja-JP");

export const getWeightedToken = (level: number, enabledAtoms: TokenSymbol[] = DEFAULT_GAME_ATOMS): TokenSymbol => {
  const enabled = new Set(enabledAtoms);
  const weights: Array<[TokenSymbol, number]> = [
    ["H", 18],
    ["He", 0.7],
    ["Li", 2.5 + level * 0.04],
    ["Be", 1.4 + level * 0.03],
    ["B", 4 + Math.floor(level / 4)],
    ["C", 12],
    ["N", 10],
    ["O", 15],
    ["F", 6],
    ["Ne", 0.7],
    ["Na", level >= 3 ? 2 + Math.floor(level / 5) : 0.6],
    ["Mg", level >= 4 ? 1.5 + Math.floor(level / 6) : 0.4],
    ["Al", level >= 4 ? 1.4 + Math.floor(level / 6) : 0.35],
    ["Si", level >= 4 ? 2 + Math.floor(level / 6) : 0.5],
    ["P", 4 + Math.floor(level / 4)],
    ["S", 7],
    ["Cl", 6],
    ["Ar", 0.5 + level * 0.03],
    ["K", level >= 5 ? 1.4 + Math.floor(level / 6) : 0.35],
    ["Ca", level >= 5 ? 1.3 + Math.floor(level / 7) : 0.25],
  ];
  const base = weights.filter(([token]) => enabled.has(token));
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
