import { NextResponse } from "next/server";
import { attachSessionCookies, callSupabaseAuth } from "@/lib/supabase/auth-rest";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const result = await callSupabaseAuth("token?grant_type=password", { email, password });

  if (!result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }

  const response = NextResponse.json({ user: result.data.user ?? null });
  attachSessionCookies(response, result.data);
  return response;
}
