import "server-only";
import { cookies } from "next/headers";
import { getConvexServerClient } from "./convexServer";
import { api } from "@/convex/_generated/api";

export const AUTH_COOKIE = "9teen_session";

export type AuthSession = { id: string; name: string; email: string; phone: string; address: string; city: string; role: "customer" | "admin"; expiresAt: number };

export async function getAuthSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return await getConvexServerClient().action((api as any).auth.session, { token }) as AuthSession | null;
}

export function sessionCookie(token: string, expiresAt: number) {
  return { name: AUTH_COOKIE, value: token, options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: new Date(expiresAt) } };
}
