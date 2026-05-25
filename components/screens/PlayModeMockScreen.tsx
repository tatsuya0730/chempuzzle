import Link from "next/link";
import { MOLECULES } from "@/lib/game/molecules";
import { MiniToken } from "@/components/game/MiniToken";

const challengeTargets = MOLECULES.filter((molecule) => ["H2O", "CO2", "NH3", "NaCl"].includes(molecule.formula));

export function PlayModeMockScreen({ mode }: { mode: "challenge" | "explore" }) {
  const isChallenge = mode === "challenge";
  const title = isChallenge ? "お題分子モード" : "分子探索モード";
  const badge = isChallenge ? "Target molecules" : "Collection run";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">{badge}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-cyan-200 bg-cyan-50/60 px-5 py-8 text-center">
            <p className="text-xs font-black uppercase text-cyan-700">Mock mode</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{isChallenge ? "お題を見ながら分子を作るモード" : "通常プレイで図鑑を埋めるモード"}</h2>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
              {isChallenge
                ? "正式実装では、指定された分子を順番に生成してクリアタイムや成功数を競います。"
                : "正式実装では、通常プレイ中に初めて作った分子を分子図鑑へ記録していきます。"}
            </p>
            <Link href="/play" className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300">
              通常プレイを試す
            </Link>
          </div>
        </article>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">{isChallenge ? "本日のお題" : "探索プレビュー"}</h2>
            <Link href="/mypage#molecule-dex" className="text-xs font-black text-slate-700 underline underline-offset-4">
              図鑑を見る
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {challengeTargets.map((molecule) => (
              <div key={molecule.formula} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-950">{molecule.formula}</p>
                    <p className="text-xs font-semibold text-slate-500">{molecule.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {molecule.nodes.slice(0, 4).map((token, index) => (
                      <span key={`${molecule.formula}-${token}-${index}`} className="scale-75">
                        <MiniToken token={token} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
