import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, asc, sql, like, or, and } from "drizzle-orm";
import type { Post, NewPost } from "@/lib/db/schema";

export interface PublicPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  isFeatured: boolean;
  tags: string[];
}

export const fallbackArticles: PublicPost[] = [
  {
    id: "post_seed_feat",
    slug: "building-brands-that-stand-the-test-of-time",
    title: "Building Brands That Stand the Test of Time",
    category: "Branding",
    description:
      "Discover how strategic branding, visual identity systems, and consistent customer experiences help businesses establish trust, increase recognition, and create long-term competitive advantages.",
    content: "In an era of hyper-competition and fragmented digital attention, what truly separates enduring businesses from temporary trends is intentional branding.",
    image: "/images/services/insights/service-visual-identity-system.webp",
    author: "BrandHive Studio",
    date: "July 12, 2026",
    readTime: "10 MIN READ",
    isFeatured: true,
    tags: ["Branding", "Strategy", "Identity", "Design"],
  },
  {
    id: "post_seed_01",
    slug: "strategic-branding-how-great-brands-build-trust",
    title: "Strategic Branding: How Great Brands Build Trust",
    category: "Branding",
    description:
      "Learn how successful brands use positioning, identity systems, and consistency to create memorable customer experiences.",
    content: "Trust is not given; it is earned through deliberate and repeated demonstrations of craft, clarity, and reliability.",
    image: "/images/services/insights/branding-hero.webp",
    author: "BrandHive Studio",
    date: "July 01, 2026",
    readTime: "7 MIN READ",
    isFeatured: false,
    tags: ["Branding", "Trust", "Design Systems"],
  },
  {
    id: "post_seed_02",
    slug: "modern-website-design-that-converts-visitors",
    title: "Modern Website Design That Converts Visitors",
    category: "Web Design",
    description:
      "Explore the principles behind fast, responsive, user-focused websites that transform visitors into loyal customers.",
    content: "A website is the central engine of modern business growth. If it is slow, confusing, or clunky, visitors bounce to competitors within seconds.",
    image: "/images/services/insights/web-design-hero.webp",
    author: "BrandHive Studio",
    date: "June 25, 2026",
    readTime: "8 MIN READ",
    isFeatured: false,
    tags: ["Web Design", "Next.js", "Performance", "UX"],
  },
  {
    id: "post_seed_03",
    slug: "designing-logos-that-represent-brands-perfectly",
    title: "Designing Logos That Represent Brands Perfectly",
    category: "Logo Design",
    description:
      "Understand the balance of simplicity, scalability, typography, and symbolism behind memorable logo design.",
    content: "A logo does not tell the entire story of a company—it acts as the identifiable signature at the end of every sentence.",
    image: "/images/services/insights/logo-design-hero.webp",
    author: "BrandHive Studio",
    date: "June 18, 2026",
    readTime: "6 MIN READ",
    isFeatured: false,
    tags: ["Logo Design", "Typography", "Branding"],
  },
  {
    id: "post_seed_04",
    slug: "performance-marketing-beyond-paid-advertising",
    title: "Performance Marketing Beyond Paid Advertising",
    category: "Marketing",
    description:
      "Discover how data-driven campaigns, audience research, and creative execution produce measurable business growth.",
    content: "Relying solely on escalating ad spend without creative iteration and conversion rate optimization leads to diminishing returns.",
    image: "/images/services/insights/marketing-hero.webp",
    author: "BrandHive Studio",
    date: "June 10, 2026",
    readTime: "8 MIN READ",
    isFeatured: false,
    tags: ["Marketing", "SEO", "Growth", "Analytics"],
  },
  {
    id: "post_seed_05",
    slug: "scaling-businesses-through-digital-transformation",
    title: "Scaling Businesses Through Digital Transformation",
    category: "Business Growth",
    description:
      "See how technology, automation, branding, and strategic planning work together to accelerate sustainable business growth.",
    content: "Digital transformation is not simply about adopting new software; it is about reorganizing business capabilities around customer expectations.",
    image: "/images/services/insights/business-growth-hero.webp",
    author: "BrandHive Studio",
    date: "June 02, 2026",
    readTime: "9 MIN READ",
    isFeatured: false,
    tags: ["Business Growth", "Cloud", "Technology", "Automation"],
  },
];

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
