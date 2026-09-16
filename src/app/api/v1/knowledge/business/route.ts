import { NextResponse } from "next/server";
import { getSiteContentMap } from "@/lib/db/queries/content";
import { getActiveLinks } from "@/lib/db/queries/links";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/knowledge/business
 * Public read-only endpoint returning authoritative business metadata,
 * hero/about values, and contact links for AI Agent ingestion.
 */
export async function GET() {
  try {
    const [contentMap, links] = await Promise.all([
      getSiteContentMap(),
      getActiveLinks(),
    ]);

    const whatsappLink = links.find((l) => l.platform === "whatsapp")?.url || "https://wa.me/94706410093";
    const phoneLink = links.find((l) => l.platform === "phone")?.url || "tel:+94706410093";
    const emailLink = links.find((l) => l.platform === "email")?.url || "mailto:brandhive.studio.lk@gmail.com";

    const businessData = {
      name: "BrandHive Studio",
      tagline: contentMap.hero_badge || "Creative Branding & Digital Agency",
      hero: {
        title: `${contentMap.hero_title_line1 || "Building Brands"} ${contentMap.hero_title_line2 || "That Get"} ${contentMap.hero_title_highlight || "Noticed."}`,
        description: contentMap.hero_description || "We help businesses grow with stunning brand identities, creative designs, powerful websites, and result-driven digital marketing.",
      },
      about: {
        heading: contentMap.about_heading || "Crafting Brands that Connect & Inspire",
        storyLead: contentMap.about_story_lead || "At BrandHive Studio, we blend design strategy, technology, and artistic thinking to build outstanding brands and digital platforms that accelerate business growth.",
        mission: contentMap.about_mission || "To elevate how businesses connect with their audiences by delivering premium brand identities and cutting-edge digital experiences.",
        vision: contentMap.about_vision || "To become the premier creative partner for industry leaders and ambitious startups worldwide.",
      },
      contact: {
        whatsapp: whatsappLink,
        phone: phoneLink.replace("tel:", ""),
        email: emailLink.replace("mailto:", ""),
        whatsappDirectUrl: "https://wa.me/94706410093",
      },
      socialLinks: links.map((l) => ({
        platform: l.platform,
        label: l.label,
        url: l.url,
      })),
      stats: {
        projectsDelivered: `${contentMap.stats_projects_number || "50"}${contentMap.stats_projects_suffix || "+"}`,
        clientsServed: `${contentMap.stats_clients_number || "25"}${contentMap.stats_clients_suffix || "+"}`,
        yearsExperience: `${contentMap.stats_years_number || "2"}${contentMap.stats_years_suffix || "+"}`,
        satisfaction: `${contentMap.stats_satisfaction_number || "100"}${contentMap.stats_satisfaction_suffix || "%"}`,
      },
    };

    return NextResponse.json({
      success: true,
      source: "BrandHive Studio CMS",
      data: businessData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch knowledge business info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve business information" },
      { status: 500 }
    );
  }
}
