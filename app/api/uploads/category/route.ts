import { NextRequest, NextResponse } from "next/server";
import { uploadImageDataUrl } from "@/lib/convexUploadServer";

export async function POST(request: NextRequest) {
  try {
    const { fileData } = await request.json();
    return NextResponse.json({ publicUrl: await uploadImageDataUrl(fileData) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 });
  }
}
