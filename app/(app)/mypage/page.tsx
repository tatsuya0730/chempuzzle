export default function MyPage() {
  const history = [
    { mode: "Single", score: "18,420", detail: "H2O dissolve x3 / Fire burst x2" },
    { mode: "Multi", score: "12,480", detail: "demo-lab vs catalyst-k" },
    { mode: "Single", score: "9,860", detail: "max chain 4 / avg pH 6.8" },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Account</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">マイページ</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">未ログイン状態のプロフィール画面です。ログイン後はプレイ履歴、設定、対戦成績をここに集約します。</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-lg font-black text-white">?</div>
            <div>
              <h2 className="text-xl font-black text-slate-950">未ログイン</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">新規登録 / ログインで履歴を保存</p>
            </div>
          </div>
          <button type="button" className="mt-5 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300">ログイン機能を接続する</button>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <h2 className="text-lg font-black text-slate-950">設定</h2>
          <div className="mt-4 space-y-3">
            {["アニメーション軽減", "色覚サポート", "対戦時の接続品質表示"].map((label) => (
              <label key={label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                <span>{label}</span>
                <input type="checkbox" className="h-5 w-5 accent-slate-950" />
              </label>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">プレイ履歴</h2>
          <span className="text-xs font-black text-slate-500">local mock</span>
        </div>
        <div className="mt-4 divide-y divide-slate-200">
          {history.map((entry) => (
            <div key={`${entry.mode}-${entry.score}`} className="grid gap-2 py-3 sm:grid-cols-[90px_120px_1fr] sm:items-center">
              <p className="text-sm font-black text-slate-950">{entry.mode}</p>
              <p className="text-lg font-black tabular-nums text-slate-950">{entry.score}</p>
              <p className="text-sm font-semibold text-slate-500">{entry.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
