import type { Bond, EffectKind, Molecule, TokenSymbol } from "@/types/game";

const classifyPh = (ph: number): Molecule["acidity"] => {
  if (ph < 6.5) return "acidic";
  if (ph > 7.5) return "basic";
  return "neutral";
};

const estimatePh = (formula: string, effect: EffectKind) => {
  if (formula.includes("HCl") || formula === "HF" || formula === "H2S" || formula.includes("PhOH")) return 2.5;
  if (formula.includes("NH3") || formula.includes("Na2O") || formula.includes("CaO")) return 10.5;
  if (formula.includes("SO2") || formula.includes("SO3") || formula.includes("NO2") || formula.includes("CO2")) return 5.4;
  if (effect === "salt") return 7.2;
  if (effect === "toxic" || effect === "reactive") return 6.2;
  return 7;
};

const molecule = (
  formula: string,
  name: string,
  nodes: TokenSymbol[],
  bonds: Bond[],
  property: string,
  effect: EffectKind,
  difficulty: number,
  points: number,
  deferIfExpandableTo?: string,
): Molecule => {
  const ph = estimatePh(formula, effect);
  return { formula, name, nodes, bonds, property, effect, difficulty, points, ph, acidity: classifyPh(ph), deferIfExpandableTo };
};

const pair = (
  formula: string,
  name: string,
  nodes: [TokenSymbol, TokenSymbol],
  property: string,
  effect: EffectKind,
  difficulty: number,
  points: number,
  order: 1 | 2 | 3 = 1,
  deferIfExpandableTo?: string,
) => molecule(formula, name, nodes, [{ a: 0, b: 1, order }], property, effect, difficulty, points, deferIfExpandableTo);

const hub = (
  formula: string,
  name: string,
  center: TokenSymbol,
  leaves: TokenSymbol[],
  property: string,
  effect: EffectKind,
  difficulty: number,
  points: number,
  orders?: Array<1 | 2 | 3>,
) =>
  molecule(
    formula,
    name,
    [center, ...leaves],
    leaves.map((_, index) => ({ a: 0, b: index + 1, order: orders?.[index] ?? 1 })),
    property,
    effect,
    difficulty,
    points,
  );

export const MOLECULES: Molecule[] = [
  hub("CH4", "メタン", "C", ["H", "H", "H", "H"], "可燃性ガス", "energy", 6, 360),
  hub("NH3", "アンモニア", "N", ["H", "H", "H"], "刺激臭・有毒性あり", "toxic", 6, 310),
  hub("CO2", "二酸化炭素", "C", ["O", "O"], "無毒・高濃度では窒息性", "clean", 5, 250, [2, 2]),
  hub("SO2", "二酸化硫黄", "S", ["O", "O"], "刺激臭・有毒", "toxic", 6, 310, [2, 2]),
  hub("NO2", "二酸化窒素", "N", ["O", "O"], "有毒な赤褐色気体", "toxic", 6, 290, [1, 2]),
  molecule("N2O", "亜酸化窒素", ["N", "N", "O"], [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2 }], "麻酔作用", "sleep", 7, 300),
  molecule("H2O2", "過酸化水素", ["H", "O", "O", "H"], [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }], "酸化性が強い", "reactive", 7, 350),
  hub("H2O", "水", "O", ["H", "H"], "無毒・生命に必須", "clean", 3, 180),
  pair("HF", "フッ化水素", ["H", "F"], "強い腐食性", "toxic", 5, 190),
  pair("HCl", "塩化水素", ["H", "Cl"], "強酸性・刺激性", "reactive", 4, 170),
  pair("CO", "一酸化炭素", ["C", "O"], "強い毒性", "toxic", 4, 140, 3, "CO2"),
  pair("NO", "一酸化窒素", ["N", "O"], "反応性の高い気体", "reactive", 5, 180, 2),
  pair("O2", "酸素", ["O", "O"], "無毒・燃焼を助ける", "clean", 2, 95, 2),
  pair("N2", "窒素", ["N", "N"], "無毒・不活性", "clean", 2, 95, 3),
  pair("H2", "水素", ["H", "H"], "可燃性ガス", "energy", 2, 90),
  pair("F2", "フッ素", ["F", "F"], "極めて反応性が高い", "toxic", 4, 150),
  pair("Cl2", "塩素", ["Cl", "Cl"], "有毒な黄緑色気体", "toxic", 4, 150),
  pair("LiF", "フッ化リチウム", ["Li", "F"], "安定な無機塩", "salt", 5, 200),
  pair("LiCl", "塩化リチウム", ["Li", "Cl"], "吸湿性の無機塩", "salt", 5, 200),
  pair("NaF", "フッ化ナトリウム", ["Na", "F"], "無機塩", "salt", 5, 210),
  pair("NaCl", "塩化ナトリウム", ["Na", "Cl"], "無毒な塩", "salt", 5, 210),
  pair("KCl", "塩化カリウム", ["K", "Cl"], "一般的な無機塩", "salt", 5, 220),
  pair("MgO", "酸化マグネシウム", ["Mg", "O"], "無毒・難溶性", "salt", 6, 230),
  pair("BeO", "酸化ベリリウム", ["Be", "O"], "安定な酸化物", "salt", 7, 260),
  molecule("Al2O3", "酸化アルミニウム", ["Al", "Al", "O", "O", "O"], [{ a: 0, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 3 }, { a: 1, b: 4 }], "安定な酸化物", "salt", 7, 360),
  hub("SiO2", "二酸化ケイ素", "Si", ["O", "O"], "砂や石英の主成分", "clean", 7, 340, [2, 2]),
  hub("CaCl2", "塩化カルシウム", "Ca", ["Cl", "Cl"], "吸湿性の塩", "salt", 6, 290),
  pair("CaO", "酸化カルシウム", ["Ca", "O"], "水と発熱反応", "reactive", 6, 240),
];
