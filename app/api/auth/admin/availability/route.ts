import { NextResponse } from "next/server";
import { getConvexServerClient } from "@/lib/convexServer";
import { api } from "@/convex/_generated/api";

export async function GET() {
  return NextResponse.json(await getConvexServerClient().action((api as any).auth.adminAvailability, {}));
}
