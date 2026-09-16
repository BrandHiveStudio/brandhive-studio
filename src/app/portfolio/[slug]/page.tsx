import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectClient, { Project } from "./ProjectClient";
import { getProjectBySlug } from "@/lib/db/queries/projects";
import { getCurrentAdmin } from "@/lib/auth/session";

const projectsData = [
  {
    slug: "uzee-tech",
    title: "UZEE TECH",
    folder: "UZEE TECH",
    category: "Branding & Web Development",
    shortDescription: "Premium digital identity and custom website development for a next-gen technology provider.",
    description: "BrandHive Studio created a cohesive and modern corporate brand system for UZEE TECH. We designed their brand identity mark, corporate stationery, promotional material, social media kits, and engineered a custom, high-speed corporate web platform to align with their forward-looking technology services.",
    cover: "/images/portfolio/covers/portfolio-uzee-tech-cover.png",
    logo: "/images/portfolio/UZEE%20TECH/01%20Logo/logo-icon.png",
    client: "Umar Farook",
    role: "Founder",
    year: "2026",
    deliverables: ["Brand Strategy", "Logo Design", "Stationery Design", "Social Media Kit", "Web Development"],
  },
  {
    slug: "qdx-express",
    title: "QDX Express",
    folder: "QDX Express",
    category: "Brand Identity & Logistics Design",
    shortDescription: "A complete branding system and visual strategy for a modern logistics company.",
    description: "For QDX Express, we crafted a high-energy brand identity reflecting speed, reliability, and precision. We created marketing assets, brand guidelines, vehicle wrap design layouts, and digital strategy packages to elevate their logistical operations.",
    cover: "/images/portfolio/covers/portfolio-qdx-express-cover.png",
    logo: "/images/portfolio/QDX%20Express/01%20Logo%20Design/Primary%20Logo.png",
    client: "QDX Logistics Ltd",
    role: "Corporate Client",
    year: "2025",
    deliverables: ["Brand Identity", "Vehicle Design", "Digital Strategy"],
  },
  {
    slug: "ruhunu-spice-food",
    title: "Ruhunu Spice & Food",
    folder: "Ruhunu Spice & Food",
    category: "Packaging & Brand Identity",
    shortDescription: "Authentic packaging designs and traditional brand identity for a premium spice manufacturer.",
    description: "We designed heritage-inspired packaging and a warm corporate identity for Ruhunu Spice & Food. We crafted label designs, traditional spice packets, business cards, menu cards, and corporate presentation packages highlighting premium natural quality.",
    cover: "/images/portfolio/covers/portfolio-ruhunu-spice-cover.png",
    logo: "/images/portfolio/Ruhunu%20Spice%20%26%20Food/01%20Logo%20Design/Ruhunu_Spice_Food_Logo.png",
    client: "Ruhunu Spice Exports",
    role: "Director of Brand",
    year: "2026",
    deliverables: ["Label Design", "Packaging Layouts", "Logo Identity", "Stationery Design"],
  },
  {
    slug: "mobicare",
    title: "Mobicare",
    folder: "Mobicare",
    category: "Branding & UI/UX Design",
    shortDescription: "Mobile repair service branding, social media assets, and UI/UX design concepts.",
    description: "We established a high-trust digital footprint for Mobicare. Our package included brand identity guidelines, marketing material, social media grids, and a modern website user interface concept that streamlines device repair booking.",
    cover: "/images/portfolio/covers/portfolio-mobicare-cover.png",
    logo: "/images/portfolio/Mobicare/01%20Logo%20Design/MOBICARE_Brand_Icon.png",
    client: "Mobicare Sri Lanka",
    role: "Operations Manager",
    year: "2025",
    deliverables: ["Logo Design", "Social Media Layouts", "UI/UX Design", "Website Concept"],
  },
  {
    slug: "seya-beauty-studio",
    title: "Seya Beauty Studio",
    folder: "Seya Beauty Studio",
    category: "Luxury Branding & UI/UX",
    shortDescription: "A high-end salon branding system, social media identity, and booking experience design.",
    description: "Seya Beauty Studio requested an elegant, clean, and premium identity system. We styled their typography palette, curated a clean pastel color theme, designed marketing assets, and configured a booking user experience layout that fits high-end luxury styling.",
    cover: "/images/portfolio/covers/portfolio-seya-beauty-cover.png",
    logo: "/images/portfolio/Seya%20Beauty%20Studio/01%20Logo%20Design/Seya_Beauty_Studio_Logo_Light.png",
    client: "Tharindi Jayasuriya",
    role: "Founder",
    year: "2026",
    deliverables: ["Brand Identity", "Luxury Logo", "Stationery Design", "Booking UI Concept"],
  },
  {
    slug: "leo-villas",
    title: "Leo Villas",
    folder: "Leo Villas",
    category: "Real Estate Branding & Identity",
    shortDescription: "Premium branding, print stationery, and property presentation materials for luxury villas.",
    description: "For Leo Villas, we developed a premium hospitality brand system. This covers real estate portfolio layouts, letterheads, business cards, estate brochures, and high-fidelity social presentation blocks created to attract high-end property investors.",
    cover: "/images/portfolio/covers/portfolio-leo-villas-cover.png",
    logo: "/images/portfolio/Leo%20Villas/01%20Logo%20Design/Leo_Villas_Official_Logo.png",
    client: "Ajay Kumar",
    role: "Owner",
    year: "2026",
    deliverables: ["Real Estate Branding", "Print Stationery", "Brochure Layouts", "Social Kits"],
  },
  {
    slug: "vista-travels-and-tours",
    title: "Vista Travels and Tours",
    folder: "Vista Travels and Tours",
    category: "Travel Booking & Experience",
    shortDescription: "Full-stack travel booking website offering comprehensive tour packages and booking management.",
    description: "A full-stack travel booking website designed to manage tours, package details, and customer reservations with a polished, customer-friendly interface.",
    cover: "/images/portfolio/Vista%20Travels%20and%20Tours/02%20Website/home.png",
    logo: "/images/portfolio/Vista%20Travels%20and%20Tours/01%20Logo/logo.png",
    client: "Vista Travels",
    role: "Platform Owner",
    year: "2026",
    deliverables: ["Travel Booking", "Package Management", "Node.js Full-Stack"],
  },
  {
    slug: "bethel-ceylon-tours",
    title: "Bethel Ceylon Tours",
    folder: "Bethel Ceylon Tours",
    category: "Travel Management & Customer Experience",
    shortDescription: "Travel management website designed to streamline tour operations and customer inquiries.",
    description: "A customer-focused travel management site built to simplify tour bookings, inquiry handling, and operator workflows for boutique travel services.",
    cover: "/images/portfolio/Bethel%20Ceylon%20Tours/02%20Website/Home.png",
    logo: "/images/portfolio/Bethel%20Ceylon%20Tours/01%20Logo/logo.png",
    client: "Bethel Ceylon Tours",
    role: "Travel Operations",
    year: "2026",
    deliverables: ["Tour Management", "Inquiry Workflows", "Web Experience"],
  },
  {
    slug: "hardware-store",
    title: "Hardware Store",
    folder: "Hardware Store",
    category: "E-commerce Platform",
    shortDescription: "Modern e-commerce platform for hardware supplies with dynamic product catalog.",
    description: "A modern hardware e-commerce experience featuring a dynamic product catalog, inventory browsing, and smooth checkout flow.",
    cover: "/images/portfolio/Hardware%20Store/02%20Website/login.png",
    logo: "/images/portfolio/Hardware%20Store/01%20Logo/logo.png",
    client: "Hardware Store",
    role: "Store Owner",
    year: "2026",
    deliverables: ["E-commerce", "Product Catalog", "Checkout Flow"],
  },
  {
    slug: "hotel-management-system",
    title: "Hotel Management System",
    folder: "Placeholder",
    category: "Hospitality & Booking System",
    shortDescription: "Web-based platform for managing hotel reservations, rooms, and guest services efficiently.",
    description: "A hospitality management system built to streamline room reservations, guest check-in workflows, and service requests for hotel teams.",
    cover: "/images/portfolio/hero/portfolio-premium-showcase.webp",
    logo: "/images/portfolio/hero/floating-glass-portfolio-cards.webp",
    client: "Hotel Management",
    role: "Operations Manager",
    year: "2026",
    deliverables: ["Reservation System", "Guest Dashboard", "Room Management"],
    isOngoing: true,
  },
  {
    slug: "hr-automation-system",
    title: "HR Automation System",
    folder: "Placeholder",
    category: "Desktop HR Automation",
    shortDescription: "Desktop application for automating HR workflows, employee records, and administrative tasks.",
    description: "A desktop HR automation tool designed to simplify employee onboarding, recordkeeping, and administrative approvals.",
    cover: "/images/portfolio/hero/portfolio-multi-device-presentation.webp",
    logo: "/images/portfolio/hero/portfolio-premium-showcase.webp",
    client: "HR Automation",
    role: "HR Director",
    year: "2026",
    deliverables: ["Workflow Automation", "Employee Records", "Desktop App"],
    isOngoing: true,
  },
  {
    slug: "thanking-notes-app",
    title: "Thanking Notes App",
    folder: "Thanking Notes App",
    category: "Employee Communication",
    shortDescription: "Internal communication desktop system for employees to share appreciation and notes.",
    description: "We built a desktop-first recognition platform for teams with a warm visual system, quick note creation flows, and integrated appreciation feeds.",
    cover: "/images/portfolio/covers/portfolio-thanking-notes-app-cover.svg",
    logo: "/images/portfolio/logos/portfolio-thanking-notes-app-logo.svg",
    client: "Thanking Notes",
    role: "Team Lead",
    year: "2026",
    deliverables: ["Desktop UX", "Recognition System", "Team Communication", "Iconography"],
    isOngoing: true,
  },
  {
    slug: "caravan-fresh-cafeteria",
    title: "Caravan Fresh Cafeteria",
    folder: "Caravan Fresh Cafeteria",
    category: "Cafeteria Management Dashboard",
    shortDescription: "Comprehensive cafeteria management system with order processing, menu management, and authentication.",
    description: "We designed a clean dashboard for cafeteria managers to handle daily menus, orders, inventory, and staff authentication with clarity and speed.",
    cover: "/images/portfolio/covers/portfolio-caravan-fresh-cafeteria-cover.svg",
    logo: "/images/portfolio/logos/portfolio-caravan-fresh-cafeteria-logo.svg",
    client: "Caravan Fresh Cafeteria",
    role: "Operations Lead",
    year: "2026",
    deliverables: ["Dashboard UI", "Order Management", "Menu Design", "Authentication"],
    isOngoing: true,
  },
  {
    slug: "payment-management-system",
    title: "Payment Management System",
    folder: "Payment Management System",
    category: "Secure Transaction Platform",
    shortDescription: "Secure transaction management system built with strong Object-Oriented Programming principles.",
    description: "We crafted a secure payment dashboard with transaction control, reconciliation screens, and audit-friendly reporting for finance teams.",
    cover: "/images/portfolio/covers/portfolio-payment-management-system-cover.svg",
    logo: "/images/portfolio/logos/portfolio-payment-management-system-logo.svg",
    client: "Payment Management",
    role: "Product Owner",
    year: "2026",
    deliverables: ["Secure UI", "Transaction Workflows", "Audit Reporting", "OOP Architecture"],
    isOngoing: true,
  },
  {
    slug: "mathi-quiz-game",
    title: "Mathi Quiz Game",
    folder: "Mathi Quiz Game",
    category: "Mobile Quiz & Gamification",
    shortDescription: "Engaging mobile quiz application featuring timed challenges and dynamic scoring systems.",
    description: "We created a playful mobile quiz experience with timed challenges, animated scoring, and a supportive learning progression system.",
    cover: "/images/portfolio/covers/portfolio-mathi-quiz-game-cover.svg",
    logo: "/images/portfolio/logos/portfolio-mathi-quiz-game-logo.svg",
    client: "Mathi Games",
    role: "App Designer",
    year: "2026",
    deliverables: ["Game UI", "Mobile Interface", "Gamification", "Scoring System"],
    isOngoing: true,
  },
  {
    slug: "blossom-task",
    title: "Blossom Task",
    folder: "Placeholder",
    category: "Task Management & Productivity",
    shortDescription: "Task management application supporting full CRUD operations and deadline tracking.",
    description: "A productivity app built to manage tasks, deadlines, and team collaboration with clear status and deadline tracking.",
    cover: "/images/portfolio/hero/portfolio-premium-showcase.webp",
    logo: "/images/portfolio/hero/portfolio-multi-device-presentation.webp",
    client: "Blossom Task",
    role: "Product Manager",
    year: "2026",
    deliverables: ["Task Tracking", "CRUD Workflow", "Deadline Management"],
    isOngoing: true,
  },
];

