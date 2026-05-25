import { NextResponse } from "next/server";
import { attachSessionCookies, callSupabaseAuth, callSupabaseRest } from "@/lib/supabase/auth-rest";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

const normalizeUsername = (username: string) => username.trim().toLowerCase();

export async function POST(request: Request) {
  const { email, password, displayName = "", username = "" } = await request.json();
  const normalizedDisplayName = String(displayName).trim();
  const normalizedUsername = normalizeUsername(String(username));

  if (normalizedDisplayName.length < 2 || normalizedDisplayName.length > 32) {
    return NextResponse.json({ error: "表示名は2〜32文字で入力してください。" }, { status: 400 });
  }

  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return NextResponse.json({ error: "ユーザー名は3〜20文字の半角英数字とアンダースコアで入力してください。" }, { status: 400 });
  }

  const existingProfile = await callSupabaseRest(`profiles?username=eq.${encodeURIComponent(normalizedUsername)}&select=id&limit=1`);
  if (existingProfile.ok && Array.isArray(existingProfile.data) && existingProfile.data.length > 0) {
    return NextResponse.json({ error: "このユーザー名はすでに使われています。" }, { status: 409 });
  }

  const result = await callSupabaseAuth("signup", {
    email,
    password,
    data: {
      display_name: normalizedDisplayName,
      username: normalizedUsername,
    },
  });

  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }

  const userId = result.data.user?.id;
  const accessToken = result.data.session?.access_token ?? result.data.access_token;
  if (userId && accessToken) {
    await callSupabaseRest(
      "profiles",
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          id: userId,
          display_name: normalizedDisplayName,
          username: normalizedUsername,
        }),
      },
      accessToken,
    );
  }

  const response = NextResponse.json({ user: result.data.user ?? null, session: result.data.session ?? null });
  attachSessionCookies(response, result.data.session ?? result.data);
  return response;
}
