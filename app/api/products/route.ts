import { NextResponse } from "next/server";
import { getConvexValue, setConvexValue } from "@/lib/convexServer";

export async function GET() {
  try { return NextResponse.json((await getConvexValue("9teen_products")) ?? []); }
  catch { return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 }); }
}

export async function POST(request: Request) {
  try {
    const value = await request.json();
    const products = Array.isArray(value) ? value : [value];
    await setConvexValue("9teen_products", products);
    return NextResponse.json({ success: true, inserted: products.length });
  } catch { return NextResponse.json({ error: "Failed to save products" }, { status: 500 }); }
}