const ORDER_LIST = [
  "Logo Design",
  "Brand Identity",
  "Brand Identity Guidelines",
  "Stationery Design",
  "Website Design",
  "Store Showcase",
  "Social Media Campaigns",
  "Uniforms & Apparel",
  "Packaging & Brand Identity",
  "Menu Design"
];

function mapSectionTitle(dirName: string): string {
  const clean = dirName.replace(/^\d+\s+/, "").trim().toLowerCase();
  
  if (clean === "logo" || clean === "logo design") return "Logo Design";
  if (clean === "branding" || clean === "brand identity") return "Brand Identity";
  if (clean === "brand guidelines") return "Brand Identity Guidelines";
  if (clean === "stationery" || clean === "business card" || clean === "business" || clean === "stationery design") return "Stationery Design";
  if (clean === "website" || clean === "website design") return "Website Design";
  if (clean === "store" || clean === "showcase" || clean === "store showcase") return "Store Showcase";
  if (clean === "social media" || clean === "social media campaigns") return "Social Media Campaigns";
  if (clean === "uniforms & apparel") return "Uniforms & Apparel";
  if (clean === "packaging & brand identity") return "Packaging & Brand Identity";
  if (clean === "menu card" || clean === "menu design") return "Menu Design";
  
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getProjectAssets(folderName: string) {
  const assetsDir = path.join(process.cwd(), "public", "images", "portfolio", folderName);

  if (!fs.existsSync(assetsDir)) {
    return [];
  }

  try {
    const subdirs = fs.readdirSync(assetsDir).filter((file) => {
      return fs.statSync(path.join(assetsDir, file)).isDirectory();
    });

    const sections = subdirs.map((dirName) => {
      const dirPath = path.join(assetsDir, dirName);
      
      const getAllFiles = (dir: string): string[] => {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return [];
        const list = fs.readdirSync(dir);
        list.forEach((file) => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
          } else {
            results.push(fullPath);
          }
        });
        return results;
      };

      const allFiles = getAllFiles(dirPath).filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
      });

      const title = mapSectionTitle(dirName);
      const publicDir = path.join(process.cwd(), "public");
      const images = allFiles.map((file) => {
        const relativePath = path.relative(publicDir, file).replace(/\\/g, "/");
        // URL-encode each path segment so spaces and special chars (& etc.) work in browsers
        const encodedPath = relativePath
          .split("/")
          .map((seg) => encodeURIComponent(seg))
          .join("/");
        return "/" + encodedPath;
      });

      return {
        id: dirName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title,
        images,
      };
    });

    // Sort sections according to ORDER_LIST
    sections.sort((a, b) => {
      const idxA = ORDER_LIST.indexOf(a.title);
      const idxB = ORDER_LIST.indexOf(b.title);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return sections;
  } catch (error) {
    console.error("Error reading project assets:", error);
    return [];
  }
}

