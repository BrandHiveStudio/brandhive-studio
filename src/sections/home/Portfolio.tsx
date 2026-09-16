"use client";

import type { StaticImageData } from "next/image";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicProject } from "@/lib/db/queries/projects";
import uzeeTechCover from "../../../public/images/portfolio/covers/portfolio-uzee-tech-cover.png";
import uzeeTechLogo from "../../../public/images/portfolio/UZEE TECH/01 Logo/logo-icon.png";
import qdxExpressCover from "../../../public/images/portfolio/covers/portfolio-qdx-express-cover.png";
import qdxExpressLogo from "../../../public/images/portfolio/QDX Express/01 Logo Design/Primary Logo.png";
import bethelTourCover from "../../../public/images/portfolio/Bethel Ceylon Tours/02 Website/Home.png";
import bethelTourLogo from "../../../public/images/portfolio/Bethel Ceylon Tours/01 Logo/logo.png";
import { motion, Variants, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/cards/Card";
import { staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/Button";

interface Project {
  title: string;
  category: string;
  image: StaticImageData | string;
  logo: StaticImageData | string;
  description: string;
  href: string;
  client: string;
  industry: string;
  services: string;
  year: string;
  isOngoing?: boolean;
}

const projects: Project[] = [
  {
    title: "UZEE TECH",
    category: "Branding & Web Development",
    image: uzeeTechCover,
    logo: uzeeTechLogo,
    description: "Premium digital identity and custom website development for a next-gen technology provider.",
    href: "/portfolio/uzee-tech",
    client: "Uzee Tech",
    industry: "IT Solutions",
    services: "Web Design, Dev",
    year: "2026",
  },
  {
    title: "QDX Express",
    category: "Brand Identity & Logistics",
    image: qdxExpressCover,
    logo: qdxExpressLogo,
    description: "A complete branding system and corporate stationery design for a modern logistics company.",
    href: "/portfolio/qdx-express",
    client: "QDX Logistics",
    industry: "Logistics",
    services: "Identity, Print",
    year: "2025",
  },
  {
    title: "Bethel Ceylon Tours",
    category: "Travel Management",
    image: bethelTourCover,
    logo: bethelTourLogo,
    description: "Travel management website designed to streamline tour operations and customer inquiries.",
    href: "/portfolio/bethel-ceylon-tours",
    client: "Bethel Ceylon Tours",
    industry: "Travel",
    services: "Booking, Management",
    year: "2026",
  },
];

const containerVariants: Variants = staggerContainer(0.12);

const imageRevealVariant: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)", scale: 1.08, opacity: 0 },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    scale: 1,
    opacity: 1,
    transition: { duration: 0.75, ease: [0.77, 0, 0.175, 1] },
  },
};

interface PortfolioProps {
  initialProjects?: PublicProject[];
}

