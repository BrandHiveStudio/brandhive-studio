"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import uzeeTechCover from "../../../public/images/portfolio/covers/portfolio-uzee-tech-cover.png";
import uzeeTechLogo from "../../../public/images/portfolio/UZEE TECH/01 Logo/logo-icon.png";
import qdxExpressCover from "../../../public/images/portfolio/covers/portfolio-qdx-express-cover.png";
import qdxExpressLogo from "../../../public/images/portfolio/QDX Express/01 Logo Design/Primary Logo.png";
import ruhunuSpiceCover from "../../../public/images/portfolio/covers/portfolio-ruhunu-spice-cover.png";
import ruhunuSpiceLogo from "../../../public/images/portfolio/Ruhunu Spice & Food/01 Logo Design/Ruhunu_Spice_Food_Logo.png";
import mobicareCover from "../../../public/images/portfolio/covers/portfolio-mobicare-cover.png";
import mobicareLogo from "../../../public/images/portfolio/Mobicare/01 Logo Design/MOBICARE_Brand_Icon.png";
import seyaBeautyCover from "../../../public/images/portfolio/covers/portfolio-seya-beauty-cover.png";
import seyaBeautyLogo from "../../../public/images/portfolio/Seya Beauty Studio/01 Logo Design/Seya_Beauty_Studio_Logo_Light.png";
import leoVillasCover from "../../../public/images/portfolio/covers/portfolio-leo-villas-cover.png";
import leoVillasLogo from "../../../public/images/portfolio/Leo Villas/01 Logo Design/Leo_Villas_Official_Logo.png";
import vistaTravelsCover from "../../../public/images/portfolio/Vista Travels and Tours/02 Website/home.png";
import vistaTravelsLogo from "../../../public/images/portfolio/Vista Travels and Tours/01 Logo/logo.png";
import bethelToursCover from "../../../public/images/portfolio/Bethel Ceylon Tours/02 Website/Home.png";
import bethelToursLogo from "../../../public/images/portfolio/Bethel Ceylon Tours/01 Logo/logo.png";
import hardwareStoreCover from "../../../public/images/portfolio/Hardware Store/02 Website/login.png";
import hardwareStoreLogo from "../../../public/images/portfolio/Hardware Store/01 Logo/logo.png";
import heroPremiumShowcase from "../../../public/images/portfolio/hero/portfolio-premium-showcase.webp";
import floatingGlassCards from "../../../public/images/portfolio/hero/floating-glass-portfolio-cards.webp";
import multiDevicePresentation from "../../../public/images/portfolio/hero/portfolio-multi-device-presentation.webp";
import thankingNotesCover from "../../../public/images/portfolio/covers/portfolio-thanking-notes-app-cover.svg";
import thankingNotesLogo from "../../../public/images/portfolio/logos/portfolio-thanking-notes-app-logo.svg";
import caravanCover from "../../../public/images/portfolio/covers/portfolio-caravan-fresh-cafeteria-cover.svg";
import caravanLogo from "../../../public/images/portfolio/logos/portfolio-caravan-fresh-cafeteria-logo.svg";
import paymentMgmtCover from "../../../public/images/portfolio/covers/portfolio-payment-management-system-cover.svg";
import paymentMgmtLogo from "../../../public/images/portfolio/logos/portfolio-payment-management-system-logo.svg";
import mathiQuizCover from "../../../public/images/portfolio/covers/portfolio-mathi-quiz-game-cover.svg";
import mathiQuizLogo from "../../../public/images/portfolio/logos/portfolio-mathi-quiz-game-logo.svg";
import { motion, Variants } from "framer-motion";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import HeroDivider from "@/components/ui/HeroDivider";

