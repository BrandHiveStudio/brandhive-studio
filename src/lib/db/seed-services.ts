import { db } from "./index";
import { services } from "./schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const initialServices = [
  {
    id: "srv_brand_strategy",
    slug: "brand-strategy-identity-systems",
    badge: "BRAND FOUNDATION",
    title: "Brand Strategy & Identity Systems",
    shortDescription: "Create a memorable brand built on strategy, consistency, and visual excellence.",
    description: "Create a memorable brand built on strategy, consistency, and visual excellence. From defining your market position to developing complete identity systems, we help businesses establish a professional presence that inspires trust and recognition across every customer touchpoint.",
    imageUrl: "/images/services/branding/service-brand-strategy-workshop.webp",
    features: JSON.stringify([
      "Brand Positioning",
      "Visual Identity Design",
      "Corporate Logo Systems",
      "Typography Systems",
      "Brand Guidelines",
    ]),
    tags: JSON.stringify(["Branding", "Identity", "Strategy"]),
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: "srv_web_experience",
    slug: "web-experience-digital-platforms",
    badge: "DIGITAL EXPERIENCES",
    title: "Web Experience & Digital Platforms",
    shortDescription: "Design and develop high-performance websites and digital platforms.",
    description: "Design and develop high-performance websites and digital platforms that combine modern aesthetics with exceptional usability. Every solution is responsive, scalable, and engineered to deliver a seamless experience across every device.",
    imageUrl: "/images/services/website-design/service-web-experience-digital-platforms.webp",
    features: JSON.stringify([
      "Custom Website Design",
      "Corporate Web Portals",
      "Responsive Development",
      "High-Fidelity UI/UX Prototypes",
    ]),
    tags: JSON.stringify(["Web Development", "UI/UX", "Next.js"]),
    displayOrder: 2,
    isPublished: true,
  },
  {
    id: "srv_growth_marketing",
    slug: "growth-marketing-performance",
    badge: "DIGITAL GROWTH",
    title: "Growth Marketing & Performance",
    shortDescription: "Drive measurable business growth through strategic digital marketing.",
    description: "Drive measurable business growth through strategic digital marketing. We create high-converting campaigns, optimize customer journeys, and provide performance insights that help brands reach the right audience and maximize return on investment.",
    imageUrl: "/images/services/digital-marketing/growth-marketing-performance.webp",
    features: JSON.stringify([
      "Paid Advertising Creatives",
      "Conversion Tracking",
      "A/B Campaign Testing",
      "Performance Analytics & Reporting",
    ]),
    tags: JSON.stringify(["Marketing", "SEO", "Analytics"]),
    displayOrder: 3,
    isPublished: true,
  },
  {
    id: "srv_academic_tech",
    slug: "academic-software-development-mentoring",
    badge: "ACADEMIC TECHNOLOGY",
    title: "Academic Software Development & Mentoring",
    shortDescription: "Support software engineering and technology projects with professional guidance.",
    description: "Support software engineering and technology projects with professional guidance from planning to implementation. We help students and aspiring developers build high-quality software, strengthen technical skills, and deliver polished project outcomes through structured mentoring and development support.",
    imageUrl: "/images/services/academic/academic-software-development-mentoring.webp",
    features: JSON.stringify([
      "Software Engineering Projects",
      "AI & Machine Learning Solutions",
      "Web & Mobile Application Development",
      "Database Design & Implementation",
      "UI/UX Prototyping",
      "Technical Documentation",
      "Code Review & Debugging",
      "Project Consultation & Mentoring",
    ]),
    tags: JSON.stringify(["Software Engineering", "AI/ML", "Mentoring"]),
    displayOrder: 4,
    isPublished: true,
  },
];

async function seedServices() {
  console.log("🌱 Seeding initial services into Turso database...");
  for (const s of initialServices) {
    const existing = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, s.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(services).values(s);
      console.log(`  ✓ Inserted service: "${s.title}" (${s.slug})`);
    } else {
      console.log(`  - Service "${s.title}" already exists.`);
    }
  }
  console.log("✅ Services seeding complete.");
}

seedServices().catch(console.error);