export async function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const admin = await getCurrentAdmin();
  const allowDraft = Boolean(admin);
  const dbData = await getProjectBySlug(slug, allowDraft);

  if (dbData?.isDraft) {
    notFound();
  }

  const project = dbData?.project || projectsData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return {
    title: `${project.title} Case Study | BrandHive Studio`,
    description: project.shortDescription,
    alternates: { canonical: `https://brandhivestudio.com.lk/portfolio/${slug}` },
    openGraph: {
      title: `${project.title} - Portfolio | BrandHive Studio`,
      description: project.shortDescription,
      url: `https://brandhivestudio.com.lk/portfolio/${slug}`,
      images: [{ url: project.cover, width: 1200, height: 630, alt: `${project.title} Cover` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} - Portfolio | BrandHive Studio`,
      description: project.shortDescription,
      images: [project.cover],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = await getCurrentAdmin();
  const allowDraft = Boolean(admin);

  const dbData = await getProjectBySlug(slug, allowDraft);

  if (dbData?.isDraft) {
    notFound();
  }

  const staticProject = projectsData.find((p) => p.slug === slug);

  if (!dbData && !staticProject) {
    notFound();
  }

  const rawProject = dbData?.project;
  const project: Project = rawProject
    ? {
        slug: rawProject.slug,
        title: rawProject.title,
        category: rawProject.category,
        shortDescription: rawProject.shortDescription,
        description: rawProject.description,
        cover: rawProject.cover,
        logo: rawProject.logo,
        client: rawProject.client,
        role: rawProject.role,
        year: rawProject.year,
        deliverables: rawProject.badges || [],
        isOngoing: rawProject.isOngoing,
      }
    : staticProject!;

  const folderName = staticProject?.folder || project.title;
  const localSections = getProjectAssets(folderName);
  const sections = dbData && dbData.sections.length > 0 ? dbData.sections : localSections;

  const currentIndex = projectsData.findIndex((p) => p.slug === slug);
  const prevIndex = (currentIndex - 1 + projectsData.length) % projectsData.length;
  const nextIndex = (currentIndex + 1) % projectsData.length;

  const prevProject: Project = projectsData[prevIndex] || project;
  const nextProject: Project = projectsData[nextIndex] || project;

  return (
    <ProjectClient
      project={project}
      sections={sections}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
