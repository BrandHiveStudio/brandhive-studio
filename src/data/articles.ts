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
    content:
      "In an era of hyper-competition and fragmented digital attention, what truly separates enduring businesses from temporary trends is intentional branding.",
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
    content:
      "Trust is not given; it is earned through deliberate and repeated demonstrations of craft, clarity, and reliability.",
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
    content:
      "A website is the central engine of modern business growth. If it is slow, confusing, or clunky, visitors bounce to competitors within seconds.",
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
    content:
      "A logo does not tell the entire story of a company—it acts as the identifiable signature at the end of every sentence.",
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
    content:
      "Relying solely on escalating ad spend without creative iteration and conversion rate optimization leads to diminishing returns.",
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
    content:
      "Digital transformation is not simply about adopting new software; it is about reorganizing business capabilities around customer expectations.",
    image: "/images/services/insights/business-growth-hero.webp",
    author: "BrandHive Studio",
    date: "June 02, 2026",
    readTime: "9 MIN READ",
    isFeatured: false,
    tags: ["Business Growth", "Cloud", "Technology", "Automation"],
  },
];