const projects = [
  {
    slug: "uzee-tech",
    title: "UZEE TECH",
    category: "Branding & Web Development",
    cover: uzeeTechCover,
    logo: uzeeTechLogo,
    shortDescription: "Premium digital identity and custom website development for a next-gen technology provider.",
    badges: ["Brand Strategy", "Logo Design", "Stationery", "Web Development"],
    isFeatured: true,
  },
  {
    slug: "qdx-express",
    title: "QDX Express",
    category: "Brand Identity & Logistics Design",
    cover: qdxExpressCover,
    logo: qdxExpressLogo,
    shortDescription: "A complete branding system and visual strategy for a modern logistics company.",
    badges: ["Brand Identity", "Vehicle Design"],
    isFeatured: false,
  },
  {
    slug: "ruhunu-spice-food",
    title: "Ruhunu Spice & Food",
    category: "Packaging & Brand Identity",
    cover: ruhunuSpiceCover,
    logo: ruhunuSpiceLogo,
    shortDescription: "Authentic packaging designs and traditional brand identity for a premium spice manufacturer.",
    badges: ["Label Design", "Packaging", "Logo Identity"],
    isFeatured: false,
  },
  {
    slug: "mobicare",
    title: "Mobicare",
    category: "Branding & UI/UX Design",
    cover: mobicareCover,
    logo: mobicareLogo,
    shortDescription: "Mobile repair service branding, social media assets, and UI/UX design concepts.",
    badges: ["Logo Design", "Social Media", "UI/UX"],
    isFeatured: false,
  },
  {
    slug: "seya-beauty-studio",
    title: "Seya Beauty Studio",
    category: "Luxury Branding & UI/UX",
    cover: seyaBeautyCover,
    logo: seyaBeautyLogo,
    shortDescription: "A high-end salon branding system, social media identity, and booking experience design.",
    badges: ["Brand Identity", "Luxury Logo", "Booking UI"],
    isFeatured: false,
  },
  {
    slug: "leo-villas",
    title: "Leo Villas",
    category: "Real Estate Branding & Identity",
    cover: leoVillasCover,
    logo: leoVillasLogo,
    shortDescription: "Premium branding, print stationery, and property presentation materials for luxury villas.",
    badges: ["Real Estate Branding", "Print Stationery", "Brochure Layouts"],
    isFeatured: false,
  },  {
    slug: "vista-travels-and-tours",
    title: "Vista Travels and Tours",
    category: "Travel Booking & Experience",
    cover: vistaTravelsCover,
    logo: vistaTravelsLogo,
    shortDescription: "Full-stack travel booking website offering comprehensive tour packages and booking management.",
    badges: ["Travel Booking", "Full-Stack", "Node.js"],
    isFeatured: false,
  },
  {
    slug: "bethel-ceylon-tours",
    title: "Bethel Ceylon Tours",
    category: "Travel Management & Customer Experience",
    cover: bethelToursCover,
    logo: bethelToursLogo,
    shortDescription: "Travel management website designed to streamline tour operations and customer inquiries.",
    badges: ["Travel Management", "Web Operations", "Customer Experience"],
    isFeatured: false,
  },
  {
    slug: "hardware-store",
    title: "Hardware Store",
    category: "E-commerce Platform",
    cover: hardwareStoreCover,
    logo: hardwareStoreLogo,
    shortDescription: "Modern e-commerce platform for hardware supplies with dynamic product catalog.",
    badges: ["E-commerce", "Catalog", "Shopping"],
    isFeatured: false,
  },
  {
    slug: "hotel-management-system",
    title: "Hotel Management System",
    category: "Hospitality & Booking System",
    cover: heroPremiumShowcase,
    logo: floatingGlassCards,
    shortDescription: "Web-based platform for managing hotel reservations, rooms, and guest services efficiently.",
    badges: ["Reservations", "Guest Services", "Web System"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "hr-automation-system",
    title: "HR Automation System",
    category: "Desktop HR Automation",
    cover: multiDevicePresentation,
    logo: heroPremiumShowcase,
    shortDescription: "Desktop application for automating HR workflows, employee records, and administrative tasks.",
    badges: ["Automation", "Employee Management", "Desktop App"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "thanking-notes-app",
    title: "Thanking Notes App",
    category: "Employee Communication",
    cover: thankingNotesCover,
    logo: thankingNotesLogo,
    shortDescription: "Internal communication desktop system for employees to share appreciation and notes.",
    badges: ["Communication", "Productivity", "Desktop"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "caravan-fresh-cafeteria",
    title: "Caravan Fresh Cafeteria",
    category: "Cafeteria Management Dashboard",
    cover: caravanCover,
    logo: caravanLogo,
    shortDescription: "Comprehensive cafeteria management system with order processing, menu management, and authentication.",
    badges: ["MERN Stack", "Dashboard", "Order Management"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "payment-management-system",
    title: "Payment Management System",
    category: "Secure Transaction Platform",
    cover: paymentMgmtCover,
    logo: paymentMgmtLogo,
    shortDescription: "Secure transaction management system built with strong Object-Oriented Programming principles.",
    badges: ["OOP", "Security", "Payments"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "mathi-quiz-game",
    title: "Mathi Quiz Game",
    category: "Mobile Quiz & Gamification",
    cover: mathiQuizCover,
    logo: mathiQuizLogo,
    shortDescription: "Engaging mobile quiz application featuring timed challenges and dynamic scoring systems.",
    badges: ["Mobile", "Game", "Quizzes"],
    isFeatured: false,
    isOngoing: true,
  },
  {
    slug: "blossom-task",
    title: "Blossom Task",
    category: "Task Management & Productivity",
    cover: heroPremiumShowcase,
    logo: multiDevicePresentation,
    shortDescription: "Task management application supporting full CRUD operations and deadline tracking.",
    badges: ["CRUD", "Productivity", "Task Tracking"],
    isFeatured: false,
    isOngoing: true,
  },];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 18,
    },
  },
};

interface PortfolioClientProps {
  initialProjects?: Array<{
    slug: string;
    title: string;
    category: string;
    cover: StaticImageData | string;
    logo: StaticImageData | string;
    shortDescription: string;
    badges: string[];
    isFeatured?: boolean;
    isOngoing?: boolean;
  }>;
}

export default function PortfolioClient({ initialProjects }: PortfolioClientProps = {}) {
  const displayProjects = initialProjects && initialProjects.length > 0 ? initialProjects : projects;
  const featuredProject = displayProjects.find(p => p.isFeatured) || displayProjects[0];
  const otherProjects = displayProjects.filter(p => p.slug !== featuredProject?.slug);

  return (
    <main className="min-h-screen bg-transparent pt-28 pb-12 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[380px] h-[380px] rounded-full bg-[#16C7FF]/4 blur-[110px]" />
        <div className="absolute top-[50%] right-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/3 blur-[120px]" />
      </div>

      {/* 1. Header Section */}
      <Section className="pb-12 lg:pb-16 bg-transparent">
        <Container>
          <div className="flex flex-col items-start text-left gap-6 max-w-4xl">
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              Our Portfolio
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              Crafting Digital Experiences That Deliver Results
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              Showcasing carefully crafted branding, websites, social media, UI/UX, and digital experiences built for real businesses.
            </Text>
          </div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Featured Project Showcase */}
      {featuredProject && (
        <Section className="py-0 mb-16 bg-transparent">
          <Container>
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#16C7FF]">
                Featured Case Study
              </span>
              
              <Link
                href={`/portfolio/${featuredProject.slug}`}
                className="group block focus-visible:outline-none"
                aria-label={`View Featured Project: ${featuredProject.title}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#11161C]/55 shadow-2xl hover:border-[#16C7FF]/30 hover:shadow-[0_25px_50px_rgba(22,199,255,0.08),0_0_20px_rgba(22,199,255,0.02)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1">
                  
                  {/* Left Column: Cover Image */}
                  <div className="lg:col-span-7 relative w-full aspect-[16/10] lg:aspect-[4/3] overflow-hidden bg-neutral-900">
                    <Image
                      src={featuredProject.cover}
                      alt={`${featuredProject.title} Cover Showcase`}
                      fill
                      className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                      placeholder={typeof featuredProject.cover === "object" && Boolean(featuredProject.cover?.blurDataURL) ? "blur" : undefined}
                    />
                    <div className="absolute inset-0 bg-neutral-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Right Column: Case study info */}
                  <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between h-full gap-6">
                    <div className="flex flex-col gap-4">
                      {/* Logo and Name */}
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E8E8] p-2.5 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.22),0_8px_20px_rgba(0,0,0,0.04)] group-hover:border-[#16C7FF]/40">
                          <Image
                            src={featuredProject.logo}
                            alt={`${featuredProject.title} Logo`}
                            width={36}
                            height={36}
                            className="object-contain transition-all duration-300 ease-out group-hover:brightness-[1.04] group-hover:contrast-[1.04]"
                            placeholder={typeof featuredProject.logo === "object" && Boolean(featuredProject.logo?.blurDataURL) ? "blur" : undefined}
                            loading="lazy"
                          />
                        </div>
                        <span className="text-xl font-bold text-white group-hover:text-[#16C7FF] transition-colors duration-300">
                          {featuredProject.title}
                        </span>
                      </div>

                      {/* Project Header details */}
                      <p className="text-xs font-semibold text-[#16C7FF] uppercase tracking-wider">
                        {featuredProject.category}
                      </p>

                      <Heading level="h3" className="text-2xl sm:text-3xl font-extrabold text-white border-none pb-0 leading-tight">
                        Modern Tech Platform Redesign
                      </Heading>

                      <Text className="text-sm text-white/60 leading-relaxed">
                        {featuredProject.shortDescription}
                      </Text>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {featuredProject.badges.map((b, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="px-3 py-1 rounded-full text-xs bg-[#11161C]/50 border border-white/10 text-white/70"
                          >
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#16C7FF] group-hover:text-[#60D6FF] transition-colors duration-300">
                      View Full Case Study
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                        &rarr;
                      </span>
                    </div>
                  </div>

                </div>
              </Link>
            </div>
          </Container>
        </Section>
      )}

      {/* 3. Portfolio Grid Section */}
      <Section className="pt-0 bg-transparent">
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
          >
            {otherProjects.map((project) => (
              <motion.div
                key={project.slug}
                variants={cardVariants}
                className="h-full"
              >
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="group block h-full focus-visible:outline-none"
                  aria-label={`View ${project.title} Case Study`}
                >
                  <div className="flex flex-col h-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#11161C]/55 shadow-lg hover:border-[#16C7FF]/30 hover:shadow-[0_20px_40px_rgba(22,199,255,0.06)] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5">
                    
                    {/* Cover image wrapper */}
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-900 border-b border-white/10">
                      <Image
                        src={project.cover}
                        alt={`${project.title} Cover Showcase`}
                        fill
                        className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        placeholder={typeof project.cover === "object" && Boolean(project.cover?.blurDataURL) ? "blur" : undefined}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-neutral-950/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    {/* Card Content details */}
                    <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                      <div className="flex flex-col gap-4">
                        {/* Logo, title and badges */}
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E8E8] p-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] shrink-0 transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.22),0_8px_20px_rgba(0,0,0,0.04)] group-hover:border-[#16C7FF]/40">
                            <Image
                              src={project.logo}
                              alt={`${project.title} Logo`}
                              width={32}
                              height={32}
                              className="object-contain transition-all duration-300 ease-out group-hover:brightness-[1.04] group-hover:contrast-[1.04]"
                              placeholder={typeof project.logo === "object" && Boolean(project.logo?.blurDataURL) ? "blur" : undefined}
                              loading="lazy"
                            />
                          </div>
                          <span className="text-lg font-bold text-white mt-0.5 group-hover:text-[#16C7FF] transition-colors duration-300 truncate">
                            {project.title}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16C7FF]">
                            {project.category}
                          </span>
                          <p className="text-sm text-white/60 mt-2 leading-relaxed">
                            {project.shortDescription}
                          </p>
                        </div>

                        {project.isOngoing && (
                          <Badge
                            variant="secondary"
                            className="w-fit px-2.5 py-1 rounded-full text-[10px] bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[#16C7FF]"
                          >
                            Ongoing Project
                          </Badge>
                        )}

                        {/* Deliverable Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.badges.map((badge, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="px-2 py-0.5 rounded-full text-[10px] bg-[#11161C]/40 border border-white/10 text-white/70"
                            >
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* View Project button link */}
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#16C7FF] group-hover:text-[#60D6FF] transition-colors duration-300 mt-2">
                        View Project
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 4. Portfolio Conversion CTA */}
      <Section className="py-12 pb-20 bg-transparent">
        <Container>
          <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-2xl p-10 sm:p-14 md:p-16 lg:p-20">
            <div className="absolute inset-0 blueprint-grid opacity-[0.25] pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-10 sm:gap-14 lg:gap-16 z-10">
              
              {/* Left Column Text */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
                <Badge
                  variant="secondary"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                >
                  NEXT STEP
                </Badge>
                <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  Ready to Build Something Exceptional?
                </Heading>
                <Text className="max-w-xl text-white/70 text-base sm:text-lg leading-relaxed">
                  Let&apos;s transform your ideas into a memorable digital experience.
                </Text>
              </div>

              {/* Right Column CTA buttons */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-5 sm:gap-6 w-full">
                <motion.div
                  whileHover={{
                    y: -2,
                    scale: 1.02,
                    boxShadow: "0 0 25px rgba(22, 199, 255, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="shrink-0"
                >
                  <Link href="/contact" className="inline-block rounded-full outline-none focus:outline-none">
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-8 py-5 shadow-md transition-all duration-300 text-center cursor-pointer"
                    >
                      Start Your Project
                    </Button>
                  </Link>
                </motion.div>
                
                <Link
                  href="/contact"
                  className="text-sm font-semibold text-white hover:text-[#16C7FF] transition-colors duration-300 whitespace-nowrap"
                >
                  Contact Us &rarr;
                </Link>
              </div>

            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
