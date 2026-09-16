import { db } from "@/lib/db";
import { externalLinks } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { ExternalLink, NewExternalLink } from "@/lib/db/schema";

export interface PublicLink {
  id: string;
  platform: string;
  url: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export const fallbackLinks: PublicLink[] = [
  {
    id: "link_seed_facebook",
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/brandhivestudiolk",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "link_seed_instagram",
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/brandhivestudiolk",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "link_seed_tiktok",
    platform: "tiktok",
    label: "TikTok",
    url: "https://www.tiktok.com/@brandhivestudiolk",
    displayOrder: 3,
    isActive: true,
  },
  {
    id: "link_seed_whatsapp",
    platform: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/94706410093",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: "link_seed_phone",
    platform: "phone",
    label: "Phone",
    url: "tel:+94706410093",
    displayOrder: 5,
    isActive: true,
  },
  {
    id: "link_seed_email",
    platform: "email",
    label: "Email",
    url: "mailto:brandhive.studio.lk@gmail.com",
    displayOrder: 6,
    isActive: true,
  },
  {
    id: "link_seed_linkedin",
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/brandhivestudio",
    displayOrder: 7,
    isActive: true,
  },
];

/**
 * Public: Fetches all active links ordered by displayOrder.
 * Safely falls back to verified static links if database is empty or unreachable.
 */
export async function getActiveLinks(): Promise<PublicLink[]> {
  try {
    const records = await db
      .select()
      .from(externalLinks)
      .where(eq(externalLinks.isActive, true))
      .orderBy(asc(externalLinks.displayOrder));

    if (!records || records.length === 0) {
      return fallbackLinks;
    }

    return records.map((r) => ({
      id: r.id,
      platform: r.platform,
      url: r.url,
      label: r.label,
      displayOrder: r.displayOrder ?? 0,
      isActive: Boolean(r.isActive),
    }));
  } catch (error) {
    console.warn("⚠️ Failed to load external links from Turso database. Using fallback links:", error);
    return fallbackLinks;
  }
}

export interface GetAllLinksFilter {
  search?: string;
  platform?: string;
  isActive?: boolean;
}

/**
 * Admin: Fetches all external links with optional filtering.
 */
export async function getAllLinks(filter?: GetAllLinksFilter): Promise<ExternalLink[]> {
  try {
    const conditions = [];

    if (filter?.search && filter.search.trim()) {
      const term = `%${filter.search.trim().toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${externalLinks.label})`, term),
          like(sql`lower(${externalLinks.url})`, term),
          like(sql`lower(${externalLinks.platform})`, term)
        )
      );
    }

    if (filter?.platform && filter.platform !== "all") {
      conditions.push(eq(sql`lower(${externalLinks.platform})`, filter.platform.toLowerCase()));
    }

    if (filter?.isActive !== undefined) {
      conditions.push(eq(externalLinks.isActive, filter.isActive));
    }

    let query = db.select().from(externalLinks);

    if (conditions.length > 0) {
      // @ts-expect-error Drizzle multiple conditions
      query = query.where(and(...conditions));
    }

    const records = await query.orderBy(asc(externalLinks.displayOrder));
    return records;
  } catch (error) {
    console.error("Error in getAllLinks query:", error);
    throw error;
  }
}

/**
 * Admin: Get single external link by ID.
 */
export async function getLinkById(id: string): Promise<ExternalLink | null> {
  const [item] = await db
    .select()
    .from(externalLinks)
    .where(eq(externalLinks.id, id))
    .limit(1);

  return item || null;
}

/**
 * Admin: Create a new external link.
 */
export async function createLink(data: Omit<NewExternalLink, "id" | "createdAt">): Promise<ExternalLink> {
  const id = `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const [item] = await db
    .insert(externalLinks)
    .values({
      id,
      platform: data.platform.trim().toLowerCase(),
      url: data.url.trim(),
      label: data.label.trim(),
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    })
    .returning();

  return item;
}

/**
 * Admin: Update an existing external link.
 */
export async function updateLink(id: string, data: Partial<NewExternalLink>): Promise<ExternalLink | null> {
  const updatePayload: Record<string, unknown> = {};

  if (data.platform !== undefined) updatePayload.platform = data.platform.trim().toLowerCase();
  if (data.url !== undefined) updatePayload.url = data.url.trim();
  if (data.label !== undefined) updatePayload.label = data.label.trim();
  if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  if (Object.keys(updatePayload).length === 0) {
    return getLinkById(id);
  }

  const [updated] = await db
    .update(externalLinks)
    .set(updatePayload)
    .where(eq(externalLinks.id, id))
    .returning();

  return updated || null;
}

/**
 * Admin: Delete an external link.
 */
export async function deleteLink(id: string): Promise<boolean> {
  const result = await db.delete(externalLinks).where(eq(externalLinks.id, id));
  return Boolean(result);
}

/**
 * Admin: Quick toggle active status.
 */
export async function toggleLinkActive(id: string): Promise<ExternalLink | null> {
  const existing = await getLinkById(id);
  if (!existing) return null;

  const [updated] = await db
    .update(externalLinks)
    .set({
      isActive: !existing.isActive,
    })
    .where(eq(externalLinks.id, id))
    .returning();

  return updated || null;
}
