import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import crypto from "crypto";
import type { Testimonial } from "@/lib/db/schema";

export interface PublicTestimonial {
  id: string;
  client: string;
  company: string;
  role: string;
  review: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  displayOrder: number;
  isPublished: boolean;
}

/**
 * Fetches all published testimonials ordered by displayOrder for the public website.
 */
export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    const records = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isPublished, true))
      .orderBy(asc(testimonials.displayOrder));

    return records.map((r) => ({
      id: r.id,
      client: r.clientName,
      company: r.company,
      role: r.role || "Client",
      review: r.review,
      logoUrl: r.logoUrl || null,
      avatarUrl: r.avatarUrl || null,
      displayOrder: r.displayOrder || 0,
      isPublished: Boolean(r.isPublished),
    }));
  } catch (error) {
    console.error("Error fetching published testimonials from Turso:", error);
    return [];
  }
}

/**
 * Admin: Fetches all testimonials ordered by displayOrder.
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    return await db.select().from(testimonials).orderBy(asc(testimonials.displayOrder));
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    return [];
  }
}

export interface CreateTestimonialInput {
  clientName: string;
  company: string;
  role?: string;
  review: string;
  logoUrl?: string;
  avatarUrl?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export async function createTestimonial(input: CreateTestimonialInput) {
  const id = "tst_" + crypto.randomUUID();
  const [created] = await db
    .insert(testimonials)
    .values({
      id,
      clientName: input.clientName,
      company: input.company,
      role: input.role || "Client",
      review: input.review,
      logoUrl: input.logoUrl || null,
      avatarUrl: input.avatarUrl || null,
      displayOrder: input.displayOrder ?? 0,
      isPublished: input.isPublished !== undefined ? input.isPublished : true,
      createdAt: sql`(unixepoch())`,
      updatedAt: sql`(unixepoch())`,
    })
    .returning();
  return created;
}

export async function updateTestimonial(id: string, updates: Partial<CreateTestimonialInput>) {
  const setValues: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (updates.clientName !== undefined) setValues.clientName = updates.clientName;
  if (updates.company !== undefined) setValues.company = updates.company;
  if (updates.role !== undefined) setValues.role = updates.role;
  if (updates.review !== undefined) setValues.review = updates.review;
  if (updates.logoUrl !== undefined) setValues.logoUrl = updates.logoUrl;
  if (updates.avatarUrl !== undefined) setValues.avatarUrl = updates.avatarUrl;
  if (updates.displayOrder !== undefined) setValues.displayOrder = updates.displayOrder;
  if (updates.isPublished !== undefined) setValues.isPublished = updates.isPublished;

  const [updated] = await db
    .update(testimonials)
    .set(setValues)
    .where(eq(testimonials.id, id))
    .returning();
  return updated;
}

export async function deleteTestimonial(id: string) {
  return await db.delete(testimonials).where(eq(testimonials.id, id));
}
