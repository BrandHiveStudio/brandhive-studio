import { db } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { Faq, NewFaq } from "@/lib/db/schema";

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

export const fallbackFaqs: PublicFaq[] = [
  {
    id: "faq_seed_01",
    question: "What services does BrandHive Studio specialize in?",
    answer:
      "BrandHive Studio specializes in comprehensive Brand Strategy & Visual Identity, Custom Website Design & Next.js Development, UI/UX Design Systems, and Growth Marketing & SEO engineered to scale modern luxury, tech, and enterprise businesses.",
    category: "Services",
    displayOrder: 1,
  },
  {
    id: "faq_seed_02",
    question: "How long does a typical branding or website project take?",
    answer:
      "Comprehensive brand identity projects generally require 2–4 weeks. Complete bespoke website design and Next.js development projects typically take 4–6 weeks, depending on project complexity, custom feature requirements, and client review cycles.",
    category: "Timeline",
    displayOrder: 2,
  },
  {
    id: "faq_seed_03",
    question: "How does your project collaboration and design process work?",
    answer:
      "We operate on a transparent 5-stage framework: Discovery, Strategy, Design, Development, and Launch. Clients receive dedicated sprint updates, interactive Figma walkthroughs, and clear milestone sign-offs at each phase.",
    category: "Process",
    displayOrder: 3,
  },
  {
    id: "faq_seed_04",
    question: "How do you structure project pricing and payment terms?",
    answer:
      "We provide clear, fixed-scope proposals tailored to your specific project goals. Payments are typically split into structured milestones: a project kick-off deposit, an intermediate review milestone, and a final launch sign-off.",
    category: "Pricing",
    displayOrder: 4,
  },
  {
    id: "faq_seed_05",
    question: "Can you redesign or migrate an existing website?",
    answer:
      "Yes. We specialize in transforming outdated websites into ultra-fast, modern Next.js web applications with responsive aesthetics, sub-second load times, technical SEO compliance, and modern headless CMS integration.",
    category: "Development",
    displayOrder: 5,
  },
  {
    id: "faq_seed_06",
    question: "Do you provide post-launch maintenance and technical support?",
    answer:
      "Absolutely. We offer dedicated post-launch support, managed cloud hosting maintenance, continuous security updates, and flexible monthly retainer agreements for ongoing feature iteration and growth marketing.",
    category: "Support",
    displayOrder: 6,
  },
];

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
