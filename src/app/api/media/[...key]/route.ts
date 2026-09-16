import { NextRequest, NextResponse } from "next/server";
import { getObjectFromR2 } from "@/lib/storage/r2";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await context.params;
    if (!key || key.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const storageKey = key.join("/");
    const result = await getObjectFromR2(storageKey);

    if (!result.Body) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const contentType = result.ContentType || "application/octet-stream";
    const bodyStream = typeof result.Body.transformToWebStream === "function"
      ? result.Body.transformToWebStream()
      : (result.Body as unknown as ReadableStream);

    return new NextResponse(bodyStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(result.ContentLength ? { "Content-Length": String(result.ContentLength) } : {}),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    const errorName = err && typeof err === "object" && "name" in err ? String(err.name) : "";
    if (errorName === "NoSuchKey" || errorName === "NotFound") {
      return new NextResponse("Not Found", { status: 404 });
    }
    return new NextResponse("Failed to retrieve media asset", { status: 500 });
  }
}
