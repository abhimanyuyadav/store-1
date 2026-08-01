import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/authServer";
import { getConvexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

export async function POST() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token) await getConvexServerClient().action((api as any).auth.logout, { token }).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: AUTH_COOKIE, value: "", path: "/", maxAge: 0 });
  return response;
}
