import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getBrainServices, createBrainService, getBrainServiceBySlug } from "@/lib/db/queries/brain";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const itemType = searchParams.get("itemType") || undefined;
    const search = searchParams.get("search") || undefined;
    const activeParam = searchParams.get("active");
    const isActive = activeParam !== null ? activeParam === "true" : undefined;

    const items = await getBrainServices({ category, itemType, search, isActive });

    const formatted = items.map((item) => ({
      ...item,
      inclusionsList: item.inclusions ? JSON.parse(item.inclusions) : [],
      exclusionsList: item.exclusions ? JSON.parse(item.exclusions) : [],
      metadataObj: item.metadata ? JSON.parse(item.metadata) : {},
    }));

    return NextResponse.json({ ok: true, count: formatted.length, services: formatted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain services";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug: rawSlug,
      description,
      category = "general",
      itemType = "service",
      pricingType = "fixed",
      price,
      startingPrice,
      currency = "LKR",
      unit,
      adBudgetSeparate = false,
      sku,
      inclusions,
      exclusions,
      metadata,
      isActive = true,
      displayOrder = 0,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Service name is required." }, { status: 400 });
    }

    const slug = (rawSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required." }, { status: 400 });
    }

    const existing = await getBrainServiceBySlug(slug);
    if (existing) {
      return NextResponse.json(
        { error: `The slug '${slug}' is already in use by another Brain service.` },
        { status: 409 }
      );
    }

    const id = body.id || `bsrv_${crypto.randomUUID()}`;

    const formattedInclusions = Array.isArray(inclusions)
      ? JSON.stringify(inclusions)
      : typeof inclusions === "string"
      ? inclusions
      : null;

    const formattedExclusions = Array.isArray(exclusions)
      ? JSON.stringify(exclusions)
      : typeof exclusions === "string"
      ? exclusions
      : null;

    const formattedMetadata = typeof metadata === "object" && metadata !== null
      ? JSON.stringify(metadata)
      : typeof metadata === "string"
      ? metadata
      : null;

    const created = await createBrainService({
      id,
      slug,
      name: name.trim(),
      description: description ? String(description).trim() : null,
      category: String(category).trim().toLowerCase(),
      itemType: itemType === "package" ? "package" : "service",
      pricingType: ["fixed", "starting_from", "custom_quote"].includes(pricingType)
        ? pricingType
        : "fixed",
      price: price != null && price !== "" ? Number(price) : null,
      startingPrice: startingPrice != null && startingPrice !== "" ? Number(startingPrice) : null,
      currency: String(currency || "LKR").trim().toUpperCase(),
      unit: unit ? String(unit).trim() : null,
      adBudgetSeparate: Boolean(adBudgetSeparate),
      sku: sku ? String(sku).trim() : null,
      inclusions: formattedInclusions,
      exclusions: formattedExclusions,
      metadata: formattedMetadata,
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json({ ok: true, service: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Brain service";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
