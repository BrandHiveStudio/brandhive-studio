import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { Faq, NewFaq } from "@/lib/db/schema";
import { fallbackFaqs, type PublicFaq } from "@/data/faqs";

export { fallbackFaqs, type PublicFaq };

/**
 * Retrieves all published FAQs ordered by displayOrder for the public website.
 * Falls back to fallbackFaqs if the database is empty or unavailable.
 */
export async function getPublishedFaqs(): Promise<PublicFaq[]> {
  try {
    const records = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isPublished, true))
      .orderBy(asc(faqs.displayOrder));

    if (!records || records.length === 0) {
      return fallbackFaqs;
    }

    return records.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category || "General",
      displayOrder: r.displayOrder || 0,
    }));
  } catch (err) {
    console.error("Error querying published FAQs from Turso, using fallback:", err);
    return fallbackFaqs;
  }
}

/**
 * Admin: Get all FAQs with optional search and category filter.
 */
export async function getAllFaqs(options?: { category?: string; search?: string }) {
  const conditions = [];

  if (options?.category && options.category !== "all") {
    conditions.push(eq(faqs.category, options.category));
  }

  if (options?.search && options.search.trim()) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${faqs.question})`, term),
        like(sql`lower(${faqs.answer})`, term),
        like(sql`lower(${faqs.category})`, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select()
    .from(faqs)
    .where(whereClause)
    .orderBy(asc(faqs.displayOrder));

  return items;
}

/**
 * Admin: Retrieve a single FAQ by ID.
 */
export async function getFaqById(id: string): Promise<Faq | null> {
  const [item] = await db
    .select()
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);

  return item || null;
}

/**
 * Admin: Create a new FAQ.
 */
export async function createFaq(data: Omit<NewFaq, "id" | "createdAt" | "updatedAt">): Promise<Faq> {
  const id = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const [item] = await db
    .insert(faqs)
    .values({
      id,
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category?.trim() || "General",
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished ?? true,
    })
    .returning();

  return item;
}

/**
 * Admin: Update an existing FAQ.
 */
export async function updateFaq(id: string, data: Partial<NewFaq>): Promise<Faq | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (data.question !== undefined) updatePayload.question = data.question.trim();
  if (data.answer !== undefined) updatePayload.answer = data.answer.trim();
  if (data.category !== undefined) updatePayload.category = data.category.trim();
  if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
  if (data.isPublished !== undefined) updatePayload.isPublished = data.isPublished;

  const [item] = await db
    .update(faqs)
    .set(updatePayload)
    .where(eq(faqs.id, id))
    .returning();

  return item || null;
}

/**
 * Admin: Delete an FAQ.
 */
export async function deleteFaq(id: string): Promise<boolean> {
  await db.delete(faqs).where(eq(faqs.id, id));
  return true;
}

/**
 * Admin: Toggle FAQ publication status.
 */
export async function toggleFaqPublish(id: string): Promise<Faq | null> {
  const existing = await getFaqById(id);
  if (!existing) return null;

  const newStatus = !existing.isPublished;
  const [updated] = await db
    .update(faqs)
    .set({
      isPublished: newStatus,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(faqs.id, id))
    .returning();

  return updated || null;
}
