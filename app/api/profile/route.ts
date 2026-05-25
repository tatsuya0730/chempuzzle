import { NextResponse } from "next/server";
import { callSupabaseRest, getAccessToken, getSupabaseConfig } from "@/lib/supabase/auth-rest";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

async function getCurrentUser(accessToken: string) {
  const config = getSupabaseConfig();
  if ("error" in config) return { error: config.error };

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id) return { error: "ログインが必要です。" };
  return { user: data as { id: string; email?: string; user_metadata?: Record<string, string> } };
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ profile: null }, { status: 401 });

  const current = await getCurrentUser(accessToken);
  if ("error" in current) return NextResponse.json({ error: current.error }, { status: 401 });

  const profileResult = await callSupabaseRest(`profiles?id=eq.${current.user.id}&select=id,display_name,username,avatar_url&limit=1`, undefined, accessToken);
  const profile = profileResult.ok && Array.isArray(profileResult.data) ? profileResult.data[0] ?? null : null;

  return NextResponse.json({
    user: current.user,
    profile: profile ?? {
      id: current.user.id,
      display_name: current.user.user_metadata?.display_name ?? "",
      username: current.user.user_metadata?.username ?? "",
      avatar_url: current.user.user_metadata?.avatar_url ?? "",
    },
  });
}

export async function PATCH(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });

  const current = await getCurrentUser(accessToken);
  if ("error" in current) return NextResponse.json({ error: current.error }, { status: 401 });

  const { displayName = "", username = "", avatarUrl = "" } = await request.json();
  const normalizedDisplayName = String(displayName).trim();
  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedAvatarUrl = String(avatarUrl);

  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 32) {
    return NextResponse.json({ error: "表示名は2〜32文字で入力してください。" }, { status: 400 });
  }
  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return NextResponse.json({ error: "ユーザー名は3〜20文字の半角英数字とアンダースコアで入力してください。" }, { status: 400 });
  }

  const existingProfile = await callSupabaseRest(`profiles?username=eq.${encodeURIComponent(normalizedUsername)}&id=neq.${current.user.id}&select=id&limit=1`, undefined, accessToken);
  if (existingProfile.ok && Array.isArray(existingProfile.data) && existingProfile.data.length > 0) {
    return NextResponse.json({ error: "このユーザー名はすでに使われています。" }, { status: 409 });
  }

  const profileResult = await callSupabaseRest(
    "profiles",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: current.user.id,
        display_name: normalizedDisplayName,
        username: normalizedUsername,
        avatar_url: normalizedAvatarUrl,
      }),
    },
    accessToken,
  );

  if (!profileResult.ok) {
    return NextResponse.json({ error: "プロフィールを保存できませんでした。" }, { status: profileResult.status });
  }

  return NextResponse.json({ profile: Array.isArray(profileResult.data) ? profileResult.data[0] : profileResult.data });
}
