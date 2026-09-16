import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getLinkById, updateLink, deleteLink } from "@/lib/db/queries/links";

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
    const item = await getLinkById(id);

    if (!item) {
      return NextResponse.json({ error: "External link not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      link: item,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch link";
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
    const existing = await getLinkById(id);

    if (!existing) {
      return NextResponse.json({ error: "External link not found" }, { status: 404 });
    }

    const body = await request.json();
    const { platform, label, url, displayOrder, isActive } = body;

    const updated = await updateLink(id, {
      platform: platform !== undefined ? String(platform).trim() : existing.platform,
      label: label !== undefined ? String(label).trim() : existing.label,
      url: url !== undefined ? String(url).trim() : existing.url,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : (existing.displayOrder ?? 0),
      isActive: isActive !== undefined ? Boolean(isActive) : Boolean(existing.isActive),
    });

    return NextResponse.json({
      ok: true,
      link: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update link";
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
    const existing = await getLinkById(id);

    if (!existing) {
      return NextResponse.json({ error: "External link not found" }, { status: 404 });
    }

    await deleteLink(id);

    return NextResponse.json({
      ok: true,
      message: "External link deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete link";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
