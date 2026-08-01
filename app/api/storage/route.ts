import { NextRequest, NextResponse } from "next/server";
import { deleteConvexValue, getConvexServerClient, getConvexValue, setConvexValue } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

const isValidStorageKey = (key: string) => /^[a-zA-Z0-9_-]{1,255}$/.test(key);

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get("key");
  if (key && !isValidStorageKey(key)) return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  try {
    if (key) return NextResponse.json(await getConvexValue(key));
    const rows = await getConvexServerClient().query(api.appData.listValues, {}) as Array<{ key: string; value: unknown }>;
    return NextResponse.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
  } catch {
    return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const { key, value } = await request.json();
  if (typeof key !== "string" || !isValidStorageKey(key)) return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  if (JSON.stringify(value).length > 1024 * 1024) return NextResponse.json({ error: "Value too large" }, { status: 400 });
  try {
    await setConvexValue(key, value);
    return NextResponse.json({ ok: true, key });
  } catch {
    return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const { key } = await request.json();
  if (typeof key !== "string" || !isValidStorageKey(key)) return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, key, removed: await deleteConvexValue(key) });
  } catch {
    return NextResponse.json({ error: "Convex storage is unavailable" }, { status: 503 });
  }
}
