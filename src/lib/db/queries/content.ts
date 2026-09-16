import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
import type { SiteContentItem } from "@/lib/db/schema";

export const fallbackSiteContent: Record<string, string> = {
  // Key Stats & Metrics
  "stats_projects_number": "50",
  "stats_projects_suffix": "+",
  "stats_projects_label": "Projects Delivered",

  "stats_clients_number": "25",
  "stats_clients_suffix": "+",
  "stats_clients_label": "Clients Served",

  "stats_years_number": "2",
  "stats_years_suffix": "+",
  "stats_years_label": "Years of Experience",

  "stats_satisfaction_number": "100",
  "stats_satisfaction_suffix": "%",
  "stats_satisfaction_label": "Client Satisfaction",

  "stats_awwwards_title": "AWWWARDS",
  "stats_awwwards_subtitle": "Honorable Member Agency 2026",

  // Hero Section
  "hero_badge": "Creative Branding & Digital Agency",
  "hero_title_line1": "Building Brands",
  "hero_title_line2": "That Get",
  "hero_title_highlight": "Noticed.",
  "hero_description": "We help businesses grow with stunning brand identities, creative designs, powerful websites, and result-driven digital marketing.",
  "hero_cta_primary": "Start a Project",
  "hero_cta_secondary": "View our Work",

  // About Section
  "about_badge": "Who We Are",
  "about_heading": "Crafting Brands that Connect & Inspire",
  "about_story_lead": "At BrandHive Studio, we blend design strategy, technology, and artistic thinking to build outstanding brands and digital platforms that accelerate business growth.",
  "about_mission": "To elevate how businesses connect with their audiences by delivering premium brand identities and cutting-edge digital experiences.",
  "about_vision": "To become the premier creative partner for industry leaders and ambitious startups worldwide.",

  // Global Call To Action
  "cta_badge": "READY TO START?",
  "cta_heading": "Let's Build Something Extraordinary.",
  "cta_description": "Whether you're launching a new business, refreshing your brand, or creating a premium digital experience, BrandHive Studio is ready to bring your vision to life.",
  "cta_button_text": "Start a Project",
};

/**
 * Public: Fetches all site content as a merged key-value dictionary.
 * Guaranteed to return fallbacks on network/db errors or missing keys.
 */
export async function getSiteContentMap(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(siteContent);
    const result: Record<string, string> = { ...fallbackSiteContent };

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.contentKey && typeof row.contentValue === "string") {
          result[row.contentKey] = row.contentValue;
        }
      }
    }

    return result;
  } catch (error) {
    console.warn("⚠️ Failed to load site content from Turso database. Using fallback copy:", error);
    return fallbackSiteContent;
  }
}

/**
 * Admin: Fetches raw site content records.
 */
export async function getAllSiteContent(): Promise<SiteContentItem[]> {
  try {
    return await db.select().from(siteContent).orderBy(asc(siteContent.groupName), asc(siteContent.contentKey));
  } catch (error) {
    console.warn("⚠️ Failed to fetch all site content:", error);
    return [];
  }
}

export interface ContentUpdateItem {
  key: string;
  value: string;
  groupName?: string;
  description?: string;
}

/**
 * Admin: Updates or inserts a batch of content keys.
 */
export async function updateSiteContentBatch(items: ContentUpdateItem[]): Promise<boolean> {
  try {
    for (const item of items) {
      const existing = await db.select().from(siteContent).where(sql`${siteContent.contentKey} = ${item.key}`).limit(1);

      if (existing && existing.length > 0) {
        await db.update(siteContent)
          .set({
            contentValue: item.value,
            groupName: item.groupName ?? existing[0].groupName ?? "General",
            description: item.description ?? existing[0].description,
            updatedAt: new Date(),
          })
          .where(sql`${siteContent.contentKey} = ${item.key}`);
      } else {
        await db.insert(siteContent).values({
          id: `content_${item.key}`,
          contentKey: item.key,
          contentValue: item.value,
          groupName: item.groupName ?? "General",
          description: item.description ?? "",
          updatedAt: new Date(),
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to update site content batch:", error);
    throw error;
  }
}
