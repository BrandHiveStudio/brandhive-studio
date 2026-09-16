import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isPublished } = body;

    if (typeof isPublished !== "boolean") {
      return NextResponse.json({ error: "isPublished boolean is required." }, { status: 400 });
    }

    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db
      .update(services)
      .set({
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    return NextResponse.json({
      ok: true,
      message: `Service ${isPublished ? "published" : "unpublished"} successfully.`,
      isPublished,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
