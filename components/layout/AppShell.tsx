"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/play", label: "個人プレイ", short: "Solo" },
  { href: "/multiplayer", label: "マルチプレイ", short: "Multi" },
  { href: "/mypage", label: "マイページ", short: "Me" },
  { href: "/history", label: "プレイ履歴", short: "Log" },
  { href: "/settings", label: "設定", short: "Set" },
  { href: "/tutorial", label: "チュートリアル", short: "Tips" },
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

            {collapsed ? null : (
              <div className="mt-auto rounded-lg border border-cyan-100 bg-cyan-50 p-3">
                <p className="text-xs font-black text-cyan-950">Online status</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-cyan-800">マルチプレイは画面プロトタイプです。リアルタイム同期は Supabase Realtime 連携で実装できます。</p>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
