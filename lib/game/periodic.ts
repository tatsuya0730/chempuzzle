import type { TokenSymbol } from "@/types/game";

export type PeriodicElement = {
  atomicNumber: number;
  symbol: TokenSymbol;
  name: string;
  group: number;
  period: number;
};

export const PERIODIC_ELEMENTS: PeriodicElement[] = [
  { atomicNumber: 1, symbol: "H", name: "Hydrogen", group: 1, period: 1 },
  { atomicNumber: 2, symbol: "He", name: "Helium", group: 18, period: 1 },
  { atomicNumber: 3, symbol: "Li", name: "Lithium", group: 1, period: 2 },
  { atomicNumber: 4, symbol: "Be", name: "Beryllium", group: 2, period: 2 },
  { atomicNumber: 5, symbol: "B", name: "Boron", group: 13, period: 2 },
  { atomicNumber: 6, symbol: "C", name: "Carbon", group: 14, period: 2 },
  { atomicNumber: 7, symbol: "N", name: "Nitrogen", group: 15, period: 2 },
  { atomicNumber: 8, symbol: "O", name: "Oxygen", group: 16, period: 2 },
  { atomicNumber: 9, symbol: "F", name: "Fluorine", group: 17, period: 2 },
  { atomicNumber: 10, symbol: "Ne", name: "Neon", group: 18, period: 2 },
  { atomicNumber: 11, symbol: "Na", name: "Sodium", group: 1, period: 3 },
  { atomicNumber: 12, symbol: "Mg", name: "Magnesium", group: 2, period: 3 },
  { atomicNumber: 13, symbol: "Al", name: "Aluminium", group: 13, period: 3 },
  { atomicNumber: 14, symbol: "Si", name: "Silicon", group: 14, period: 3 },
  { atomicNumber: 15, symbol: "P", name: "Phosphorus", group: 15, period: 3 },
  { atomicNumber: 16, symbol: "S", name: "Sulfur", group: 16, period: 3 },
  { atomicNumber: 17, symbol: "Cl", name: "Chlorine", group: 17, period: 3 },
  { atomicNumber: 18, symbol: "Ar", name: "Argon", group: 18, period: 3 },
  { atomicNumber: 19, symbol: "K", name: "Potassium", group: 1, period: 4 },
  { atomicNumber: 20, symbol: "Ca", name: "Calcium", group: 2, period: 4 },
];

export const DEFAULT_GAME_ATOMS = PERIODIC_ELEMENTS.map((element) => element.symbol);
export const ATOM_SELECTION_STORAGE_KEY = "chempuzzle.enabledAtoms";

export const normalizeAtomSelection = (symbols: unknown): TokenSymbol[] => {
  if (!Array.isArray(symbols)) return DEFAULT_GAME_ATOMS;
  const allowed = new Set(PERIODIC_ELEMENTS.map((element) => element.symbol));
  const selected = symbols.filter((symbol): symbol is TokenSymbol => typeof symbol === "string" && allowed.has(symbol as TokenSymbol));
  return selected.length >= 2 ? selected : DEFAULT_GAME_ATOMS;
};
