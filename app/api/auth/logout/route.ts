import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/supabase/auth-rest";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearSessionCookies(response);
  return response;
}
