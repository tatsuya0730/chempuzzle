export type TokenSymbol =
  | "H"
  | "He"
  | "Li"
  | "Be"
  | "B"
  | "C"
  | "N"
  | "O"
  | "F"
  | "Ne"
  | "Na"
  | "Mg"
  | "Al"
  | "Si"
  | "P"
  | "S"
  | "Cl"
  | "Ar"
  | "K"
  | "Ca"
  | "Fe"
  | "Cu"
  | "Zn"
  | "Xe"
  | "Ph"
  | "Fire";

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;
export type CellTile = {
  token: TokenSymbol;
  hands: Direction[];
};
export type Cell = CellTile | null;
export type Grid = Cell[][];
export type Position = { row: number; col: number };
export type Tile = {
  token: TokenSymbol;
  hands: Direction[];
  row: number;
  col: number;
  screenX: number;
  screenY: number;
};
export type EffectKind = "clean" | "toxic" | "sleep" | "energy" | "reactive" | "salt" | "inert";
export type TokenCategory = "organic" | "nonmetal" | "halogen" | "metal" | "noble" | "group" | "gimmick";

export type TokenInfo = {
  label: string;
  valence: number;
  category: TokenCategory;
  shell: string;
  text: string;
  glow: string;
};

export type EffectStyle = {
  tag: string;
  ring: string;
  panel: string;
  stroke: string;
};

export type Bond = {
  a: number;
  b: number;
  order?: 1 | 2 | 3;
};

export type Molecule = {
  formula: string;
  name: string;
  nodes: TokenSymbol[];
  bonds: Bond[];
  property: string;
  effect: EffectKind;
  difficulty: number;
  points: number;
  ph: number;
  acidity: "acidic" | "neutral" | "basic";
  deferIfExpandableTo?: string;
  imageUrl?: string;
  fact?: string;
};

export type ResolvedBond = {
  from: Position;
  to: Position;
  order: 1 | 2 | 3;
};

export type Match = {
  molecule: Molecule;
  nodePositions: Position[];
  positions: Position[];
  bonds: ResolvedBond[];
  points: number;
};

export type ReactionLog = {
  id: number;
  formula: string;
  name: string;
  property: string;
  effect: EffectKind;
  ph: number;
  acidity: "acidic" | "neutral" | "basic";
  count: number;
  points: number;
  imageUrl?: string;
  fact?: string;
};

export type ComboNotice = {
  id: number;
  chain: number;
  matchCount: number;
  bonusPoints: number;
  gainedPoints: number;
  formulas: string[];
};

export type ResultSummary = {
  score: number;
  reactionCount: number;
  acidic: number;
  neutral: number;
  basic: number;
  dominant: "acidic" | "neutral" | "basic" | "none";
};

export type RankingEntry = {
  rank: number;
  name: string;
  username: string;
  score: number;
  molecule: string;
};
