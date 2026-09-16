import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { uploadToR2 } from "@/lib/storage/r2";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import crypto from "crypto";
import path from "path";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawCategory = (formData.get("category") as string) || "general";
    const category = rawCategory.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Supported formats: JPG, PNG, WebP, SVG, AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB size limit." },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const ext = rawExt || (file.type === "image/png" ? ".png" : ".jpg");
    const sanitizedBase = path
      .basename(file.name, rawExt)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);

    const uniqueId = crypto.randomBytes(6).toString("hex");
    const storageKey = `${category}/${Date.now()}-${sanitizedBase}-${uniqueId}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudflare R2
    const uploadResult = await uploadToR2({
      key: storageKey,
      body: buffer,
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: admin.email,
      },
    });

    // Save metadata in Turso
    const mediaId = "med_" + crypto.randomUUID();
    await db.insert(media).values({
      id: mediaId,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      publicUrl: uploadResult.url,
    });

    return NextResponse.json({
      ok: true,
      id: mediaId,
      url: uploadResult.url,
      storageKey,
      filename: file.name,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error during media upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
