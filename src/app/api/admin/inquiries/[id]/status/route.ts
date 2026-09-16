import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getInquiryById, updateInquiry } from "@/lib/db/queries/inquiries";

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
    const existing = await getInquiryById(id);

    if (!existing) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["new", "contacted", "in_progress", "converted", "closed", "spam"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateInquiry(id, { status });

    return NextResponse.json({
      ok: true,
      inquiry: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update inquiry status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
