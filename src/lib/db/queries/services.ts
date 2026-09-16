import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import crypto from "crypto";
import type { Service } from "@/lib/db/schema";

export interface PublicService {
  id: string;
  slug: string;
  badge: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  features: string[];
  tags: string[];
  displayOrder: number;
  isPublished: boolean;
}

/**
 * Fetches all published services ordered by displayOrder for the public website.
 */
export async function getPublishedServices(): Promise<PublicService[]> {
  try {
    const records = await db
      .select()
      .from(services)
      .where(eq(services.isPublished, true))
      .orderBy(asc(services.displayOrder));

    return records.map((r) => {
      let features: string[] = [];
      try {
        features = r.features ? JSON.parse(r.features) : [];
      } catch {
        features = [];
      }

      let tags: string[] = [];
      try {
        tags = r.tags ? JSON.parse(r.tags) : [];
      } catch {
        tags = [];
      }

      return {
        id: r.id,
        slug: r.slug,
        badge: r.badge || "EXPERTISE",
        title: r.title,
        shortDescription: r.shortDescription || "",
        description: r.description,
        imageUrl: r.imageUrl || "/images/services/branding/service-brand-strategy-workshop.webp",
        features,
        tags,
        displayOrder: r.displayOrder || 0,
        isPublished: Boolean(r.isPublished),
      };
    });
  } catch (error) {
    console.error("Error fetching published services from Turso:", error);
    return [];
  }
}

/**
 * Admin: Fetches all services ordered by displayOrder.
 */
export async function getAllServices(): Promise<Service[]> {
  try {
    return await db.select().from(services).orderBy(asc(services.displayOrder));
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
}

export interface CreateServiceInput {
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  badge?: string;
  imageUrl?: string;
  features?: string[];
  tags?: string[];
  displayOrder?: number;
  isPublished?: boolean;
}

export async function createService(input: CreateServiceInput) {
  const id = "srv_" + crypto.randomUUID();
  const [created] = await db
    .insert(services)
    .values({
      id,
      slug: input.slug,
      title: input.title,
      description: input.description,
      shortDescription: input.shortDescription || null,
      badge: input.badge || null,
      imageUrl: input.imageUrl || null,
      features: input.features ? JSON.stringify(input.features) : null,
      tags: input.tags ? JSON.stringify(input.tags) : null,
      displayOrder: input.displayOrder ?? 0,
      isPublished: input.isPublished !== undefined ? input.isPublished : true,
      createdAt: sql`(unixepoch())`,
      updatedAt: sql`(unixepoch())`,
    })
    .returning();
  return created;
}

export async function updateService(id: string, updates: Partial<CreateServiceInput>) {
  const setValues: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (updates.slug !== undefined) setValues.slug = updates.slug;
  if (updates.title !== undefined) setValues.title = updates.title;
  if (updates.description !== undefined) setValues.description = updates.description;
  if (updates.shortDescription !== undefined) setValues.shortDescription = updates.shortDescription;
  if (updates.badge !== undefined) setValues.badge = updates.badge;
  if (updates.imageUrl !== undefined) setValues.imageUrl = updates.imageUrl;
  if (updates.features !== undefined) setValues.features = JSON.stringify(updates.features);
  if (updates.tags !== undefined) setValues.tags = JSON.stringify(updates.tags);
  if (updates.displayOrder !== undefined) setValues.displayOrder = updates.displayOrder;
  if (updates.isPublished !== undefined) setValues.isPublished = updates.isPublished;

  const [updated] = await db
    .update(services)
    .set(setValues)
    .where(eq(services.id, id))
    .returning();
  return updated;
}

export async function deleteService(id: string) {
  return await db.delete(services).where(eq(services.id, id));
}
