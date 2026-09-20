import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getBrainServiceById,
  updateBrainService,
  deleteBrainService,
  getBrainServiceBySlug,
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
    const service = await getBrainServiceById(id);
    if (!service) {
      return NextResponse.json({ error: "Brain service not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      service: {
        ...service,
        inclusionsList: service.inclusions ? JSON.parse(service.inclusions) : [],
        exclusionsList: service.exclusions ? JSON.parse(service.exclusions) : [],
        metadataObj: service.metadata ? JSON.parse(service.metadata) : {},
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain service";
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
    const existing = await getBrainServiceById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain service not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Service name cannot be empty." }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.slug !== undefined) {
      const cleanSlug = body.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!cleanSlug) {
        return NextResponse.json({ error: "Valid slug is required." }, { status: 400 });
      }
      if (cleanSlug !== existing.slug) {
        const duplicate = await getBrainServiceBySlug(cleanSlug);
        if (duplicate && duplicate.id !== id) {
          return NextResponse.json(
            { error: `The slug '${cleanSlug}' is already in use by another service.` },
            { status: 409 }
          );
        }
      }
      updateData.slug = cleanSlug;
    }

    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.category !== undefined) updateData.category = String(body.category).trim().toLowerCase();
    if (body.itemType !== undefined) updateData.itemType = body.itemType === "package" ? "package" : "service";
    if (body.pricingType !== undefined) {
      updateData.pricingType = ["fixed", "starting_from", "custom_quote"].includes(body.pricingType)
        ? body.pricingType
        : "fixed";
    }
    if (body.price !== undefined) updateData.price = body.price != null && body.price !== "" ? Number(body.price) : null;
    if (body.startingPrice !== undefined) updateData.startingPrice = body.startingPrice != null && body.startingPrice !== "" ? Number(body.startingPrice) : null;
    if (body.currency !== undefined) updateData.currency = String(body.currency || "LKR").trim().toUpperCase();
    if (body.unit !== undefined) updateData.unit = body.unit ? String(body.unit).trim() : null;
    if (body.adBudgetSeparate !== undefined) updateData.adBudgetSeparate = Boolean(body.adBudgetSeparate);
    if (body.sku !== undefined) updateData.sku = body.sku ? String(body.sku).trim() : null;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined) updateData.displayOrder = Number(body.displayOrder) || 0;

    if (body.inclusions !== undefined) {
      updateData.inclusions = Array.isArray(body.inclusions)
        ? JSON.stringify(body.inclusions)
        : typeof body.inclusions === "string"
        ? body.inclusions
        : null;
    }

    if (body.exclusions !== undefined) {
      updateData.exclusions = Array.isArray(body.exclusions)
        ? JSON.stringify(body.exclusions)
        : typeof body.exclusions === "string"
        ? body.exclusions
        : null;
    }

    if (body.metadata !== undefined) {
      updateData.metadata = typeof body.metadata === "object" && body.metadata !== null
        ? JSON.stringify(body.metadata)
        : typeof body.metadata === "string"
        ? body.metadata
        : null;
    }

    const updated = await updateBrainService(id, updateData);
    return NextResponse.json({ ok: true, service: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update Brain service";
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
    const existing = await getBrainServiceById(id);
    if (!existing) {
      return NextResponse.json({ error: "Brain service not found" }, { status: 404 });
    }

    const success = await deleteBrainService(id);
    return NextResponse.json({ ok: success, message: "Brain service deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete Brain service";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
