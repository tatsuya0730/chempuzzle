import type { RankingEntry, TokenSymbol } from "@/types/game";

export const ROWS = 13;
export const COLS = 9;
export const BASE_FALL_INTERVAL = 660;
export const CLEAR_DELAY = 560;
export const MAX_LOG = 10;
export const MAX_CANDIDATES = 900;
export const INITIAL_CURRENT: TokenSymbol = "H";
export const INITIAL_QUEUE: TokenSymbol[] = ["O", "C", "N"];
export const INITIAL_HANDS = [0] as const;
export const STEP_X = 43;
export const STEP_Y = 37;
export const ROW_OFFSET = 22;
export const CELL_W = 36;
export const CELL_H = 40;
export const BOARD_WIDTH = COLS * STEP_X + ROW_OFFSET;
export const BOARD_HEIGHT = (ROWS - 1) * STEP_Y + CELL_H;
export const VALENCE_DIRECTIONS = [0, 1, 5, 2, 4, 3];
export const ALL_DIRECTIONS = [0, 1, 2, 3, 4, 5] as const;

export const RANKINGS: RankingEntry[] = [
  { rank: 1, name: "catalyst-k", score: 48240, molecule: "XeF4" },
  { rank: 2, name: "benzene-runner", score: 41780, molecule: "PhCH3" },
  { rank: 3, name: "salt-maker", score: 39210, molecule: "ZnCl2" },
  { rank: 4, name: "orbital-7", score: 35460, molecule: "CO2" },
  { rank: 5, name: "softdrop-lab", score: 31890, molecule: "H2O2" },
];
