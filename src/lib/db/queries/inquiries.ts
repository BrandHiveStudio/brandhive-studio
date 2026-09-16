import { db } from "@/lib/db";
import { contactInquiries } from "@/lib/db/schema";
import { eq, desc, sql, like, or, and } from "drizzle-orm";
import type { ContactInquiry, NewContactInquiry } from "@/lib/db/schema";

export type InquiryStatus = "new" | "contacted" | "in_progress" | "converted" | "closed" | "spam";

export interface InquiryFilterOptions {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Creates a new contact inquiry in the Turso database.
 */
export async function createInquiry(data: Omit<NewContactInquiry, "id" | "createdAt" | "updatedAt">): Promise<ContactInquiry> {
  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  const [inquiry] = await db
    .insert(contactInquiries)
    .values({
      id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      company: data.company?.trim() || null,
      service: data.service?.trim() || "General Inquiry",
      budget: data.budget?.trim() || null,
      message: data.message.trim(),
      status: data.status || "new",
      notes: data.notes?.trim() || null,
    })
    .returning();

  return inquiry;
}

/**
 * Fetches a list of inquiries with optional status filtering and search.
 */
export async function getInquiries(options: InquiryFilterOptions = {}) {
  const { status, search, limit = 50, offset = 0 } = options;

  const conditions = [];

  if (status && status !== "all") {
    conditions.push(eq(contactInquiries.status, status));
  }

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${contactInquiries.name})`, term),
        like(sql`lower(${contactInquiries.email})`, term),
        like(sql`lower(coalesce(${contactInquiries.company}, ''))`, term),
        like(sql`lower(coalesce(${contactInquiries.service}, ''))`, term),
        like(sql`lower(${contactInquiries.message})`, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select()
    .from(contactInquiries)
    .where(whereClause)
    .orderBy(desc(contactInquiries.createdAt))
    .limit(limit)
    .offset(offset);

  // Status counts aggregate for tabs
  const allRecords = await db
    .select({
      status: contactInquiries.status,
      count: sql<number>`count(*)`,
    })
    .from(contactInquiries)
    .groupBy(contactInquiries.status);

  const counts: Record<string, number> = {
    all: 0,
    new: 0,
    contacted: 0,
    in_progress: 0,
    converted: 0,
    closed: 0,
    spam: 0,
  };

  allRecords.forEach((r) => {
    const count = Number(r.count);
    counts.all += count;
    if (r.status in counts) {
      counts[r.status] = count;
    }
  });

  return {
    inquiries: items,
    counts,
  };
}

/**
 * Retrieves a single inquiry by ID.
 */
export async function getInquiryById(id: string): Promise<ContactInquiry | null> {
  const [inquiry] = await db
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, id))
    .limit(1);

  return inquiry || null;
}

/**
 * Updates an inquiry's status, internal notes, or other fields.
 */
export async function updateInquiry(
  id: string,
  data: Partial<Pick<ContactInquiry, "status" | "notes">>
): Promise<ContactInquiry | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (data.status !== undefined) {
    updatePayload.status = data.status;
  }

  if (data.notes !== undefined) {
    updatePayload.notes = data.notes;
  }

  const [updated] = await db
    .update(contactInquiries)
    .set(updatePayload)
    .where(eq(contactInquiries.id, id))
    .returning();

  return updated || null;
}

/**
 * Safely deletes an inquiry record.
 */
export async function deleteInquiry(id: string): Promise<boolean> {
  await db
    .delete(contactInquiries)
    .where(eq(contactInquiries.id, id));

  return true;
}
