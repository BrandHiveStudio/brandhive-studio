import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getBrainAddonById,
  updateBrainAddon,
  deleteBrainAddon,
} from "@/lib/db/queries/brain";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const addon = await getBrainAddonById(id);
    if (!addon) {
      return NextResponse.json({ error: "Brain add-on not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, addon });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain add-on";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getBrainAddonById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain add-on not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Add-on name cannot be empty." }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.serviceId !== undefined) {
      updateData.serviceId = body.serviceId && body.serviceId.trim() ? body.serviceId.trim() : null;
    }

    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.pricingType !== undefined) {
      updateData.pricingType = ["fixed", "starting_from", "custom_quote"].includes(body.pricingType)
        ? body.pricingType
        : "fixed";
    }
    if (body.price !== undefined) updateData.price = body.price != null && body.price !== "" ? Number(body.price) : null;
    if (body.startingPrice !== undefined) updateData.startingPrice = body.startingPrice != null && body.startingPrice !== "" ? Number(body.startingPrice) : null;
    if (body.currency !== undefined) updateData.currency = String(body.currency || "LKR").trim().toUpperCase();
    if (body.unit !== undefined) updateData.unit = body.unit ? String(body.unit).trim() : null;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder) || 0;

    const updated = await updateBrainAddon(id, updateData);
    return NextResponse.json({ ok: true, addon: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Brain add-on";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getBrainAddonById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain add-on not found" }, { status: 404 });
    }

    const success = await deleteBrainAddon(id);
    return NextResponse.json({ ok: success, message: "Brain add-on deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Brain add-on";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
