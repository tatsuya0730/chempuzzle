import type { Grid, Match, Position, TokenSymbol } from "@/types/game";
import { COLS, MAX_CANDIDATES, ROWS } from "./config";
import { getNeighbors, handsConnect, positionKey, tileKey } from "./board";
import { MOLECULES } from "./molecules";
import { getMatchPoints } from "./scoring";

const SOLUBLE_TOKENS = new Set<TokenSymbol>(["Na", "Mg", "Ca", "Zn", "F", "Cl"]);
const COMBUSTIBILITY: Partial<Record<TokenSymbol, number>> = {
  H: 1,
  C: 2,
  S: 2,
  P: 2,
  Ph: 3,
};

const uniqueSortedPositions = (positions: Position[]) => {
  const byKey = new Map<string, Position>();
  positions.forEach((position) => byKey.set(positionKey(position), position));
  return [...byKey.values()].sort((a, b) => a.row - b.row || a.col - b.col);
};

const getPositionsInRange = (origin: Position, range: number) => {
  const found = new Map<string, Position>([[positionKey(origin), origin]]);
  let frontier = [origin];

  for (let distance = 0; distance < range; distance += 1) {
    const next: Position[] = [];
    frontier.forEach((position) => {
      getNeighbors(position.row, position.col).forEach((neighbor) => {
        const key = positionKey(neighbor);
        if (found.has(key)) return;
        found.set(key, neighbor);
        next.push(neighbor);
      });
    });
    frontier = next;
  }

  return [...found.values()];
};

const isCoExpandable = (match: Match, grid: Grid) => {
  if (match.molecule.formula !== "CO") return false;
  const carbonIndex = match.molecule.nodes.findIndex((node) => node === "C");
  const oxygenIndex = match.molecule.nodes.findIndex((node) => node === "O");
  const carbon = match.nodePositions[carbonIndex];
  const oxygen = match.nodePositions[oxygenIndex];
  return getNeighbors(carbon.row, carbon.col).some((neighbor) => {
    if (neighbor.row === oxygen.row && neighbor.col === oxygen.col) return false;
    const cell = grid[neighbor.row][neighbor.col];
    return cell === null || cell.token === "O";
  });
};

const applyWaterDissolve = (match: Match, grid: Grid): Match => {
  if (match.molecule.formula !== "H2O") return match;

  const moleculeKeys = new Set(match.positions.map(positionKey));
  const dissolved = match.positions.flatMap((position) =>
    getNeighbors(position.row, position.col).filter((neighbor) => {
      if (moleculeKeys.has(positionKey(neighbor))) return false;
      const cell = grid[neighbor.row][neighbor.col];
      return cell !== null && SOLUBLE_TOKENS.has(cell.token);
    }),
  );

  if (dissolved.length === 0) return match;

  return {
    ...match,
    positions: uniqueSortedPositions([...match.positions, ...dissolved]),
    points: match.points + dissolved.length * 35,
  };
};

const createFireBurst = (grid: Grid, position: Position): Match | null => {
  const adjacent = getNeighbors(position.row, position.col);
  const adjacentCombustibles = adjacent.filter((neighbor) => {
    const cell = grid[neighbor.row][neighbor.col];
    return cell !== null && (COMBUSTIBILITY[cell.token] ?? 0) > 0;
  });

  if (adjacentCombustibles.length === 0) {
    return {
      molecule: {
        formula: "Fire",
        name: "炎",
        nodes: ["Fire"],
        bonds: [],
        property: "単独で燃え尽きる",
        effect: "reactive",
        difficulty: 1,
        points: 40,
        ph: 7,
        acidity: "neutral",
      },
      nodePositions: [position],
      positions: [position],
      bonds: [],
      points: 40,
    };
  }

  const maxPower = adjacentCombustibles.reduce((power, neighbor) => {
    const cell = grid[neighbor.row][neighbor.col];
    return Math.max(power, cell ? COMBUSTIBILITY[cell.token] ?? 0 : 0);
  }, 1);
  const range = maxPower >= 3 ? 2 : 1;
  const burstPositions = getPositionsInRange(position, range).filter((target) => {
    const cell = grid[target.row][target.col];
    if (!cell) return false;
    if (cell.token === "Fire") return true;
    const combustibility = COMBUSTIBILITY[cell.token] ?? 0;
    if (combustibility > 0) return true;
    return maxPower >= 3 && cell.token !== "He" && cell.token !== "Ne" && cell.token !== "Ar";
  });

  return {
    molecule: {
      formula: "Fire",
      name: "炎",
      nodes: ["Fire"],
      bonds: [],
      property: maxPower >= 3 ? "強燃焼で周囲を巻き込む" : "可燃性原子を発火させる",
      effect: "energy",
      difficulty: 4 + maxPower,
      points: 120 + burstPositions.length * 40,
      ph: 7,
      acidity: "neutral",
    },
    nodePositions: [position],
    positions: uniqueSortedPositions(burstPositions),
    bonds: [],
    points: 120 + burstPositions.length * 40,
  };
};

