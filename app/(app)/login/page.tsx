"use client";

import { useState } from "react";

type Mode = "login" | "signup";
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const normalizedUsername = username.trim().toLowerCase();
    if (mode === "signup" && (displayName.trim().length < 2 || displayName.trim().length > 32)) {
      setMessage("表示名は2〜32文字で入力してください。");
      return;
    }
    if (mode === "signup" && !USERNAME_PATTERN.test(normalizedUsername)) {
      setMessage("ユーザー名は3〜20文字の半角英数字とアンダースコアで入力してください。");
      return;
    }

    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName, username: normalizedUsername }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error_description ?? data.msg ?? data.error ?? "認証に失敗しました。");
      return;
    }

    setMessage(mode === "login" ? "ログインしました。" : "登録しました。メール確認が必要な場合は受信箱を確認してください。");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-black uppercase text-slate-500">Account</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">メールアドレスとパスワードでアカウントにアクセスします。登録後はプレイ履歴とプロフィールを保存できます。</p>

        <div className="mt-6 grid gap-4">
          {mode === "signup" ? (
            <>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Display name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  minLength={2}
                  maxLength={32}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white"
                  placeholder="表示名"
                />
                <span className="mt-1 block text-right text-xs font-bold text-slate-400">{displayName.length}/32</span>
              </label>
              <label>
                <span className="text-xs font-black uppercase text-slate-500">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value.toLowerCase())}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9_]{3,20}"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white"
                  placeholder="chem_player"
                />
                <span className="mt-1 block text-xs font-bold text-slate-400">3〜20文字、半角英数字と _ のみ。他ユーザーと重複できません。</span>
              </label>
            </>
          ) : null}
          <label>
            <span className="text-xs font-black uppercase text-slate-500">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white" />
          </label>
          <label>
            <span className="text-xs font-black uppercase text-slate-500">Password</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-slate-950 focus:bg-white" />
          </label>
        </div>

        <button type="button" onClick={submit} disabled={loading || !email || password.length < 6} className="mt-6 w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-300 disabled:cursor-not-allowed disabled:bg-slate-300">
          {loading ? "送信中" : mode === "login" ? "ログイン" : "登録する"}
        </button>

        {message ? <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">{message}</p> : null}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
          className={mode === "login" ? "mt-5 w-full rounded-lg border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-950 shadow-sm" : "mt-5 text-sm font-black text-slate-950 underline underline-offset-4"}
        >
          {mode === "login" ? "新規登録はこちら" : "ログインはこちら"}
        </button>
      </section>
    </div>
  );
}
