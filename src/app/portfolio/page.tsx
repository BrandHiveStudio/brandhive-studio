import type { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";
import { getPublishedProjects } from "@/lib/db/queries/projects";

export const metadata: Metadata = {
  title: "Our Work & Case Studies | BrandHive Studio",
  description: "Explore the BrandHive Studio design and development portfolio. Read our featured case studies detailing custom corporate identities, luxury packaging design, and modern web engineering.",
  keywords: [
    "BrandHive Studio",
    "Brand Hive Studio",
    "BrandHive",
    "Brand Hive",
    "BrandHive Studio Portfolio",
    "case studies",
    "branding portfolio"
  ],
  alternates: { canonical: "https://brandhivestudio.com.lk/portfolio" },
  openGraph: {
    title: "Our Work & Case Studies | BrandHive Studio",
    description: "Explore the BrandHive Studio design and development portfolio.",
    type: "website",
    url: "https://brandhivestudio.com.lk/portfolio",
    images: [{ url: "https://brandhivestudio.com.lk/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Work & Case Studies | BrandHive Studio",
    description: "Explore the BrandHive Studio design and development portfolio.",
    images: ["https://brandhivestudio.com.lk/og-image.png"],
  }
};

export default async function Page() {
  const published = await getPublishedProjects();
  return <PortfolioClient initialProjects={published.length > 0 ? published : undefined} />;
}
