import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { projects, projectImages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.displayOrder), asc(projects.createdAt));

    // Also count images for each project
    const allImages = await db.select({ projectId: projectImages.projectId }).from(projectImages);
    const imageCountMap = new Map<string, number>();
    for (const img of allImages) {
      imageCountMap.set(img.projectId, (imageCountMap.get(img.projectId) || 0) + 1);
    }

    const result = allProjects.map((p) => ({
      ...p,
      imageCount: imageCountMap.get(p.id) || 0,
      deliverablesList: p.deliverables ? JSON.parse(p.deliverables) : [],
    }));

    return NextResponse.json({ ok: true, projects: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
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
      category,
      shortDescription,
      description,
      coverImage,
      logoImage,
      client: clientName,
      role,
      year,
      deliverables,
      isFeatured,
      isOngoing,
      isPublished,
      displayOrder,
      images,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Project title is required." }, { status: 400 });
    }

    const slug = (rawSlug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `The slug '${slug}' is already in use by another project.` },
        { status: 409 }
      );
    }

    const projectId = "proj_" + crypto.randomUUID();

    const formattedDeliverables = Array.isArray(deliverables)
      ? JSON.stringify(deliverables)
      : typeof deliverables === "string"
      ? deliverables
      : "[]";

    await db.insert(projects).values({
      id: projectId,
      slug,
      title: title.trim(),
      category: category ? category.trim() : "General",
      shortDescription: shortDescription?.trim() || null,
      description: description?.trim() || null,
      coverImage: coverImage?.trim() || null,
      logoImage: logoImage?.trim() || null,
      client: clientName?.trim() || null,
      role: role?.trim() || null,
      year: year ? String(year).trim() : new Date().getFullYear().toString(),
      deliverables: formattedDeliverables,
      isFeatured: Boolean(isFeatured),
      isOngoing: Boolean(isOngoing),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
    });

    // If gallery images were passed, insert them
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.imageUrl) {
          await db.insert(projectImages).values({
            id: "pimg_" + crypto.randomUUID(),
            projectId,
            imageUrl: img.imageUrl,
            caption: img.caption || null,
            section: img.section || "Gallery",
            displayOrder: typeof img.displayOrder === "number" ? img.displayOrder : i,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Project created successfully",
      project: { id: projectId, slug, title },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
