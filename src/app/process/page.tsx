import type { Metadata } from "next";
import ProcessClient from "./ProcessClient";

import { getPublishedProcessSteps } from "@/lib/db/queries/process";

export const metadata: Metadata = {
  title: "Our Process | BrandHive Studio",
  description: "Learn more about our systematic branding, design, and development process. From initial discovery to deployment, we engineer visually premium and fast web products.",
  keywords: [
    "BrandHive Studio",
    "Brand Hive Studio",
    "BrandHive",
    "Brand Hive",
    "BrandHive Studio Process",
    "design process"
  ],
  alternates: { canonical: "https://brandhivestudio.com.lk/process" },
  openGraph: {
    title: "Our Process | BrandHive Studio",
    description: "Learn more about our systematic design and development process.",
    type: "website",
    url: "https://brandhivestudio.com.lk/process",
    images: [{ url: "https://brandhivestudio.com.lk/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Process | BrandHive Studio",
    description: "Learn more about our systematic design and development process.",
    images: ["https://brandhivestudio.com.lk/og-image.png"],
  }
};

export default async function Page() {
  const dynamicSteps = await getPublishedProcessSteps();
  return <ProcessClient initialSteps={dynamicSteps} />;
}
