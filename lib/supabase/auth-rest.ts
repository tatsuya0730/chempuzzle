import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "cp_access_token";
const REFRESH_COOKIE = "cp_refresh_token";

export type AuthPayload = {
  email: string;
  password: string;
  data?: Record<string, string>;
};

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return { error: "Authentication service is not configured." };
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}

export async function callSupabaseRest(path: string, init: RequestInit = {}, accessToken?: string) {
  const config = getSupabaseConfig();
  if ("error" in config) {
    return { ok: false, status: 500, data: { error: config.error } };
  }

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${accessToken ?? config.publishableKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, data };
}

export async function callSupabaseAuth(path: string, body: AuthPayload) {
  const config = getSupabaseConfig();
  if ("error" in config) {
    return { ok: false, status: 500, data: { error: config.error } };
  }

  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  return { ok: response.ok, status: response.status, data };
}

export function attachSessionCookies(response: NextResponse, data: { access_token?: string; refresh_token?: string; expires_in?: number }) {
  const maxAge = data.expires_in ?? 60 * 60;

  if (data.access_token) {
    response.cookies.set(ACCESS_COOKIE, data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    });
  }

  if (data.refresh_token) {
    response.cookies.set(REFRESH_COOKIE, data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }
}

export async function clearSessionCookies(response: NextResponse) {
  const cookieStore = await cookies();
  [ACCESS_COOKIE, REFRESH_COOKIE].forEach((name) => {
    if (cookieStore.has(name)) response.cookies.delete(name);
  });
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}
