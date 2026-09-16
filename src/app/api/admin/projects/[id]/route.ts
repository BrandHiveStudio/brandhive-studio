import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { projects, projectImages } from "@/lib/db/schema";
import { eq, and, ne, asc } from "drizzle-orm";
import crypto from "crypto";

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
    const projectList = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (projectList.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectList[0];
    const images = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(asc(projectImages.displayOrder));

    return NextResponse.json({
      ok: true,
      project: {
        ...project,
        deliverablesList: project.deliverables ? JSON.parse(project.deliverables) : [],
        images,
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

    // Check project existence
    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

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

    // Check slug uniqueness against OTHER projects
    const duplicateSlug = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.slug, slug), ne(projects.id, id)))
      .limit(1);

    if (duplicateSlug.length > 0) {
      return NextResponse.json(
        { error: `The slug '${slug}' is already in use by another project.` },
        { status: 409 }
      );
    }

    const formattedDeliverables = Array.isArray(deliverables)
      ? JSON.stringify(deliverables)
      : typeof deliverables === "string"
      ? deliverables
      : "[]";

    await db
      .update(projects)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // If gallery images array provided, replace associated images
    if (Array.isArray(images)) {
      await db.delete(projectImages).where(eq(projectImages.projectId, id));

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.imageUrl) {
          await db.insert(projectImages).values({
            id: "pimg_" + crypto.randomUUID(),
            projectId: id,
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
      message: "Project updated successfully",
      project: { id, slug, title },
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

    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete associated images first (if not cascading)
    await db.delete(projectImages).where(eq(projectImages.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));

    return NextResponse.json({
      ok: true,
      message: "Project and associated media references deleted successfully.",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
