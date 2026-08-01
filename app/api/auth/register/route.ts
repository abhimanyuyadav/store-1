import { NextResponse } from "next/server";
import { getConvexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";
import { sessionCookie } from "@/lib/authServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getConvexServerClient().action((api as any).auth.register, body);
    const response = NextResponse.json({ user: { role: result.role } }, { status: 201 });
    response.cookies.set(sessionCookie(result.token, result.expiresAt));
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create account." }, { status: 400 });
  }
}
