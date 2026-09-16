import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { toggleProcessStepPublished } from "@/lib/db/queries/process";

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
    const updated = await toggleProcessStepPublished(id);

    if (!updated) {
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      step: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle process step status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
