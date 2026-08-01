import "server-only";
import { getConvexServerClient } from "./convexServer";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([a-zA-Z0-9+/=]+)$/;

export async function uploadImageDataUrl(fileData: unknown) {
  if (typeof fileData !== "string") throw new Error("Image data is required.");
  const match = DATA_URL.exec(fileData);
  if (!match) throw new Error("Unsupported image format.");

  const contentType = match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("Image must be 2 MB or smaller.");

  const client = getConvexServerClient();
  const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
  const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": contentType }, body: bytes });
  if (!response.ok) throw new Error("Convex upload failed.");
  const { storageId } = await response.json() as { storageId?: string };
  if (!storageId) throw new Error("Convex did not return a file ID.");
  const publicUrl = await client.query(api.files.getUrl, { storageId: storageId as Id<"_storage"> });
  if (!publicUrl) throw new Error("Convex did not create an image URL.");
  return publicUrl;
}
