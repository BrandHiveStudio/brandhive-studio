import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { getPublishedServices } from "@/lib/db/queries/services";

export const metadata: Metadata = {
  title: "Our Services | BrandHive Studio",
  description: "Bespoke digital services including brand strategy, luxury logo design, fast web development, and performance marketing designed to scale modern businesses.",
  keywords: [
    "BrandHive Studio",
    "Brand Hive Studio",
    "BrandHive",
    "Brand Hive",
    "BrandHive Studio Services",
    "branding services",
    "web development agency"
  ],
  alternates: { canonical: "https://brandhivestudio.com.lk/services" },
  openGraph: {
    title: "Our Services | BrandHive Studio",
    description: "Bespoke digital services including brand strategy, logo design, and high-performance development.",
    type: "website",
    url: "https://brandhivestudio.com.lk/services",
    images: [{ url: "https://brandhivestudio.com.lk/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services | BrandHive Studio",
    description: "Bespoke digital services including brand strategy, logo design, and high-performance development.",
    images: ["https://brandhivestudio.com.lk/og-image.png"],
  }
};

export default async function Page() {
  const dynamicServices = await getPublishedServices();
  return <ServicesClient initialServices={dynamicServices} />;
}
