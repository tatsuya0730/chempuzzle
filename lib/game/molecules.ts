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
  fact?: string,
): Molecule => {
  const ph = estimatePh(formula, effect);
  return { formula, name, nodes, bonds, property, effect, difficulty, points, ph, acidity: classifyPh(ph), deferIfExpandableTo, fact };
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
  fact?: string,
) => molecule(formula, name, nodes, [{ a: 0, b: 1, order }], property, effect, difficulty, points, deferIfExpandableTo, fact);

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
  fact?: string,
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
    undefined,
    fact,
  );

export const MOLECULES: Molecule[] = [
  hub("CH4", "メタン", "C", ["H", "H", "H", "H"], "可燃性ガス", "energy", 6, 360, undefined, "都市ガスやバイオガスの主成分として日常的に使われます。"),
  hub("NH3", "アンモニア", "N", ["H", "H", "H"], "刺激臭・有毒性あり", "toxic", 6, 310, undefined, "肥料やナイロン原料の出発物質として大量生産されています。"),
  hub("CO2", "二酸化炭素", "C", ["O", "O"], "無毒・高濃度では窒息性", "clean", 5, 250, [2, 2], "ドライアイスや炭酸飲料にも使われる身近な分子です。"),
  hub("SO2", "二酸化硫黄", "S", ["O", "O"], "刺激臭・有毒", "toxic", 6, 310, [2, 2], "ワインの酸化防止や漂白工程にも利用されます。"),
  hub("NO2", "二酸化窒素", "N", ["O", "O"], "有毒な赤褐色気体", "toxic", 6, 290, [1, 2], "大気汚染や光化学スモッグの指標として監視されます。"),
  molecule("N2O", "亜酸化窒素", ["N", "N", "O"], [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2 }], "麻酔作用", "sleep", 7, 300, undefined, "医療では笑気ガスとして麻酔補助に使われてきました。"),
  molecule("H2O2", "過酸化水素", ["H", "O", "O", "H"], [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }], "酸化性が強い", "reactive", 7, 350, undefined, "家庭用の消毒液や漂白剤にも希釈して使われます。"),
  hub("H2O", "水", "O", ["H", "H"], "無毒・生命に必須", "clean", 3, 180, undefined, "液体の水は水素結合により高い沸点を持ちます。"),
  pair("HF", "フッ化水素", ["H", "F"], "強い腐食性", "toxic", 5, 190, 1, undefined, "ガラスを溶かす性質があり、半導体加工で使われます。"),
  pair("HCl", "塩化水素", ["H", "Cl"], "強酸性・刺激性", "reactive", 4, 170, 1, undefined, "水に溶けると塩酸になり、胃酸にも含まれます。"),
  pair("CO", "一酸化炭素", ["C", "O"], "強い毒性", "toxic", 4, 140, 3, "CO2", "ヘモグロビンに強く結合するため少量でも危険です。"),
  pair("NO", "一酸化窒素", ["N", "O"], "反応性の高い気体", "reactive", 5, 180, 2, undefined, "血管を広げるシグナル分子として体内でも働きます。"),
  pair("O2", "酸素", ["O", "O"], "無毒・燃焼を助ける", "clean", 2, 95, 2, undefined, "地球大気の約21%を占め、燃焼を助けます。"),
  pair("N2", "窒素", ["N", "N"], "無毒・不活性", "clean", 2, 95, 3, undefined, "地球大気の約78%を占める主成分です。"),
  pair("H2", "水素", ["H", "H"], "可燃性ガス", "energy", 2, 90, 1, undefined, "燃料電池では水だけを生成する燃料として使われます。"),
  pair("F2", "フッ素", ["F", "F"], "極めて反応性が高い", "toxic", 4, 150, 1, undefined, "単体フッ素は1886年にアンリ・モアッサンが単離しました。"),
  pair("Cl2", "塩素", ["Cl", "Cl"], "有毒な黄緑色気体", "toxic", 4, 150, 1, undefined, "水道水やプールの殺菌に関連する重要な元素です。"),
  pair("LiF", "フッ化リチウム", ["Li", "F"], "安定な無機塩", "salt", 5, 200, 1, undefined, "紫外線を通しやすく光学材料としても使われます。"),
  pair("LiCl", "塩化リチウム", ["Li", "Cl"], "吸湿性の無機塩", "salt", 5, 200, 1, undefined, "湿度制御や一部の電池研究で扱われます。"),
  pair("NaF", "フッ化ナトリウム", ["Na", "F"], "無機塩", "salt", 5, 210, 1, undefined, "虫歯予防のフッ化物として歯磨き剤に使われます。"),
  pair("NaCl", "塩化ナトリウム", ["Na", "Cl"], "無毒な塩", "salt", 5, 210, 1, undefined, "食塩として食品保存や調味に古くから使われています。"),
  pair("KCl", "塩化カリウム", ["K", "Cl"], "一般的な無機塩", "salt", 5, 220, 1, undefined, "減塩食品で食塩の代替として使われることがあります。"),
  pair("MgO", "酸化マグネシウム", ["Mg", "O"], "無毒・難溶性", "salt", 6, 230, 1, undefined, "胃薬や耐火材料として日常的に利用されます。"),
  pair("BeO", "酸化ベリリウム", ["Be", "O"], "安定な酸化物", "salt", 7, 260, 1, undefined, "熱をよく逃がすセラミックス材料ですが粉じんは有害です。"),
  molecule("Al2O3", "酸化アルミニウム", ["Al", "Al", "O", "O", "O"], [{ a: 0, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 3 }, { a: 1, b: 4 }], "安定な酸化物", "salt", 7, 360, undefined, "ルビーやサファイアの主成分でもあります。"),
  hub("SiO2", "二酸化ケイ素", "Si", ["O", "O"], "砂や石英の主成分", "clean", 7, 340, [2, 2], "ガラスや光ファイバーの主原料として広く使われます。"),
  hub("CaCl2", "塩化カルシウム", "Ca", ["Cl", "Cl"], "吸湿性の塩", "salt", 6, 290, undefined, "除湿剤や凍結防止剤として身近に使われます。"),
  pair("CaO", "酸化カルシウム", ["Ca", "O"], "水と発熱反応", "reactive", 6, 240, 1, undefined, "生石灰として建材や土壌改良に使われます。"),
];
