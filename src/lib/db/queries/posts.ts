import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { Post, NewPost } from "@/lib/db/schema";
import { fallbackArticles, type PublicPost } from "@/data/articles";

export { fallbackArticles, type PublicPost };

function formatDisplayDate(dateVal: Date | number | null | undefined): string {
  if (!dateVal) return "Recently";
  try {
    const d = typeof dateVal === "number" ? new Date(dateVal * 1000) : new Date(dateVal);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function parseTags(rawTags: string | null | undefined): string[] {
  if (!rawTags) return [];
  try {
    const parsed = JSON.parse(rawTags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return rawTags.split(",").map((t) => t.trim()).filter(Boolean);
  }
}

/**
 * Public: Get all published blog posts / insights ordered by displayOrder asc.
 */
export async function getPublishedPosts(): Promise<PublicPost[]> {
  try {
    const records = await db
      .select()
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(asc(posts.displayOrder));

    if (!records || records.length === 0) {
      return fallbackArticles;
    }

    return records.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.excerpt || "",
      content: r.content,
      image: r.coverImage || "/images/services/insights/branding-hero.webp",
      category: r.category || "Branding",
      author: r.author || "BrandHive Studio",
      date: formatDisplayDate(r.publishedAt || r.createdAt),
      readTime: r.readTime || "5 MIN READ",
      isFeatured: Boolean(r.isFeatured),
      tags: parseTags(r.tags),
    }));
  } catch (err) {
    console.error("Failed to query published posts from Turso, using fallback:", err);
    return fallbackArticles;
  }
}

/**
 * Public/Admin: Retrieve single post by slug with draft protection.
 */
export async function getPostBySlug(slug: string, allowDraft: boolean = false): Promise<PublicPost | null> {
  try {
    const [record] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (record) {
      if (!record.isPublished && !allowDraft) {
        return null;
      }
      return {
        id: record.id,
        slug: record.slug,
        title: record.title,
        description: record.excerpt || "",
        content: record.content,
        image: record.coverImage || "/images/services/insights/branding-hero.webp",
        category: record.category || "Branding",
        author: record.author || "BrandHive Studio",
        date: formatDisplayDate(record.publishedAt || record.createdAt),
        readTime: record.readTime || "5 MIN READ",
        isFeatured: Boolean(record.isFeatured),
        tags: parseTags(record.tags),
      };
    }
  } catch (err) {
    console.error("Failed to fetch post by slug from Turso:", err);
  }

  // Fallback match only if record does not exist in Turso
  const fallback = fallbackArticles.find((a) => a.slug === slug);
  return fallback || null;
}

/**
 * Admin: Retrieve all posts with optional search and category filtering.
 */
export async function getAllPosts(options?: { category?: string; search?: string }) {
  const conditions = [];

  if (options?.category && options.category !== "all") {
    conditions.push(eq(posts.category, options.category));
  }

  if (options?.search && options.search.trim()) {
    const term = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${posts.title})`, term),
        like(sql`lower(coalesce(${posts.excerpt}, ''))`, term),
        like(sql`lower(${posts.category})`, term),
        like(sql`lower(${posts.slug})`, term)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(asc(posts.displayOrder));

  return items;
}

/**
 * Admin: Retrieve a single post by ID.
 */
export async function getPostById(id: string): Promise<Post | null> {
  const [record] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  return record || null;
}

/**
 * Admin: Create a new post.
 */
export async function createPost(data: Omit<NewPost, "id" | "createdAt" | "updatedAt">): Promise<Post> {
  const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const [record] = await db
    .insert(posts)
    .values({
      id,
      slug: data.slug.trim().toLowerCase(),
      title: data.title.trim(),
      excerpt: data.excerpt?.trim() || null,
      content: data.content.trim(),
      coverImage: data.coverImage?.trim() || null,
      category: data.category?.trim() || "Branding",
      author: data.author?.trim() || "BrandHive Studio",
      readTime: data.readTime?.trim() || "5 MIN READ",
      tags: data.tags || null,
      isFeatured: Boolean(data.isFeatured),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      displayOrder: Number(data.displayOrder) || 0,
      publishedAt: data.publishedAt || sql`(unixepoch())`,
      createdAt: sql`(unixepoch())`,
      updatedAt: sql`(unixepoch())`,
    })
    .returning();

  return record;
}

/**
 * Admin: Update an existing post.
 */
export async function updatePost(id: string, data: Partial<NewPost>): Promise<Post | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: sql`(unixepoch())`,
  };

  if (data.slug !== undefined) updatePayload.slug = data.slug.trim().toLowerCase();
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt?.trim() || null;
  if (data.content !== undefined) updatePayload.content = data.content.trim();
  if (data.coverImage !== undefined) updatePayload.coverImage = data.coverImage?.trim() || null;
  if (data.category !== undefined) updatePayload.category = data.category?.trim() || "Branding";
  if (data.author !== undefined) updatePayload.author = data.author?.trim() || "BrandHive Studio";
  if (data.readTime !== undefined) updatePayload.readTime = data.readTime?.trim() || "5 MIN READ";
  if (data.tags !== undefined) updatePayload.tags = data.tags;
  if (data.isFeatured !== undefined) updatePayload.isFeatured = Boolean(data.isFeatured);
  if (data.isPublished !== undefined) updatePayload.isPublished = Boolean(data.isPublished);
  if (data.displayOrder !== undefined) updatePayload.displayOrder = Number(data.displayOrder) || 0;

  const [record] = await db
    .update(posts)
    .set(updatePayload)
    .where(eq(posts.id, id))
    .returning();

  return record || null;
}

/**
 * Admin: Delete a post.
 */
export async function deletePost(id: string): Promise<boolean> {
  await db.delete(posts).where(eq(posts.id, id));
  return true;
}

/**
 * Admin: Toggle post publication status.
 */
export async function togglePostPublish(id: string): Promise<Post | null> {
  const existing = await getPostById(id);
  if (!existing) return null;

  const newStatus = !existing.isPublished;
  const [record] = await db
    .update(posts)
    .set({
      isPublished: newStatus,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(posts.id, id))
    .returning();

  return record || null;
}
