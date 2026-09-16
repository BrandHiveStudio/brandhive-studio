import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { toggleLinkActive } from "@/lib/db/queries/links";

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
    const updated = await toggleLinkActive(id);

    if (!updated) {
      return NextResponse.json({ error: "External link not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      link: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle link active status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
