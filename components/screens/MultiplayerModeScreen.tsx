import Link from "next/link";

export function MultiplayerModeScreen({ mode }: { mode: "create" | "find" }) {
  const isCreate = mode === "create";

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Multiplayer</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{isCreate ? "部屋を作る" : "部屋を探す"}</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="rounded-lg border border-dashed border-cyan-200 bg-cyan-50/60 px-5 py-10 text-center">
            <p className="text-xs font-black uppercase text-cyan-700">Mock multiplayer</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{isCreate ? "プライベート部屋を作成" : "参加できる部屋を検索"}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
              {isCreate ? "正式実装では、ルームコードを発行して友だちを招待できるようにします。" : "正式実装では、公開部屋や招待コードから対戦に参加できるようにします。"}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={isCreate ? "/multiplayer/find" : "/multiplayer/create"} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800">
                {isCreate ? "部屋を探す" : "部屋を作る"}
              </Link>
              <Link href="/play" className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300">
                通常プレイへ
              </Link>
            </div>
          </div>
        </article>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <h2 className="text-sm font-black text-slate-950">Room preview</h2>
          <div className="mt-4 grid gap-3">
            {["Physics Classic", "CO2 Sprint", "Beginner Lab"].map((room, index) => (
              <div key={room} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-black text-slate-950">{room}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{Math.min(index + 1, 2)}/2 players</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
