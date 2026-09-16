import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { toggleFaqPublish } from "@/lib/db/queries/faqs";

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
    const updated = await toggleFaqPublish(id);

    if (!updated) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      faq: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle FAQ publish status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
