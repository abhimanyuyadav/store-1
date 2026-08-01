import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

let client: ConvexHttpClient | null = null;

export function getConvexServerClient() {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("CONVEX_URL or NEXT_PUBLIC_CONVEX_URL is not configured.");
  client ??= new ConvexHttpClient(url);
  return client;
}

export async function getConvexValue(key: string) {
  const row = await getConvexServerClient().query(api.appData.getValue, { key });
  return row?.value ?? null;
}

export async function setConvexValue(key: string, value: unknown) {
  await getConvexServerClient().mutation(api.appData.setValue, { key, value });
}

export async function deleteConvexValue(key: string) {
  return await getConvexServerClient().mutation(api.appData.deleteValue, { key });
}
