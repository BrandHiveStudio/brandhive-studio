import { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/db/queries/projects";
import { getPublishedPosts } from "@/lib/db/queries/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://brandhivestudio.com.lk";

  // Static core routes
  const routes = [
    "",
    "/about",
    "/services",
    "/portfolio",
    "/process",
    "/insights",
    "/contact",
  ];

  // Baseline fallback portfolio slugs
  const defaultPortfolioSlugs = [
    "uzee-tech",
    "qdx-express",
    "ruhunu-spice-food",
    "mobicare",
    "seya-beauty-studio",
    "leo-villas",
    "vista-travels-and-tours",
    "bethel-ceylon-tours",
    "hardware-store",
    "hotel-management-system",
    "hr-automation-system",
    "thanking-notes-app",
    "caravan-fresh-cafeteria",
    "payment-management-system",
    "mathi-quiz-game",
    "blossom-task",
  ];

  const staticUrls: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch dynamic published projects
  let dynamicPortfolioUrls: MetadataRoute.Sitemap = [];
  try {
    const pubProjects = await getPublishedProjects();
    const slugs = pubProjects.length > 0 ? pubProjects.map((p) => p.slug) : defaultPortfolioSlugs;
    dynamicPortfolioUrls = slugs.map((slug) => ({
      url: `${baseUrl}/portfolio/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    dynamicPortfolioUrls = defaultPortfolioSlugs.map((slug) => ({
      url: `${baseUrl}/portfolio/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  // Fetch dynamic published posts
  let dynamicPostUrls: MetadataRoute.Sitemap = [];
  try {
    const pubPosts = await getPublishedPosts();
    dynamicPostUrls = pubPosts.map((post) => ({
      url: `${baseUrl}/insights/${post.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    dynamicPostUrls = [];
  }

  return [...staticUrls, ...dynamicPortfolioUrls, ...dynamicPostUrls];
}
