import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";

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
    const records = await db.select().from(services).where(eq(services.id, id)).limit(1);

    if (records.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const s = records[0];

    return NextResponse.json({
      ok: true,
      service: {
        ...s,
        featuresList: s.features ? JSON.parse(s.features) : [],
        tagsList: s.tags ? JSON.parse(s.tags) : [],
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
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

    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const slug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Verify slug uniqueness against other records
    const conflict = await db
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.slug, slug), ne(services.id, id)))
      .limit(1);

    if (conflict.length > 0) {
      return NextResponse.json(
        { error: `The slug '${slug}' is already in use by another service.` },
        { status: 409 }
      );
    }

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

    await db
      .update(services)
      .set({
        title: title.trim(),
        slug,
        badge: badge?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        features: formattedFeatures,
        tags: formattedTags,
        displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id));

    return NextResponse.json({
      ok: true,
      message: "Service updated successfully",
      service: { id, slug, title },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
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
    const existing = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.delete(services).where(eq(services.id, id));

    return NextResponse.json({
      ok: true,
      message: "Service deleted successfully",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
