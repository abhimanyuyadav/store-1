import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authServer";

export async function GET() {
  try { return NextResponse.json({ user: await getAuthSession() }); }
  catch { return NextResponse.json({ user: null }, { status: 401 }); }
}
