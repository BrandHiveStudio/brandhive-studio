import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getInquiryById, updateInquiry, deleteInquiry } from "@/lib/db/queries/inquiries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const inquiry = await getInquiryById(id);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      inquiry,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
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
    const { status, notes } = body;

    const validStatuses = ["new", "contacted", "in_progress", "converted", "closed", "spam"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateInquiry(id, {
      status,
      notes: notes !== undefined ? notes : existing.notes,
    });

    return NextResponse.json({
      ok: true,
      inquiry: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
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

    await deleteInquiry(id);

    return NextResponse.json({
      ok: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete inquiry";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
