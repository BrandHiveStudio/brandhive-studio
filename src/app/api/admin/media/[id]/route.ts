import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { media, projects, projectImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/storage/r2";

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
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const mediaRecords = await db.select().from(media).where(eq(media.id, id)).limit(1);
    if (mediaRecords.length === 0) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    const item = mediaRecords[0];

    // Check references in projects and project_images
    const referencingProjects = await db
      .select({ id: projects.id, title: projects.title, cover: projects.coverImage, logo: projects.logoImage })
      .from(projects);

    const referencingGallery = await db
      .select({ id: projectImages.id, projectId: projectImages.projectId, url: projectImages.imageUrl })
      .from(projectImages);

    const usage: Array<{ id: string; title: string; location: string }> = [];

    for (const p of referencingProjects) {
      if (p.cover && (p.cover.includes(item.storageKey) || p.cover === item.publicUrl)) {
        usage.push({ id: p.id, title: p.title, location: "Project Cover" });
      }
      if (p.logo && (p.logo.includes(item.storageKey) || p.logo === item.publicUrl)) {
        usage.push({ id: p.id, title: p.title, location: "Project Logo" });
      }
    }

    for (const g of referencingGallery) {
      if (g.url && (g.url.includes(item.storageKey) || g.url === item.publicUrl)) {
        const parentProject = referencingProjects.find((p) => p.id === g.projectId);
        usage.push({
          id: g.id,
          title: parentProject ? parentProject.title : "Project Gallery",
          location: "Gallery Image",
        });
      }
    }

    // Safety guard: prevent accidental deletion of referenced media unless force=true
    if (usage.length > 0 && !force) {
      return NextResponse.json(
        {
          error: "Media is actively referenced by one or more published items.",
          inUse: true,
          usage,
        },
        { status: 409 }
      );
    }

    // Attempt deletion from Cloudflare R2
    try {
      await deleteFromR2(item.storageKey);
    } catch (r2Error) {
      console.warn("Could not delete object from R2 (may already be removed or permission denied):", r2Error);
    }

    // Delete record from Turso
    await db.delete(media).where(eq(media.id, id));

    return NextResponse.json({
      ok: true,
      message: "Media deleted successfully",
      deletedId: id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error during media deletion";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
