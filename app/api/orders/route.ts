import { NextResponse } from "next/server";
import { getConvexValue, setConvexValue } from "@/lib/convexServer";

export async function GET() {
  try { return NextResponse.json((await getConvexValue("9teen_orders")) ?? []); }
  catch { return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const value = await request.json();
    const orders = Array.isArray(value) ? value : [value];
    await setConvexValue("9teen_orders", orders);
    return NextResponse.json({ success: true, inserted: orders.length });
  } catch { return NextResponse.json({ error: "Failed to save orders" }, { status: 500 }); }
}
