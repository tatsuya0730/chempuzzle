import type { EffectKind, Molecule, TokenSymbol } from "@/types/game";
import { MOLECULES } from "./molecules";
import { getMatchPoints } from "./scoring";

export type PhysicsEntityKind = "atom" | "fragment" | "molecule";

export type PhysicsEntity = {
  id: number;
  kind: PhysicsEntityKind;
  atoms: TokenSymbol[];
  formula: string;
  molecule?: Molecule;
  radius: number;
};

export type PhysicsReaction =
  | {
      type: "cluster";
      entity: Omit<PhysicsEntity, "id">;
    }
  | {
      type: "clear";
      molecule: Molecule;
      points: number;
      formulas: string[];
    }
  | {
      type: "burst";
      points: number;
      formulas: string[];
      effect: EffectKind;
    };

const ATOM_RADII: Record<TokenSymbol, number> = {
  H: 15,
  He: 18,
  Li: 34,
  Be: 27,
  B: 27,
  C: 25,
  N: 23,
  O: 24,
  F: 21,
  Ne: 20,
  Na: 34,
  Mg: 33,
  Al: 32,
  Si: 30,
  P: 32,
  S: 31,
  Cl: 30,
  Ar: 28,
  K: 39,
  Ca: 38,
  Fe: 31,
  Cu: 32,
  Zn: 33,
  Xe: 34,
  Ph: 38,
  Fire: 24,
};

const FORMULA_ORDER: TokenSymbol[] = ["Ph", "C", "H", "B", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Li", "Be", "Fe", "Cu", "Zn", "He", "Xe", "Fire"];

const atomCounts = (atoms: TokenSymbol[]) => {
  const counts = new Map<TokenSymbol, number>();
  atoms.forEach((atom) => counts.set(atom, (counts.get(atom) ?? 0) + 1));
  return counts;
};

const sameComposition = (left: TokenSymbol[], right: TokenSymbol[]) => {
  if (left.length !== right.length) return false;
  const leftCounts = atomCounts(left);
  const rightCounts = atomCounts(right);
  if (leftCounts.size !== rightCounts.size) return false;
  for (const [atom, count] of leftCounts) {
    if (rightCounts.get(atom) !== count) return false;
  }
  return true;
};

const isSubsetComposition = (candidate: TokenSymbol[], target: TokenSymbol[]) => {
  if (candidate.length >= target.length) return false;
  const candidateCounts = atomCounts(candidate);
  const targetCounts = atomCounts(target);
  for (const [atom, count] of candidateCounts) {
    if ((targetCounts.get(atom) ?? 0) < count) return false;
  }
  return true;
};

const isExpandable = (atoms: TokenSymbol[]) => MOLECULES.some((molecule) => isSubsetComposition(atoms, molecule.nodes));

export const getEntityRadius = (atoms: TokenSymbol[]) => {
  const area = atoms.reduce((sum, atom) => sum + ATOM_RADII[atom] ** 2, 0);
  const radius = atoms.length <= 1 ? ATOM_RADII[atoms[0]] : Math.sqrt(area) * 0.74 + Math.min(12, atoms.length * 1.8);
  return Math.max(15, Math.min(54, Math.round(radius)));
};

export const makeFormula = (atoms: TokenSymbol[]) => {
  const counts = atomCounts(atoms);
  return FORMULA_ORDER.map((atom) => {
    const count = counts.get(atom);
    if (!count) return "";
    if (atom === "Fire") return count > 1 ? `Fire${count}` : "Fire";
    return `${atom}${count > 1 ? count : ""}`;
  }).join("");
};

export const createAtomEntity = (token: TokenSymbol): Omit<PhysicsEntity, "id"> => ({
  kind: "atom",
  atoms: [token],
  formula: token,
  radius: getEntityRadius([token]),
});

export const resolvePhysicsReaction = (first: PhysicsEntity, second: PhysicsEntity): PhysicsReaction | null => {
  const atoms = [...first.atoms, ...second.atoms];
  if (atoms.length > 8) return null;

  const exact = MOLECULES.filter((molecule) => sameComposition(atoms, molecule.nodes)).sort((a, b) => b.points - a.points)[0];
  if (exact) {
    const expandable = exact.deferIfExpandableTo || isExpandable(exact.nodes);
    if (expandable) {
      return {
        type: "cluster",
        entity: {
          kind: "molecule",
          atoms,
          formula: exact.formula,
          molecule: exact,
          radius: getEntityRadius(atoms),
        },
      };
    }

    return {
      type: "clear",
      molecule: exact,
      points: getMatchPoints({
        molecule: exact,
        nodePositions: [],
        positions: [],
        bonds: [],
        points: exact.points,
      }),
      formulas: [exact.formula],
    };
  }

  if (!isExpandable(atoms)) return null;

  return {
    type: "cluster",
    entity: {
      kind: "fragment",
      atoms,
      formula: makeFormula(atoms),
      radius: getEntityRadius(atoms),
    },
  };
};
