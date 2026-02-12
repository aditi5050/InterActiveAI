import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes =
      type === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: 100MB` },
        { status: 400 }
      );
    }

    // TODO: Upload to Transloadit or S3
    // For now, simulate successful upload
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // In production, upload to cloud storage and return signed URL
    return NextResponse.json({
      url: dataUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