const getPositionsByToken = (grid: Grid) => {
  const positionsByToken = new Map<TokenSymbol, Position[]>();

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = grid[row][col];
      if (!cell) continue;
      const positions = positionsByToken.get(cell.token) ?? [];
      positions.push({ row, col });
      positionsByToken.set(cell.token, positions);
    }
  }

  return positionsByToken;
};

export const findMoleculeCandidates = (grid: Grid): Match[] => {
  const candidates = new Map<string, Match>();
  const positionsByToken = getPositionsByToken(grid);

  for (const molecule of MOLECULES) {
    const walk = (nodeIndex: number, nodePositions: Position[], used: Set<string>) => {
      if (candidates.size >= MAX_CANDIDATES) return;
      if (nodeIndex === molecule.nodes.length) {
        const sorted = [...nodePositions].sort((a, b) => a.row - b.row || a.col - b.col);
        const key = `${molecule.formula}:${sorted.map(positionKey).join("|")}`;
        const bonds = molecule.bonds.map((bond) => ({
          from: nodePositions[bond.a],
          to: nodePositions[bond.b],
          order: bond.order ?? 1,
        }));
        const match = {
          molecule,
          nodePositions,
          positions: sorted,
          bonds,
          points: 0,
        };
        match.points = getMatchPoints(match);
        if (molecule.deferIfExpandableTo === "CO2" && isCoExpandable(match, grid)) return;
        candidates.set(key, match);
        return;
      }

      const expected = molecule.nodes[nodeIndex];
      const possiblePositions = positionsByToken.get(expected) ?? [];

      for (const pos of possiblePositions) {
        if (used.has(tileKey(pos.row, pos.col))) continue;
        const connectedToAssigned = molecule.bonds.every((bond) => {
          if (bond.a === nodeIndex && nodePositions[bond.b]) return handsConnect(grid, pos, nodePositions[bond.b]);
          if (bond.b === nodeIndex && nodePositions[bond.a]) return handsConnect(grid, pos, nodePositions[bond.a]);
          return true;
        });
        if (!connectedToAssigned) continue;

        const nextUsed = new Set(used);
        nextUsed.add(positionKey(pos));
        const nextPositions = [...nodePositions];
        nextPositions[nodeIndex] = pos;
        walk(nodeIndex + 1, nextPositions, nextUsed);
      }
    };

    walk(0, [], new Set());
  }

  return [...candidates.values()];
};

export const pickBestMatches = (grid: Grid) => {
  const used = new Set<string>();
  const candidates = findMoleculeCandidates(grid).map((match) => applyWaterDissolve(match, grid)).sort((a, b) => {
    const atomDelta = b.positions.length - a.positions.length;
    if (atomDelta !== 0) return atomDelta;
    const difficultyDelta = b.molecule.difficulty - a.molecule.difficulty;
    if (difficultyDelta !== 0) return difficultyDelta;
    return b.points - a.points;
  });

  const chosen: Match[] = [];
  for (const candidate of candidates) {
    if (candidate.positions.every((pos) => !used.has(positionKey(pos)))) {
      chosen.push(candidate);
      candidate.positions.forEach((pos) => used.add(positionKey(pos)));
    }
  }

  const fireBursts: Match[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      if (grid[row][col]?.token !== "Fire") continue;
      const burst = createFireBurst(grid, { row, col });
      if (burst && burst.positions.every((pos) => !used.has(positionKey(pos)))) {
        fireBursts.push(burst);
        burst.positions.forEach((pos) => used.add(positionKey(pos)));
      }
    }
  }

  return [...chosen, ...fireBursts];
};
