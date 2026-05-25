"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AtomSelectionPanel } from "@/components/game/AtomSelectionPanel";
import { MiniToken } from "@/components/game/MiniToken";
import { useAtomSelection } from "@/components/game/useAtomSelection";
import { MOLECULES } from "@/lib/game/molecules";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const MOCK_DISCOVERED = new Set(["H2", "O2", "H2O", "CO", "CO2", "NaCl"]);

export default function MyPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [cropSource, setCropSource] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [message, setMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { enabledAtoms, setEnabledAtoms, resetEnabledAtoms } = useAtomSelection();

  const usernameValid = username.length === 0 || USERNAME_PATTERN.test(username);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const response = await fetch("/api/profile");
      const data = await response.json().catch(() => ({}));
      if (!active) return;
      setLoadingProfile(false);
      if (!response.ok || !data.profile) {
        setIsSignedIn(false);
        return;
      }
      setIsSignedIn(true);
      setDisplayName(data.profile.display_name ?? "");
      setUsername(data.profile.username ?? "");
      setAvatarUrl(data.profile.avatar_url ?? "");
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const openCropper = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropSource(String(reader.result ?? ""));
      setCropZoom(1);
      setCropX(50);
      setCropY(50);
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!cropSource) return;
    const image = new window.Image();
    image.src = cropSource;
    await image.decode();

    const canvas = document.createElement("canvas");
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;

    const cropSize = Math.min(image.width, image.height) / cropZoom;
    const maxX = Math.max(0, image.width - cropSize);
    const maxY = Math.max(0, image.height - cropSize);
    const sourceX = (cropX / 100) * maxX;
    const sourceY = (cropY / 100) * maxY;
    context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, size, size);
    setAvatarUrl(canvas.toDataURL("image/png"));
    setCropSource("");
  };

  const saveProfile = async () => {
    if (displayName.trim().length > 0 && (displayName.trim().length < 2 || displayName.trim().length > 32)) {
      setMessage("表示名は2〜32文字で入力してください。");
      return;
    }
    if (username && !USERNAME_PATTERN.test(username)) {
      setMessage("ユーザー名は3〜20文字の半角英数字とアンダースコアで入力してください。");
      return;
    }
    setSavingProfile(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, username, avatarUrl }),
    });
    const data = await response.json().catch(() => ({}));
    setSavingProfile(false);

    if (!response.ok) {
      setMessage(data.error ?? "プロフィールを保存できませんでした。");
      return;
    }

    setIsSignedIn(true);
    setMessage("プロフィールを保存しました。");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-black uppercase text-slate-500">Account</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">マイページ</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">プロフィール、プレイ履歴、ゲーム設定をまとめて管理できます。</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-950 text-lg font-black text-white shadow-inner"
                style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                aria-label="アイコン画像を変更"
              >
                {avatarUrl ? null : "ICON"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) openCropper(file);
                  event.currentTarget.value = "";
                }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-800">
                画像を選択
              </button>
            </div>

            <div className="grid flex-1 gap-4">
              {!isSignedIn && !loadingProfile ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-950">
                  プロフィール保存にはログインが必要です。<Link href="/login" className="underline underline-offset-4">ログイン / 新規登録</Link>
                </div>
              ) : null}
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Display name</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={32} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white" placeholder="表示名" />
                <span className="mt-1 block text-right text-xs font-bold text-slate-400">{displayName.length}/32</span>
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} maxLength={20} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white" placeholder="chem_player" />
                <span className={`mt-1 block text-xs font-bold ${usernameValid ? "text-slate-400" : "text-rose-600"}`}>3〜20文字、半角英数字と _ のみ。他ユーザーと重複できません。</span>
              </label>
              <button type="button" onClick={saveProfile} disabled={!isSignedIn || savingProfile || loadingProfile} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300">
                {savingProfile ? "保存中" : "プロフィールを保存"}
              </button>
              {message ? <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">{message}</p> : null}
            </div>
          </div>
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

      <AtomSelectionPanel enabledAtoms={enabledAtoms} onChange={setEnabledAtoms} onReset={resetEnabledAtoms} />

      <section id="molecule-dex" className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Molecule Dex</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">分子図鑑</h2>
          </div>
          <span className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-950">
            {MOCK_DISCOVERED.size}/{MOLECULES.length} discovered
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOLECULES.map((molecule) => {
            const discovered = MOCK_DISCOVERED.has(molecule.formula);
            return (
              <article key={molecule.formula} className={`rounded-lg border p-3 ${discovered ? "border-slate-200 bg-slate-50" : "border-dashed border-slate-300 bg-slate-50/60 opacity-70"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-slate-950">{discovered ? molecule.formula : "???"}</p>
                    <p className="text-xs font-semibold text-slate-500">{discovered ? molecule.name : "未発見"}</p>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-xs font-black ${discovered ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>{discovered ? "発見済" : "未発見"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {molecule.nodes.slice(0, 5).map((token, index) => (
                    <span key={`${molecule.formula}-${token}-${index}`} className={discovered ? "scale-75" : "scale-75 grayscale"}>
                      <MiniToken token={token} />
                    </span>
                  ))}
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{discovered ? molecule.fact ?? molecule.property : "分子探索モードで生成すると詳細が解放されます。"}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-black text-slate-950">プレイ履歴</h2>
          <Link href="/ranking" className="text-sm font-black text-slate-950 underline underline-offset-4">
            オンラインランキングを見る
          </Link>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-500">プレイ履歴はまだありません。</div>
      </section>

      {cropSource ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-black text-slate-950">アイコンを切り抜く</h2>
            <div className="mx-auto mt-4 h-56 w-56 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              <div
                className="h-full w-full bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${cropSource})`,
                  backgroundPosition: `${cropX}% ${cropY}%`,
                  backgroundSize: `${cropZoom * 100}%`,
                }}
              />
            </div>
            <div className="mt-5 grid gap-4">
              <label className="text-xs font-black uppercase text-slate-500">
                Zoom
                <input type="range" min="1" max="2.4" step="0.05" value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} className="mt-2 w-full accent-slate-950" />
              </label>
              <label className="text-xs font-black uppercase text-slate-500">
                Horizontal
                <input type="range" min="0" max="100" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} className="mt-2 w-full accent-slate-950" />
              </label>
              <label className="text-xs font-black uppercase text-slate-500">
                Vertical
                <input type="range" min="0" max="100" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} className="mt-2 w-full accent-slate-950" />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setCropSource("")} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800">
                キャンセル
              </button>
              <button type="button" onClick={applyCrop} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300">
                適用
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
