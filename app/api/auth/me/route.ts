import { NextResponse } from "next/server";
import { getAccessToken, getSupabaseConfig } from "@/lib/supabase/auth-rest";

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ user: null });

  const config = getSupabaseConfig();
  if ("error" in config) return NextResponse.json({ error: config.error }, { status: 500 });

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json({ user: null, error: data.error ?? data.msg ?? "Unable to load user." }, { status: response.status });
  }

  return NextResponse.json({ user: data });
}
