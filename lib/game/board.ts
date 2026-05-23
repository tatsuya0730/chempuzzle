import type { CellTile, Direction, Grid, Position, Tile, TokenSymbol } from "@/types/game";
import { ALL_DIRECTIONS, CELL_H, CELL_W, COLS, ROW_OFFSET, ROWS, STEP_X, STEP_Y } from "./config";

export const createEmptyGrid = (): Grid => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
export const positionKey = ({ row, col }: Position) => `${row},${col}`;
export const tileKey = (row: number, col: number) => `${row},${col}`;
export const inBounds = (row: number, col: number) => row >= 0 && row < ROWS && col >= 0 && col < COLS;

export const createHands = (): Direction[] => [];

export const createCellTile = (token: TokenSymbol): CellTile => ({ token, hands: createHands() });

export const getCurrentVisualCenter = (row: number, col: number) => ({
  x: col * STEP_X + CELL_W / 2,
  y: row * STEP_Y + CELL_H / 2,
});

export const makeTile = (token: TokenSymbol, hands = createHands()): Tile => {
  const row = -1;
  const col = Math.floor(COLS / 2);
  const { x, y } = getCurrentVisualCenter(row, col);

  return { token, hands, row, col, screenX: x, screenY: y };
};

export const getCellCenter = ({ row, col }: Position) => ({
  x: (row % 2 === 0 ? 0 : ROW_OFFSET) + col * STEP_X + CELL_W / 2,
  y: row * STEP_Y + CELL_H / 2,
});

export const getNeighbors = (row: number, col: number): Position[] => {
  const even = row % 2 === 0;
  const offsets = even
    ? [[0, -1], [0, 1], [-1, -1], [-1, 0], [1, -1], [1, 0]]
    : [[0, -1], [0, 1], [-1, 0], [-1, 1], [1, 0], [1, 1]];

  return offsets.map(([dr, dc]) => ({ row: row + dr, col: col + dc })).filter((pos) => inBounds(pos.row, pos.col));
};

export const areAdjacent = (a: Position, b: Position) => getNeighbors(a.row, a.col).some((pos) => pos.row === b.row && pos.col === b.col);

export const getNeighborAtDirection = (row: number, col: number, direction: Direction): Position | null => {
  const even = row % 2 === 0;
  const offsets = even
    ? [[0, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]]
    : [[0, 1], [1, 1], [1, 0], [0, -1], [-1, 0], [-1, 1]];
  const [dr, dc] = offsets[direction];
  const next = { row: row + dr, col: col + dc };
  return inBounds(next.row, next.col) ? next : null;
};

export const getDirectionBetween = (from: Position, to: Position): Direction | null => {
  for (const direction of ALL_DIRECTIONS) {
    const neighbor = getNeighborAtDirection(from.row, from.col, direction);
    if (neighbor && neighbor.row === to.row && neighbor.col === to.col) return direction;
  }
  return null;
};

export const getOppositeDirection = (direction: Direction): Direction => ((direction + 3) % 6) as Direction;

export const handsConnect = (grid: Grid, a: Position, b: Position) => {
  const from = grid[a.row][a.col];
  const to = grid[b.row][b.col];
  if (!from || !to) return false;
  return areAdjacent(a, b);
};

export const compressGrid = (grid: Grid) => {
  const nextGrid = grid.map((row) => [...row]);
  const centerCol = (COLS - 1) / 2;

  const pickDestination = (from: Position, candidates: Position[]) =>
    [...candidates].sort((left, right) => {
      const centerDelta = Math.abs(left.col - centerCol) - Math.abs(right.col - centerCol);
      if (centerDelta !== 0) return centerDelta;
      const travelDelta = Math.abs(left.col - from.col) - Math.abs(right.col - from.col);
      if (travelDelta !== 0) return travelDelta;
      return left.col - right.col;
    })[0];

  let moved = true;
  while (moved) {
    moved = false;

    for (let row = ROWS - 2; row >= 0; row -= 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = nextGrid[row][col];
        if (!cell) continue;

        const supports = [getNeighborAtDirection(row, col, 1), getNeighborAtDirection(row, col, 2)].filter((pos): pos is Position => pos !== null);
        const openSupports = supports.filter((pos) => nextGrid[pos.row][pos.col] === null);

        if (openSupports.length === 0) continue;

        const destination = pickDestination({ row, col }, openSupports);
        nextGrid[destination.row][destination.col] = cell;
        nextGrid[row][col] = null;
        moved = true;
      }
    }
  }

  return nextGrid;
};

export const getDownSupport = (row: number, col: number) => {
  const nextRow = row + 1;
  const current = { row: nextRow, col };
  const side = row % 2 === 0 ? { row: nextRow, col: col - 1 } : { row: nextRow, col: col + 1 };

  return { current, side };
};

export const getSlideTarget = (grid: Grid, row: number, col: number): Position | null => {
  const { current, side } = getDownSupport(row, col);

  const currentInBounds = inBounds(current.row, current.col);
  const sideInBounds = inBounds(side.row, side.col);
  const currentOccupied = currentInBounds && grid[current.row][current.col] !== null;
  const sideOccupied = sideInBounds && grid[side.row][side.col] !== null;

  if (currentOccupied && !sideOccupied && sideInBounds && grid[side.row][side.col] === null) {
    const next = getSlideTarget(grid, side.row, side.col);
    return next ?? side;
  }

  if (sideOccupied && !currentOccupied && currentInBounds && grid[current.row][current.col] === null) {
    const next = getSlideTarget(grid, current.row, current.col);
    return next ?? current;
  }

  return null;
};

export const getNextDropPosition = (grid: Grid, current: Tile): Position | null => {
  const nextRow = current.row + 1;

  if (nextRow >= ROWS) {
    return null;
  }

  if (grid[nextRow][current.col] !== null) {
    return null;
  }

  return { row: nextRow, col: current.col };
};

export const getDropDestination = (grid: Grid, current: Tile): Position => {
  let row = current.row;
  const col = current.col;

  while (true) {
    const nextRow = row + 1;

    if (nextRow >= ROWS) {
      return { row: ROWS - 1, col };
    }

    if (grid[nextRow][col] === null) {
      row = nextRow;
      continue;
    }

    return { row, col };
  }
};

export const mergeCurrentIntoGrid = (grid: Grid, current: Tile): Grid => {
  const display = grid.map((row) => [...row]);
  if (current.row >= 0 && inBounds(current.row, current.col)) {
    display[current.row][current.col] = { token: current.token, hands: current.hands };
  }
  return display;
};
