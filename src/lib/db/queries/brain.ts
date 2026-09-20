import { db } from "@/lib/db";
import {
  brainServices,
  brainAddons,
  brainFaqs,
  brainSettings,
  type BrainService,
  type NewBrainService,
  type BrainAddon,
  type NewBrainAddon,
  type BrainFaq,
  type NewBrainFaq,
  type BrainSetting,
  type NewBrainSetting,
} from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";

// ============================================================================
// 1. BRAIN SERVICES & PACKAGES
// ============================================================================

export async function getBrainServices(options?: {
  category?: string;
  itemType?: string;
  isActive?: boolean;
  search?: string;
}): Promise<BrainService[]> {
  const conditions = [];

  if (options?.category && options.category !== "all") {
    conditions.push(eq(brainServices.category, options.category));
  }

  if (options?.itemType && options.itemType !== "all") {
    conditions.push(eq(brainServices.itemType, options.itemType));
  }

  if (options?.isActive !== undefined) {
    conditions.push(eq(brainServices.isActive, options.isActive));
  }

  if (options?.search && options.search.trim()) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${brainServices.name})`, term),
        like(sql`lower(${brainServices.slug})`, term),
        like(sql`lower(${brainServices.description})`, term),
        like(sql`lower(${brainServices.category})`, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(brainServices)
    .where(whereClause)
    .orderBy(asc(brainServices.displayOrder), asc(brainServices.name));
}

export async function getBrainServiceById(id: string): Promise<BrainService | null> {
  const records = await db
    .select()
    .from(brainServices)
    .where(eq(brainServices.id, id))
    .limit(1);

  return records.length > 0 ? records[0] : null;
}

export async function getBrainServiceBySlug(slug: string): Promise<BrainService | null> {
  const records = await db
    .select()
    .from(brainServices)
    .where(eq(brainServices.slug, slug))
    .limit(1);

  return records.length > 0 ? records[0] : null;
}

export async function createBrainService(data: NewBrainService): Promise<BrainService> {
  const [created] = await db
    .insert(brainServices)
    .values(data)
    .returning();

  return created;
}

export async function updateBrainService(
  id: string,
  data: Partial<NewBrainService>
): Promise<BrainService | null> {
  const [updated] = await db
    .update(brainServices)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(brainServices.id, id))
    .returning();

  return updated || null;
}

export async function deleteBrainService(id: string): Promise<boolean> {
  const res = await db.delete(brainServices).where(eq(brainServices.id, id));
  return Boolean(res.rowsAffected && res.rowsAffected > 0);
}

// ============================================================================
// 2. BRAIN ADD-ONS
// ============================================================================

export async function getBrainAddons(options?: {
  serviceId?: string;
  isActive?: boolean;
}): Promise<BrainAddon[]> {
  const conditions = [];

  if (options?.serviceId !== undefined) {
    if (options.serviceId === "global" || options.serviceId === "none") {
      conditions.push(sql`${brainAddons.serviceId} IS NULL`);
    } else if (options.serviceId) {
      conditions.push(eq(brainAddons.serviceId, options.serviceId));
    }
  }

  if (options?.isActive !== undefined) {
    conditions.push(eq(brainAddons.isActive, options.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(brainAddons)
    .where(whereClause)
    .orderBy(asc(brainAddons.displayOrder), asc(brainAddons.name));
}

export async function getBrainAddonById(id: string): Promise<BrainAddon | null> {
  const records = await db
    .select()
    .from(brainAddons)
    .where(eq(brainAddons.id, id))
    .limit(1);

  return records.length > 0 ? records[0] : null;
}

export async function createBrainAddon(data: NewBrainAddon): Promise<BrainAddon> {
  const [created] = await db
    .insert(brainAddons)
    .values(data)
    .returning();

  return created;
}

export async function updateBrainAddon(
  id: string,
  data: Partial<NewBrainAddon>
): Promise<BrainAddon | null> {
  const [updated] = await db
    .update(brainAddons)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(brainAddons.id, id))
    .returning();

  return updated || null;
}

export async function deleteBrainAddon(id: string): Promise<boolean> {
  const res = await db.delete(brainAddons).where(eq(brainAddons.id, id));
  return Boolean(res.rowsAffected && res.rowsAffected > 0);
}

// ============================================================================
// 3. BRAIN FAQS
// ============================================================================

export async function getBrainFaqs(options?: {
  category?: string;
  isActive?: boolean;
  search?: string;
}): Promise<BrainFaq[]> {
  const conditions = [];

  if (options?.category && options.category !== "all") {
    conditions.push(eq(brainFaqs.category, options.category));
  }

  if (options?.isActive !== undefined) {
    conditions.push(eq(brainFaqs.isActive, options.isActive));
  }

  if (options?.search && options.search.trim()) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${brainFaqs.question})`, term),
        like(sql`lower(${brainFaqs.answer})`, term),
        like(sql`lower(${brainFaqs.category})`, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(brainFaqs)
    .where(whereClause)
    .orderBy(asc(brainFaqs.displayOrder), asc(brainFaqs.id));
}

export async function getBrainFaqById(id: string): Promise<BrainFaq | null> {
  const records = await db
    .select()
    .from(brainFaqs)
    .where(eq(brainFaqs.id, id))
    .limit(1);

  return records.length > 0 ? records[0] : null;
}

export async function createBrainFaq(data: NewBrainFaq): Promise<BrainFaq> {
  const [created] = await db
    .insert(brainFaqs)
    .values(data)
    .returning();

  return created;
}

export async function updateBrainFaq(
  id: string,
  data: Partial<NewBrainFaq>
): Promise<BrainFaq | null> {
  const [updated] = await db
    .update(brainFaqs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(brainFaqs.id, id))
    .returning();

  return updated || null;
}

export async function deleteBrainFaq(id: string): Promise<boolean> {
  const res = await db.delete(brainFaqs).where(eq(brainFaqs.id, id));
  return Boolean(res.rowsAffected && res.rowsAffected > 0);
}

// ============================================================================
// 4. BRAIN SETTINGS & POLICIES
// ============================================================================

export async function getBrainSettings(options?: {
  isActive?: boolean;
}): Promise<BrainSetting[]> {
  const conditions = [];

  if (options?.isActive !== undefined) {
    conditions.push(eq(brainSettings.isActive, options.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(brainSettings)
    .where(whereClause)
    .orderBy(asc(brainSettings.key));
}

export async function getBrainSettingByKey(key: string): Promise<BrainSetting | null> {
  const records = await db
    .select()
    .from(brainSettings)
    .where(eq(brainSettings.key, key))
    .limit(1);

  return records.length > 0 ? records[0] : null;
}

export async function upsertBrainSetting(data: NewBrainSetting): Promise<BrainSetting> {
  const existing = await getBrainSettingByKey(data.key);

  if (existing) {
    const [updated] = await db
      .update(brainSettings)
      .set({
        value: data.value,
        description: data.description !== undefined ? data.description : existing.description,
        isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
        updatedAt: new Date(),
      })
      .where(eq(brainSettings.key, data.key))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(brainSettings)
    .values(data)
    .returning();

  return created;
}

export async function deleteBrainSetting(key: string): Promise<boolean> {
  const res = await db.delete(brainSettings).where(eq(brainSettings.key, key));
  return Boolean(res.rowsAffected && res.rowsAffected > 0);
}
