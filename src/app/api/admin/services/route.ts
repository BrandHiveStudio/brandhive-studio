import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder));

    const formatted = records.map((s) => ({
      ...s,
      featuresList: s.features ? JSON.parse(s.features) : [],
      tagsList: s.tags ? JSON.parse(s.tags) : [],
    }));

    return NextResponse.json({
      ok: true,
      services: formatted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error fetching services";
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
      title,
      slug: rawSlug,
      badge,
      shortDescription,
      description,
      imageUrl,
      features,
      tags,
      displayOrder,
      isPublished,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Service title and description are required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const slug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `The slug '${slug}' is already in use by another service.` },
        { status: 409 }
      );
    }

    const serviceId = "srv_" + crypto.randomUUID();

    const formattedFeatures = Array.isArray(features)
      ? JSON.stringify(features)
      : typeof features === "string"
      ? features
      : "[]";

    const formattedTags = Array.isArray(tags)
      ? JSON.stringify(tags)
      : typeof tags === "string"
      ? tags
      : "[]";

    await db.insert(services).values({
      id: serviceId,
      slug,
      badge: badge?.trim() || null,
      title: title.trim(),
      shortDescription: shortDescription?.trim() || null,
      description: description.trim(),
      imageUrl: imageUrl?.trim() || null,
      features: formattedFeatures,
      tags: formattedTags,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    return NextResponse.json({
      ok: true,
      message: "Service created successfully",
      service: { id: serviceId, slug, title },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error creating service";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
