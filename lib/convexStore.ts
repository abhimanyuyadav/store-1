import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

let client: ConvexHttpClient | null = null;

async function storageApi<T>(path = "/api/storage", init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const raw = await response.text();
  let parsed: unknown = null;
  if (raw.trim()) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new Error("Convex storage returned invalid JSON.");
    }
  }
  if (!response.ok) {
    const body = parsed as { error?: string } | null;
    throw new Error(body?.error || "Convex storage request failed.");
  }
  return parsed as T;
}

export function isConvexConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

export async function getConvexClient(): Promise<ConvexHttpClient> {
  if (typeof window === "undefined") {
    throw new Error("Convex data access is only available in the browser.");
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured.");
  }

  if (!client) {
    client = new ConvexHttpClient(convexUrl);
  }

  return client;
}

export async function readSharedValue(key: string) {
  try {
    const convex = await getConvexClient();
    const result = await convex.query(api.appData.getValue, { key });
    return result?.value ?? null;
  } catch {
    return storageApi<unknown>(`/api/storage?key=${encodeURIComponent(key)}`);
  }
}

export async function readAllSharedValues() {
  try {
    const convex = await getConvexClient();
    const rows = await convex.query(api.appData.listValues, {}) as Array<{ key: string; value: unknown }>;
    return rows.reduce((acc: Record<string, unknown>, row: { key: string; value: unknown }) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, unknown>);
  } catch {
    return storageApi<Record<string, unknown>>();
  }
}

export async function writeSharedValue(key: string, value: unknown) {
  try {
    const convex = await getConvexClient();
    await convex.mutation(api.appData.setValue, { key, value });
    return true;
  } catch {
    await storageApi<{ ok: boolean }>("/api/storage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) });
    return true;
  }
}

export async function deleteSharedValue(key: string) {
  try {
    const convex = await getConvexClient();
    return await convex.mutation(api.appData.deleteValue, { key });
  } catch {
    const result = await storageApi<{ removed: boolean }>("/api/storage", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
    return result.removed;
  }
}
