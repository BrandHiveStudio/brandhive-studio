import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { posts } from "./schema";
import { sql } from "drizzle-orm";

const initialArticles = [
  {
    id: "post_seed_feat",
    slug: "building-brands-that-stand-the-test-of-time",
    title: "Building Brands That Stand the Test of Time",
    category: "Branding",
    excerpt:
      "Discover how strategic branding, visual identity systems, and consistent customer experiences help businesses establish trust, increase recognition, and create long-term competitive advantages.",
    content: `## The Essence of Enduring Brands

In an era of hyper-competition and fragmented digital attention, what truly separates enduring businesses from temporary trends is intentional branding. Great brands are not accidental creations; they are meticulously planned systems built on deep positioning, authentic values, and visual excellence.

### 1. Distinctive Brand Positioning
Every memorable brand begins by claiming an unambiguous space in the consumer's mind. Positioning defines not merely what you do, but why your perspective matters uniquely in the marketplace. Without clear positioning, even the most exquisite design remains superficial decoration.

### 2. Scalable Visual Identity Systems
A modern brand identity must flex gracefully from an Apple Watch notification to a 100-foot airport billboard. Developing comprehensive design tokens, strict typographic hierarchies, and balanced color systems guarantees brand coherence across every touchpoint.

### 3. Consistency Drives Trust
Trust is the currency of customer conversion. When customers experience the same high standards across your web platforms, packaging, social channels, and customer support, friction disappears and loyalty is established.

### Conclusion
Investing in foundational brand strategy is the single most defensible decision an ambitious business can make. At BrandHive Studio, we architect identities engineered to grow and scale alongside your business vision.`,
    coverImage: "/images/services/insights/service-visual-identity-system.webp",
    author: "BrandHive Studio",
    readTime: "10 MIN READ",
    tags: JSON.stringify(["Branding", "Strategy", "Identity", "Design"]),
    isFeatured: true,
    isPublished: true,
    displayOrder: 1,
  },
  {
    id: "post_seed_01",
    slug: "strategic-branding-how-great-brands-build-trust",
    title: "Strategic Branding: How Great Brands Build Trust",
    category: "Branding",
    excerpt:
      "Learn how successful brands use positioning, identity systems, and consistency to create memorable customer experiences.",
    content: `## The Psychology of Trust in Digital Branding

Trust is not given; it is earned through deliberate and repeated demonstrations of craft, clarity, and reliability.

### Clarity Over Complexity
When visitors arrive at your digital storefront, they make subconscious assessments within 50 milliseconds. A clean, Apple-inspired layout that respects whitespace communicates competence before a single paragraph is read.

### Visual Cohesion
Disjointed fonts, inconsistent color tones, and low-fidelity imagery create invisible doubt in prospective buyers. Establishing a singular design system eliminates cognitive load and accelerates conversion.`,
    coverImage: "/images/services/insights/branding-hero.webp",
    author: "BrandHive Studio",
    readTime: "7 MIN READ",
    tags: JSON.stringify(["Branding", "Trust", "Design Systems"]),
    isFeatured: false,
    isPublished: true,
    displayOrder: 2,
  },
  {
    id: "post_seed_02",
    slug: "modern-website-design-that-converts-visitors",
    title: "Modern Website Design That Converts Visitors",
    category: "Web Design",
    excerpt:
      "Explore the principles behind fast, responsive, user-focused websites that transform visitors into loyal customers.",
    content: `## Designing for High-Performance Conversion

A website is the central engine of modern business growth. If it is slow, confusing, or clunky, visitors bounce to competitors within seconds.

### The Sub-Second Rule
Modern web engineering with Next.js App Router and server-rendered components ensures pages load in milliseconds. Fast load times directly correlate with higher Google search rankings and superior conversion metrics.

### Intentional Visual Hierarchy
Every section must have an unmistakable primary action. Strategic use of cyan highlights, bold headlines, and minimal card elevation naturally guides eyes down the purchase funnel without distraction.`,
    coverImage: "/images/services/insights/web-design-hero.webp",
    author: "BrandHive Studio",
    readTime: "8 MIN READ",
    tags: JSON.stringify(["Web Design", "Next.js", "Performance", "UX"]),
    isFeatured: false,
    isPublished: true,
    displayOrder: 3,
  },
  {
    id: "post_seed_03",
    slug: "designing-logos-that-represent-brands-perfectly",
    title: "Designing Logos That Represent Brands Perfectly",
    category: "Logo Design",
    excerpt:
      "Understand the balance of simplicity, scalability, typography, and symbolism behind memorable logo design.",
    content: `## The Architecture of an Iconic Logo

A logo does not tell the entire story of a company—it acts as the identifiable signature at the end of every sentence.

### The Power of Simplicity
The most recognizable marks in global commerce—Apple, Nike, Target—can all be drawn in sand with a stick. Simplicity allows a mark to be instantly recognized across microscopic favicons and giant building signs alike.

### Typographic Harmony
The pairing between an icon mark and its accompanying wordmark must feel organic. Tailoring kerning, stroke weights, and terminal angles creates a bespoke mark that cannot be replicated with off-the-shelf templates.`,
    coverImage: "/images/services/insights/logo-design-hero.webp",
    author: "BrandHive Studio",
    readTime: "6 MIN READ",
    tags: JSON.stringify(["Logo Design", "Typography", "Branding"]),
    isFeatured: false,
    isPublished: true,
    displayOrder: 4,
  },
  {
    id: "post_seed_04",
    slug: "performance-marketing-beyond-paid-advertising",
    title: "Performance Marketing Beyond Paid Advertising",
    category: "Marketing",
    excerpt:
      "Discover how data-driven campaigns, audience research, and creative execution produce measurable business growth.",
    content: `## Modern Performance Marketing Strategies

Relying solely on escalating ad spend without creative iteration and conversion rate optimization (CRO) leads to diminishing returns.

### Synergizing Creative and Analytics
The highest ROAS comes from pairing rigorous data tracking with premium high-converting visual assets. Testing hooks, thumbnail variations, and dedicated landing pages yields exponential growth.

### Technical SEO & Organic Discovery
Organic search remains the highest-margin acquisition channel. Combining fast web architecture with informative content hubs drives compounding compounding inbound traffic over time.`,
    coverImage: "/images/services/insights/marketing-hero.webp",
    author: "BrandHive Studio",
    readTime: "8 MIN READ",
    tags: JSON.stringify(["Marketing", "SEO", "Growth", "Analytics"]),
    isFeatured: false,
    isPublished: true,
    displayOrder: 5,
  },
  {
    id: "post_seed_05",
    slug: "scaling-businesses-through-digital-transformation",
    title: "Scaling Businesses Through Digital Transformation",
    category: "Business Growth",
    excerpt:
      "See how technology, automation, branding, and strategic planning work together to accelerate sustainable business growth.",
    content: `## Future-Proofing Modern Enterprises

Digital transformation is not simply about adopting new software; it is about reorganizing business capabilities around customer expectations.

### Cloud Native Infrastructure
Leveraging modern serverless edge runtimes, scalable object storage like Cloudflare R2, and low-latency databases like Turso allows businesses to serve global audiences with zero server maintenance overhead.

### Seamless Automation
Automating client intake, inquiry processing, and digital asset workflows frees creative teams to focus on high-leverage innovation.`,
    coverImage: "/images/services/insights/business-growth-hero.webp",
    author: "BrandHive Studio",
    readTime: "9 MIN READ",
    tags: JSON.stringify(["Business Growth", "Cloud", "Technology", "Automation"]),
    isFeatured: false,
    isPublished: true,
    displayOrder: 6,
  },
];

async function seedPosts() {
  console.log("🌱 Seeding articles / posts into Turso database...");

  for (const item of initialArticles) {
    await db
      .insert(posts)
      .values({
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.coverImage,
        category: item.category,
        author: item.author,
        readTime: item.readTime,
        tags: item.tags,
        isFeatured: item.isFeatured,
        isPublished: item.isPublished,
        displayOrder: item.displayOrder,
        publishedAt: sql`(unixepoch())`,
        createdAt: sql`(unixepoch())`,
        updatedAt: sql`(unixepoch())`,
      })
      .onConflictDoNothing();

    console.log(`  ✓ Post '${item.title.substring(0, 35)}...' verified.`);
  }

  console.log("✅ Posts seeded successfully into Turso!");
}

seedPosts()
  .catch((err) => {
    console.error("Posts seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
