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

function PhysicsExample({ tokens }: { tokens: Array<TokenSymbol | null> }) {
  return (
    <div className="mx-auto flex min-h-[116px] max-w-[230px] flex-wrap items-center justify-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
      {tokens.map((token, index) => (
        <div key={index} className={`flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-sky-200 bg-white/70 ${index % 2 === 1 ? "translate-y-3" : "-translate-y-1"}`}>
          {token ? <MiniToken token={token} /> : null}
        </div>
      ))}
    </div>
  );
}

function KeyCap({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
      <span className="flex h-11 min-w-11 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-black text-white">{label}</span>
      <span className="text-sm font-bold text-slate-600">{body}</span>
    </div>
  );
}

export default function TutorialPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Tutorial</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">反応とギミックの見方</h1>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">原子が物理演算で転がり、接触した組み合わせが反応します。途中で反応を続けられる分子は一つのトークンとして残り、最終的に安定した分子になると消えます。</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">1. 接触で反応</h2>
          <div className="mt-5">
            <PhysicsExample tokens={["H", "O", null, null, "H", null]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-slate-600">グリッドは使わず、Matter Physics の衝突で反応候補を判定します。</p>
        </article>

        <article className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-xl shadow-cyan-100/70">
          <h2 className="text-lg font-black text-cyan-950">2. 中間分子</h2>
          <div className="mt-5">
            <PhysicsExample tokens={["C", "O", null, null, "O", null]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-cyan-900">CO はすぐ消えず、一つの分子トークンとして残ります。そこへ O が結合すると CO2 として消えます。</p>
        </article>

        <article className="rounded-lg border border-orange-200 bg-orange-50 p-5 shadow-xl shadow-orange-100/70">
          <h2 className="text-lg font-black text-orange-950">3. 成長リスト</h2>
          <div className="mt-5">
            <PhysicsExample tokens={["H", "H", "O", "O", "C", "O"]} />
          </div>
          <p className="mt-8 text-sm font-semibold leading-6 text-orange-900">右側に生成できる分子の成長リストが出ます。原子選択を変えると候補も変わります。</p>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">操作方法</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">盤面上のマウス位置で投下場所を決め、クリックで原子を自由落下させます。</p>
          </div>
          <div className="flex gap-1">
            <MiniToken token="H" />
            <MiniToken token="O" />
            <MiniToken token="C" />
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KeyCap label="Mouse" body="投下位置を調整" />
          <KeyCap label="Click" body="自由落下" />
          <KeyCap label="← / →" body="微調整" />
          <KeyCap label="Space" body="落下 / 開始" />
          <KeyCap label="C" body="ホールド" />
          <KeyCap label="X" body="Next と交換" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">よく消える分子</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MoleculeRecipe title="H2O 水" tokens={["H", "O", "H"]} note="最終的に安定した分子として成立すると消える基本反応。" />
            <MoleculeRecipe title="CO2 二酸化炭素" tokens={["O", "C", "O"]} note="CO 中間トークンを経由して作る代表例。" />
            <MoleculeRecipe title="CH4 メタン" tokens={["C", "H", "H", "H", "H"]} note="一般環境で扱いやすい炭化水素の代表。" />
            <MoleculeRecipe title="NaCl 塩" tokens={["Na", "Cl"]} note="無機塩として成立すると消える安定系の分子。" />
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
