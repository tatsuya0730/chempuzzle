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
  molecule("C2H6", "エタン", ["C", "C", "H", "H", "H", "H", "H", "H"], [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 1, b: 6 }, { a: 1, b: 7 }], "可燃性の炭化水素", "energy", 9, 780),
  molecule("C2H4", "エチレン", ["C", "C", "H", "H", "H", "H"], [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 1, b: 5 }], "植物ホルモン作用", "clean", 9, 650),
  molecule("C2H2", "アセチレン", ["C", "C", "H", "H"], [{ a: 0, b: 1, order: 3 }, { a: 0, b: 2 }, { a: 1, b: 3 }], "可燃性・三重結合", "energy", 8, 520),
  hub("CH4", "メタン", "C", ["H", "H", "H", "H"], "可燃性ガス", "energy", 6, 360),
  hub("BH3", "ボラン", "B", ["H", "H", "H"], "反応性が高い電子不足化合物", "reactive", 7, 350),
  hub("BF3", "三フッ化ホウ素", "B", ["F", "F", "F"], "強いルイス酸", "reactive", 7, 390),
  hub("BCl3", "三塩化ホウ素", "B", ["Cl", "Cl", "Cl"], "強いルイス酸・加水分解性", "reactive", 8, 420),
  hub("NH3", "アンモニア", "N", ["H", "H", "H"], "刺激臭・有毒性あり", "toxic", 6, 310),
  hub("PH3", "ホスフィン", "P", ["H", "H", "H"], "有毒・可燃性", "toxic", 7, 360),
  hub("PF3", "三フッ化リン", "P", ["F", "F", "F"], "有毒・反応性あり", "toxic", 8, 430),
  hub("PCl3", "三塩化リン", "P", ["Cl", "Cl", "Cl"], "水と激しく反応", "reactive", 8, 450),
  hub("CO2", "二酸化炭素", "C", ["O", "O"], "無毒・高濃度では窒息性", "clean", 5, 250, [2, 2]),
  hub("SO2", "二酸化硫黄", "S", ["O", "O"], "刺激臭・有毒", "toxic", 6, 310, [2, 2]),
  hub("SO3", "三酸化硫黄", "S", ["O", "O", "O"], "強い酸化性・発煙性", "reactive", 8, 430, [2, 2, 2]),
  hub("NO2", "二酸化窒素", "N", ["O", "O"], "有毒な赤褐色気体", "toxic", 6, 290, [1, 2]),
  molecule("N2O", "亜酸化窒素", ["N", "N", "O"], [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2 }], "麻酔作用", "sleep", 7, 300),
  molecule("H2O2", "過酸化水素", ["H", "O", "O", "H"], [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }], "酸化性が強い", "reactive", 7, 350),
  hub("H2S", "硫化水素", "S", ["H", "H"], "強い毒性・腐卵臭", "toxic", 5, 260),
  hub("H2O", "水", "O", ["H", "H"], "無毒・生命に必須", "clean", 3, 180),
  molecule("PhCH3", "トルエン", ["Ph", "C", "H", "H", "H"], [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 4 }], "可燃性の芳香族溶媒", "energy", 8, 520),
  molecule("PhOH", "フェノール", ["Ph", "O", "H"], [{ a: 0, b: 1 }, { a: 1, b: 2 }], "弱酸性・刺激性", "reactive", 7, 360),
  pair("PhH", "ベンゼン", ["Ph", "H"], "芳香族炭化水素", "energy", 5, 220),
  pair("PhF", "フルオロベンゼン", ["Ph", "F"], "芳香族ハロゲン化物", "toxic", 6, 250),
  pair("PhCl", "クロロベンゼン", ["Ph", "Cl"], "有機溶媒・有害", "toxic", 6, 250),
  pair("HF", "フッ化水素", ["H", "F"], "強い腐食性", "toxic", 5, 190),
  pair("HCl", "塩化水素", ["H", "Cl"], "強酸性・刺激性", "reactive", 4, 170),
  pair("CO", "一酸化炭素", ["C", "O"], "強い毒性", "toxic", 4, 140, 3, "CO2"),
  pair("NO", "一酸化窒素", ["N", "O"], "反応性の高い気体", "reactive", 5, 180, 2),
  pair("CS", "一硫化炭素", ["C", "S"], "不安定な硫黄化炭素", "reactive", 6, 210, 2),
  pair("O2", "酸素", ["O", "O"], "無毒・燃焼を助ける", "clean", 2, 95, 2),
  pair("N2", "窒素", ["N", "N"], "無毒・不活性", "clean", 2, 95, 3),
  pair("H2", "水素", ["H", "H"], "可燃性ガス", "energy", 2, 90),
  pair("F2", "フッ素", ["F", "F"], "極めて反応性が高い", "toxic", 4, 150),
  pair("Cl2", "塩素", ["Cl", "Cl"], "有毒な黄緑色気体", "toxic", 4, 150),
  pair("S2", "二硫黄", ["S", "S"], "硫黄蒸気成分", "reactive", 4, 140, 2),
  pair("P2", "二リン", ["P", "P"], "反応性の高いリン種", "reactive", 5, 170),
  pair("B2", "二ホウ素", ["B", "B"], "高エネルギーなホウ素種", "reactive", 6, 190),
  pair("NaF", "フッ化ナトリウム", ["Na", "F"], "無機塩", "salt", 5, 210),
  pair("NaCl", "塩化ナトリウム", ["Na", "Cl"], "無毒な塩", "salt", 5, 210),
  hub("Na2O", "酸化ナトリウム", "O", ["Na", "Na"], "水と反応して強塩基性", "reactive", 6, 290),
  hub("Na2S", "硫化ナトリウム", "S", ["Na", "Na"], "塩基性の硫化物", "salt", 6, 300),
  hub("MgF2", "フッ化マグネシウム", "Mg", ["F", "F"], "難溶性の無機塩", "salt", 6, 280),
  hub("MgCl2", "塩化マグネシウム", "Mg", ["Cl", "Cl"], "潮解性の塩", "salt", 6, 280),
  pair("MgO", "酸化マグネシウム", ["Mg", "O"], "無毒・難溶性", "salt", 6, 230),
  pair("MgS", "硫化マグネシウム", ["Mg", "S"], "金属硫化物", "salt", 6, 240),
  hub("CaF2", "フッ化カルシウム", "Ca", ["F", "F"], "蛍石の主成分", "salt", 6, 290),
  hub("CaCl2", "塩化カルシウム", "Ca", ["Cl", "Cl"], "吸湿性の塩", "salt", 6, 290),
  pair("CaO", "酸化カルシウム", ["Ca", "O"], "水と発熱反応", "reactive", 6, 240),
  pair("CaS", "硫化カルシウム", ["Ca", "S"], "金属硫化物", "salt", 7, 260),
  hub("FeCl2", "塩化鉄(II)", "Fe", ["Cl", "Cl"], "金属塩・酸化されやすい", "salt", 7, 330),
  hub("FeF2", "フッ化鉄(II)", "Fe", ["F", "F"], "金属フッ化物", "salt", 7, 330),
  pair("FeO", "酸化鉄(II)", ["Fe", "O"], "金属酸化物", "salt", 7, 260),
  pair("FeS", "硫化鉄", ["Fe", "S"], "金属硫化物", "salt", 7, 260),
  hub("CuCl2", "塩化銅(II)", "Cu", ["Cl", "Cl"], "青緑色の金属塩", "salt", 7, 340),
  hub("CuF2", "フッ化銅(II)", "Cu", ["F", "F"], "金属フッ化物", "salt", 7, 340),
  pair("CuO", "酸化銅(II)", ["Cu", "O"], "黒色の金属酸化物", "salt", 7, 270),
  pair("CuS", "硫化銅", ["Cu", "S"], "難溶性の沈殿", "salt", 7, 270),
  hub("ZnCl2", "塩化亜鉛", "Zn", ["Cl", "Cl"], "吸湿性の金属塩", "salt", 7, 350),
  hub("ZnF2", "フッ化亜鉛", "Zn", ["F", "F"], "金属フッ化物", "salt", 7, 350),
  pair("ZnO", "酸化亜鉛", ["Zn", "O"], "白色顔料にも使われる", "salt", 7, 280),
  pair("ZnS", "硫化亜鉛", ["Zn", "S"], "蛍光材料にも使われる", "salt", 7, 280),
  pair("HeH+", "ヘリウム水素イオン", ["He", "H"], "宇宙化学で知られる希ガスイオン", "inert", 11, 520),
  pair("NeH+", "ネオン水素イオン", ["Ne", "H"], "極めて作りにくい希ガスイオン", "inert", 12, 560),
  pair("ArH+", "アルゴン水素イオン", ["Ar", "H"], "星間空間で観測される希ガスイオン", "inert", 12, 590),
  molecule("HArF", "アルゴンフルオロ水素化物", ["H", "Ar", "F"], [{ a: 0, b: 1 }, { a: 1, b: 2 }], "低温でのみ安定な希ガス化合物", "inert", 13, 720),
  hub("XeF2", "二フッ化キセノン", "Xe", ["F", "F"], "希ガス化合物・強いフッ素化剤", "inert", 10, 520),
  hub("XeF4", "四フッ化キセノン", "Xe", ["F", "F", "F", "F"], "希ガス化合物・強酸化性", "inert", 12, 760),
];
