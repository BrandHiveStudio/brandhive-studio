import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { media, projects, projectImages } from "@/lib/db/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    // Base query
    let mediaList = await db
      .select()
      .from(media)
      .where(
        query
          ? or(
              like(media.filename, `%${query}%`),
              like(media.originalName, `%${query}%`),
              like(media.storageKey, `%${query}%`),
              like(media.altText, `%${query}%`)
            )
          : undefined
      )
      .orderBy(desc(media.createdAt));

    // Filter by category (prefix of storageKey, e.g. "projects/", "services/")
    if (category && category !== "all") {
      mediaList = mediaList.filter((m) => m.storageKey.startsWith(`${category}/`));
    }

    // Fetch references across projects and project_images for usage tracking
    const allProjects = await db
      .select({ id: projects.id, title: projects.title, cover: projects.coverImage, logo: projects.logoImage })
      .from(projects);

    const allProjectImages = await db
      .select({ id: projectImages.id, projectId: projectImages.projectId, url: projectImages.imageUrl, section: projectImages.section })
      .from(projectImages);

    // Map each media item with usage references
    const enrichedMedia = mediaList.map((item) => {
      const usedBy: Array<{ id: string; title: string; type: string }> = [];

      for (const p of allProjects) {
        if (p.cover && (p.cover.includes(item.storageKey) || p.cover === item.publicUrl)) {
          usedBy.push({ id: p.id, title: p.title, type: "Project Cover" });
        }
        if (p.logo && (p.logo.includes(item.storageKey) || p.logo === item.publicUrl)) {
          usedBy.push({ id: p.id, title: p.title, type: "Project Logo" });
        }
      }

      for (const pi of allProjectImages) {
        if (pi.url && (pi.url.includes(item.storageKey) || pi.url === item.publicUrl)) {
          const parentProject = allProjects.find((p) => p.id === pi.projectId);
          const projectTitle = parentProject ? parentProject.title : "Project Gallery";
          usedBy.push({ id: pi.id, title: projectTitle, type: `Gallery Image (${pi.section || "Showcase"})` });
        }
      }

      // Infer category from storageKey
      const keyParts = item.storageKey.split("/");
      const inferredCategory = keyParts.length > 1 ? keyParts[0] : "general";

      return {
        ...item,
        category: inferredCategory,
        isUsed: usedBy.length > 0,
        usedBy,
      };
    });

    return NextResponse.json({
      ok: true,
      media: enrichedMedia,
      totalCount: enrichedMedia.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal server error fetching media";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
