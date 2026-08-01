import { NextResponse } from "next/server";
import { getConvexValue, setConvexValue } from "@/lib/convexServer";

export async function GET() {
  try { return NextResponse.json((await getConvexValue("9teen_user_accounts")) ?? []); }
  catch { return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const value = await request.json();
    const users = Array.isArray(value) ? value : [value];
    await setConvexValue("9teen_user_accounts", users);
    return NextResponse.json({ success: true, inserted: users.length });
  } catch { return NextResponse.json({ error: "Failed to save users" }, { status: 500 }); }
}