export default function Portfolio({ initialProjects }: PortfolioProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  const displayedProjects = useMemo(() => {
    if (initialProjects && initialProjects.length > 0) {
      return initialProjects.slice(0, 6).map((p) => ({
        title: p.title,
        category: p.category,
        image: p.cover,
        logo: p.logo,
        description: p.shortDescription || p.description,
        href: `/portfolio/${p.slug}`,
        client: p.client,
        industry: p.category,
        services: p.badges && p.badges.length > 0 ? p.badges.slice(0, 2).join(", ") : p.category,
        year: p.year,
        isOngoing: p.isOngoing,
      }));
    }
    return projects;
  }, [initialProjects]);

  const cardVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const [activeTilt, setActiveTilt] = useState<number | null>(null);
  const [tiltCoords, setTiltCoords] = useState({ rx: 0, ry: 0, x: 50, y: 50 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = -((y - rect.height / 2) / (rect.height / 2)) * 6;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    
    setTiltCoords({ rx, ry, x: px, y: py });
    setActiveTilt(idx);
  };

  const handleCardMouseLeave = () => {
    setActiveTilt(null);
    setTiltCoords({ rx: 0, ry: 0, x: 50, y: 50 });
  };

  return (
    <div id="portfolio">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 bg-transparent">
        
        {/* Volumetric Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[30%] right-[20%] w-[380px] h-[380px] rounded-full bg-[#16C7FF]/3 blur-[110px]" />
          <div className="absolute bottom-[20%] left-[10%] w-[420px] h-[420px] rounded-full bg-blue-500/2 blur-[130px]" />
        </div>

        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center mb-16 max-w-[800px] mx-auto px-4">
          <Badge
            variant="secondary"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] uppercase tracking-wider"
          >
            FEATURED WORK
          </Badge>
          <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
            Selected <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Client Success Stories</span>
          </Heading>
          <Text className="text-white/60 text-base sm:text-lg leading-relaxed mt-1">
            A curated selection of branding, digital products, websites, and business solutions that showcase the quality, creativity, and strategic thinking behind BrandHive Studio.
          </Text>
        </div>

        {/* Portfolio Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          {displayedProjects.map((project, index) => (
            <motion.div key={index} variants={cardVariants} style={{ willChange: "transform, opacity" }} className="h-full">
              <Link href={project.href} className="group block h-full focus-visible:outline-none" data-cursor-label="VIEW CASE STUDY">
                {/* 3D tilt and lighting sweep showcase card */}
                <div
                  onMouseMove={(e) => handleCardMouseMove(e, index)}
                  onMouseLeave={handleCardMouseLeave}
                  style={activeTilt === index ? {
                    transform: `perspective(1000px) rotateX(${tiltCoords.rx}deg) rotateY(${tiltCoords.ry}deg)`,
                    transition: "transform 0.1s ease-out"
                  } : {
                    transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
                    transition: "transform 0.35s ease-out"
                  }}
                  className="h-full"
                >
                  <Card className="reflection-sweep breathing-card relative flex flex-col h-full overflow-hidden border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#16C7FF]/35 hover:shadow-[0_20px_45px_rgba(22,199,255,0.1),0_0_25px_rgba(22,199,255,0.03)] hover:-translate-y-1.5 hover:scale-[1.02] rounded-3xl transition-all duration-350 ease-out">
                    
                    {/* Subtle Honeycomb Backing */}
                    <div className="absolute top-4 right-4 size-16 text-[#16C7FF]/4 pointer-events-none select-none z-0">
                      <svg className="size-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" />
                      </svg>
                    </div>

                    {/* Lighting Sweep Layer */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-30" 
                      style={{
                        background: `radial-gradient(circle 200px at ${activeTilt === index ? tiltCoords.x : 50}% ${activeTilt === index ? tiltCoords.y : 50}%, rgba(22, 199, 255, 0.08) 0%, transparent 60%)`
                      }}
                    />

                    {/* Card Image Cover Container — premium clip-path reveal */}
                    <div className="image-reveal-container relative w-full aspect-[16/10] bg-neutral-900 flex items-center justify-center">
                      <motion.div
                        className="absolute inset-0"
                        variants={imageRevealVariant}
                      >
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-90 group-hover:opacity-100"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          placeholder="blur"
                          loading="lazy"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/40 to-transparent pointer-events-none z-10" />
                    </div>

                    {/* Card Header */}
                    <CardHeader className="p-8 pb-3 flex flex-col gap-3 z-10">
                      <span className="text-[8px] font-mono text-white/30 tracking-wider block leading-none">[PROJ_DATA_TRACKING // SEC_02]</span>
                      <div className="flex items-center gap-4">
                        {/* Logo container - White Badge */}
                        <div className="relative size-12 rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E8E8] p-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] shrink-0 transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.22),0_8px_20px_rgba(0,0,0,0.04)] group-hover:border-[#16C7FF]/40">
                          <Image
                              src={project.logo}
                              alt={`${project.title} Logo`}
                              width={32}
                              height={32}
                              className="object-contain transition-all duration-300 ease-out group-hover:brightness-[1.04] group-hover:contrast-[1.04]"
                              placeholder="blur"
                              loading="lazy"
                            />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-[#16C7FF] transition-colors duration-300">
                          {project.category}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <CardTitle className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#16C7FF]">
                          {project.title}
                        </CardTitle>
                        {project.isOngoing && (
                          <Badge
                            variant="secondary"
                            className="w-fit px-2.5 py-1 rounded-full text-[10px] bg-[#16C7FF]/10 border border-[#16C7FF]/20 text-[#16C7FF]"
                          >
                            Ongoing Project
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    {/* Card Content */}
                    <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between gap-6 z-10">
                      <CardDescription className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                        {project.description}
                      </CardDescription>
                      
                      {/* Progressive Story Metadata Reveal on Hover */}
                      <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 ease-in-out border-t border-white/5 pt-3 mt-1 flex flex-col gap-1.5 text-[11px] text-white/50">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#16C7FF]/80 block">Client</span>
                            <span className="font-semibold text-white/80">{project.client}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#16C7FF]/80 block">Industry</span>
                            <span className="font-semibold text-white/80">{project.industry}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#16C7FF]/80 block">Services</span>
                            <span className="font-semibold text-white/80">{project.services}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#16C7FF]/80 block">Year</span>
                            <span className="font-semibold text-white/80">{project.year}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60 group-hover:text-[#16C7FF] transition-all duration-300 mt-2">
                        View Project
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 group-hover:-rotate-12">
                          &rarr;
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View Full Portfolio CTA */}
        <div className="flex justify-center mt-12 sm:mt-16">
          <Link href="/portfolio">
            <Button variant="default" size="lg">
              View Full Portfolio &rarr;
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
