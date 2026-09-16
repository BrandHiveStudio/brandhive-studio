import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getProcessStepById,
  updateProcessStep,
  deleteProcessStep,
} from "@/lib/db/queries/process";

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
    const item = await getProcessStepById(id);

    if (!item) {
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      step: item,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch process step";
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
    const existing = await getProcessStepById(id);

    if (!existing) {
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      stepNumber,
      title,
      shortTitle,
      badge,
      shortDescription,
      description,
      icon,
      imageUrl,
      deliverables,
      displayOrder,
      isPublished,
    } = body;

    let deliverablesStr = existing.deliverables;
    if (deliverables !== undefined) {
      if (Array.isArray(deliverables)) {
        deliverablesStr = JSON.stringify(deliverables.map((d: string) => String(d).trim()).filter(Boolean));
      } else if (typeof deliverables === "string") {
        deliverablesStr = deliverables.trim();
      }
    }

    const updated = await updateProcessStep(id, {
      stepNumber: stepNumber !== undefined ? String(stepNumber).trim() : existing.stepNumber,
      title: title !== undefined ? String(title).trim() : existing.title,
      shortTitle: shortTitle !== undefined ? (shortTitle ? String(shortTitle).trim() : null) : existing.shortTitle,
      badge: badge !== undefined ? (badge ? String(badge).trim() : null) : existing.badge,
      shortDescription:
        shortDescription !== undefined
          ? shortDescription
            ? String(shortDescription).trim()
            : null
          : existing.shortDescription,
      description: description !== undefined ? String(description).trim() : existing.description,
      icon: icon !== undefined ? String(icon).trim() : existing.icon,
      imageUrl: imageUrl !== undefined ? (imageUrl ? String(imageUrl).trim() : null) : existing.imageUrl,
      deliverables: deliverablesStr,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : (existing.displayOrder ?? 0),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : Boolean(existing.isPublished),
    });

    return NextResponse.json({
      ok: true,
      step: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update process step";
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
    const existing = await getProcessStepById(id);

    if (!existing) {
      return NextResponse.json({ error: "Process step not found" }, { status: 404 });
    }

    await deleteProcessStep(id);

    return NextResponse.json({
      ok: true,
      message: "Process step deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete process step";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
