import { db } from "@/lib/db";
import { projects, projectImages } from "@/lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  cover: string;
  logo: string;
  client: string;
  role: string;
  year: string;
  badges: string[];
  isFeatured: boolean;
  isOngoing: boolean;
  displayOrder: number;
}

export interface ProjectSection {
  id: string;
  title: string;
  images: string[];
}

/**
 * Fetches all published projects for the public portfolio.
 */
export async function getPublishedProjects(): Promise<PublicProject[]> {
  try {
    const records = await db
      .select()
      .from(projects)
      .where(eq(projects.isPublished, true))
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

    return records.map((r) => {
      let badges: string[] = [];
      try {
        badges = r.deliverables ? JSON.parse(r.deliverables) : [];
      } catch {
        badges = [];
      }

      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category,
        shortDescription: r.shortDescription || "",
        description: r.description || "",
        cover: r.coverImage || "/images/hero/devices/hero-laptop-website-presentation.webp",
        logo: r.logoImage || "/favicon/brandhive-logo-master.png",
        client: r.client || "Client",
        role: r.role || "Partner",
        year: r.year || "2026",
        badges,
        isFeatured: Boolean(r.isFeatured),
        isOngoing: Boolean(r.isOngoing),
        displayOrder: r.displayOrder || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching published projects from Turso:", error);
    return [];
  }
}

/**
 * Fetches a single project by slug. If allowDraft is true, drafts can also be retrieved.
 */
export async function getProjectBySlug(
  slug: string,
  allowDraft: boolean = false
): Promise<{ project: PublicProject; sections: ProjectSection[]; isDraft?: boolean } | null> {
  try {
    const records = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (records.length === 0) {
      return null;
    }

    const r = records[0];
    if (!r.isPublished && !allowDraft) {
      return { isDraft: true, project: null as unknown as PublicProject, sections: [] };
    }
    let badges: string[] = [];
    try {
      badges = r.deliverables ? JSON.parse(r.deliverables) : [];
    } catch {
      badges = [];
    }

    const project: PublicProject = {
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      shortDescription: r.shortDescription || "",
      description: r.description || "",
      cover: r.coverImage || "/images/hero/devices/hero-laptop-website-presentation.webp",
      logo: r.logoImage || "/favicon/brandhive-logo-master.png",
      client: r.client || "Client",
      role: r.role || "Partner",
      year: r.year || "2026",
      badges,
      isFeatured: Boolean(r.isFeatured),
      isOngoing: Boolean(r.isOngoing),
      displayOrder: r.displayOrder || 0,
    };

    // Fetch associated project images
    const images = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, r.id))
      .orderBy(asc(projectImages.displayOrder));

    // Group images by section
    const sectionMap = new Map<string, string[]>();
    for (const img of images) {
      const secName = img.section || "Gallery";
      if (!sectionMap.has(secName)) {
        sectionMap.set(secName, []);
      }
      sectionMap.get(secName)!.push(img.imageUrl);
    }

    const sections: ProjectSection[] = Array.from(sectionMap.entries()).map(([title, imgs]) => ({
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
      images: imgs,
    }));

    return { project, sections };
  } catch (error) {
    console.error("Error fetching project by slug from Turso:", error);
    return null;
  }
}
