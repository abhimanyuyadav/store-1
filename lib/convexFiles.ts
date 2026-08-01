import { getConvexClient } from "./convexStore";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadImageToConvex(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image files must be 2 MB or smaller.");

  try {
    const client = await getConvexClient();
    const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});
    const upload = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
    if (!upload.ok) throw new Error("Direct upload was rejected.");
    const { storageId } = await upload.json() as { storageId?: string };
    if (!storageId) throw new Error("Convex did not return an image identifier.");
    const url = await client.query(api.files.getUrl, { storageId: storageId as Id<"_storage"> });
    if (!url) throw new Error("Convex could not create an image URL.");
    return url;
  } catch {
    // Local Convex deployments can reject browser-origin uploads. Use the
    // Next.js server as a same-origin relay while keeping the file in Convex.
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });
    const response = await fetch("/api/uploads/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileData }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.publicUrl) throw new Error(result.error || "Convex could not upload the image.");
    return result.publicUrl as string;
  }
}
