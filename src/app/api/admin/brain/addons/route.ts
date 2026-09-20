import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getBrainAddons, createBrainAddon } from "@/lib/db/queries/brain";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId") || undefined;
    const activeParam = searchParams.get("active");
    const isActive = activeParam !== null ? activeParam === "true" : undefined;

    const addons = await getBrainAddons({ serviceId, isActive });
    return NextResponse.json({ ok: true, count: addons.length, addons });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch Brain add-ons";
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
      serviceId,
      description,
      pricingType = "fixed",
      price,
      startingPrice,
      currency = "LKR",
      unit,
      isActive = true,
      displayOrder = 0,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Add-on name is required." }, { status: 400 });
    }

    const id = body.id || `badd_${crypto.randomUUID()}`;

    const created = await createBrainAddon({
      id,
      name: name.trim(),
      serviceId: serviceId && serviceId.trim() ? serviceId.trim() : null,
      description: description ? String(description).trim() : null,
      pricingType: ["fixed", "starting_from", "custom_quote"].includes(pricingType)
        ? pricingType
        : "fixed",
      price: price != null && price !== "" ? Number(price) : null,
      startingPrice: startingPrice != null && startingPrice !== "" ? Number(startingPrice) : null,
      currency: String(currency || "LKR").trim().toUpperCase(),
      unit: unit ? String(unit).trim() : null,
      isActive: Boolean(isActive),
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json({ ok: true, addon: created }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create Brain add-on";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
