import type { TokenSymbol } from "@/types/game";
import { MiniToken } from "@/components/game/MiniToken";
import { EFFECT_STYLES } from "@/lib/game/tokens";

function MoleculeRecipe({ title, tokens, note }: { title: string; tokens: TokenSymbol[]; note: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <div className="flex gap-1">
          {tokens.map((token, index) => (
            <MiniToken key={`${title}-${token}-${index}`} token={token} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function HexExample({ tokens }: { tokens: Array<TokenSymbol | null> }) {
  return (
    <div className="mx-auto grid max-w-[210px] grid-cols-3 gap-2">
      {tokens.map((token, index) => (
        <div key={index} className={`flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-sky-200 bg-white/70 ${index % 3 === 1 ? "translate-y-5" : ""}`}>
          {token ? <MiniToken token={token} /> : null}
        </div>
      ))}
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Tutorial</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">反応とギミックの見方</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">隣接した原子が分子の形になると消えます。H2O は周囲の可溶性片を洗い流し、炎は可燃性の高い原子を中心にボムのように燃え広がります。</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">1. 隣接で反応</h2>
          <div className="mt-5">
            <HexExample tokens={["H", "O", null, null, "H", null]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-slate-600">腕の向きは使わず、隣り合う配置が分子グラフと一致すると反応します。</p>
        </article>

        <article className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-xl shadow-cyan-100/70">
          <h2 className="text-lg font-black text-cyan-950">2. 水で溶かす</h2>
          <div className="mt-5">
            <HexExample tokens={["Na", "H", "Cl", null, "O", "H"]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-cyan-900">H2O が成立すると、周囲の Na / Mg / Ca / Zn / F / Cl を可溶性片として追加消去します。</p>
        </article>

        <article className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-xl shadow-orange-100/70">
          <h2 className="text-lg font-black text-orange-950">3. 炎ボム</h2>
          <div className="mt-5">
            <HexExample tokens={["C", "S", "Ph", "H", "Fire", "P"]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-orange-900">炎が落ちると周囲の可燃性原子を発火。Ph など燃えやすい片があると範囲が広がります。</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">よく消える分子</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MoleculeRecipe title="H2O 水" tokens={["H", "O", "H"]} note="周囲の可溶性片を追加で消す基本ギミック。" />
            <MoleculeRecipe title="CO2 二酸化炭素" tokens={["O", "C", "O"]} note="C と O のまとまりを優先して作ると盤面整理しやすい。" />
            <MoleculeRecipe title="CH4 メタン" tokens={["C", "H", "H", "H", "H"]} note="可燃性。炎の近くではまとめ消しの起点になる。" />
            <MoleculeRecipe title="NaCl 塩" tokens={["Na", "Cl"]} note="水の周囲にあると溶けて追加消去される。" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">属性の目安</h2>
          <div className="mt-4 grid gap-2">
            {(["clean", "energy", "reactive", "salt", "toxic", "inert"] as const).map((effect) => (
              <div key={effect} className={`rounded-lg border px-4 py-3 text-sm font-black ${EFFECT_STYLES[effect].panel}`}>
                {EFFECT_STYLES[effect].tag}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
