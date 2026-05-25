"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/tutorial", label: "チュートリアル", short: "Tips" },
  { href: "/play", label: "シングルプレイ", short: "Solo" },
  { href: "/multiplayer", label: "マルチプレイ", short: "Multi" },
  { href: "/ranking", label: "ランキング", short: "Rank" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="min-h-screen bg-[#eef4f8] text-slate-950">
      <div className={`grid min-h-screen transition-[grid-template-columns] duration-200 ${collapsed ? "grid-cols-[76px_1fr]" : "grid-cols-[220px_1fr]"}`}>
        <aside className="relative border-r border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="sticky top-0 flex h-screen flex-col gap-4 p-3">
            <div className="flex items-center justify-between gap-2">
              <Link href="/play" className="min-w-0">
                <p className={`font-black leading-none text-slate-950 ${collapsed ? "text-xl" : "text-2xl"}`}>{collapsed ? "CP" : "ChemPuzzle"}</p>
                {collapsed ? null : <p className="mt-1 text-xs font-semibold text-slate-500">reaction arena</p>}
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="absolute -right-3 top-5 z-10 flex h-10 w-6 items-center justify-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-950 text-xs font-black text-white shadow-lg shadow-slate-300"
                aria-label={collapsed ? "サイドバーを開く" : "サイドバーを畳む"}
              >
                {collapsed ? ">" : "<"}
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-3 text-sm font-black transition ${
                      active ? "bg-slate-950 text-white shadow-lg shadow-slate-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    } ${collapsed ? "text-center" : ""}`}
                    title={item.label}
                  >
                    {collapsed ? item.short : item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/login"
              className={`mt-auto flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white ${collapsed ? "justify-center" : ""}`}
              title="新規登録 / ログイン"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">?</span>
              {collapsed ? null : (
                <span className="min-w-0">
                  <span className="block text-xs font-black text-slate-950">未ログイン</span>
                  <span className="block text-xs font-semibold text-slate-500">新規登録 / ログイン</span>
                </span>
              )}
            </Link>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
