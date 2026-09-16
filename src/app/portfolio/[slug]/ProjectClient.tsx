"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface Project {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  cover: string;
  logo: string;
  client: string;
  role: string;
  year: string;
  deliverables: string[];
  isOngoing?: boolean;
}

export interface SectionData {
  id: string;
  title: string;
  images: string[];
}

interface ProjectClientProps {
  project: Project;
  sections: SectionData[];
  prevProject: Project;
  nextProject: Project;
}

export default function ProjectClient({ project, sections, prevProject, nextProject }: ProjectClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all images across all sections for lightbox navigation
  const allImages = sections.flatMap((section) =>
    section.images.map((img) => ({
      src: img,
      sectionTitle: section.title,
    }))
  );

  const openLightbox = (imgSrc: string) => {
    const index = allImages.findIndex((item) => item.src === imgSrc);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (direction: "prev" | "next") => {
      if (lightboxIndex === null) return;
      let newIndex = lightboxIndex;
      if (direction === "prev") {
        newIndex = (lightboxIndex - 1 + allImages.length) % allImages.length;
      } else {
        newIndex = (lightboxIndex + 1) % allImages.length;
      }
      setLightboxIndex(newIndex);
    },
    [lightboxIndex, allImages.length]
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        navigateLightbox("next");
      } else if (e.key === "ArrowLeft") {
        navigateLightbox("prev");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  // Lock body scroll when lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <main className="min-h-screen bg-transparent pb-12 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#16C7FF]/4 blur-[100px]" />
        <div className="absolute top-[50%] left-[5%] w-[320px] h-[320px] rounded-full bg-blue-500/3 blur-[110px]" />
      </div>

      {/* 1. Project Hero */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <Container>
          <div className="flex flex-col gap-8 md:gap-10">
            {/* Back Link */}
            <Link
              href="/portfolio"
              className="group flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-[#16C7FF] w-fit transition-colors"
              aria-label="Back to portfolio showcase page"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
                &larr;
              </span>
              Back to Portfolio
            </Link>

            {/* Title & Short Summary */}
            <div className="flex flex-col gap-5 max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="secondary"
                  className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md"
                >
                  {project.category}
                </Badge>
                {project.isOngoing && (
                  <Badge
                    variant="secondary"
                    className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#16C7FF]/20 bg-[#16C7FF]/10 text-[#16C7FF] backdrop-blur-md"
                  >
                    Ongoing Project
                  </Badge>
                )}
              </div>
              <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                {project.title}
              </Heading>
              <Text className="text-white/60 text-lg sm:text-xl leading-relaxed mt-1">
                {project.shortDescription}
              </Text>
            </div>

            {/* Hero Cover Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-full aspect-[21/9] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 mt-4 lg:mt-6"
            >
              <Image
                src={project.cover}
                alt={`${project.title} Project Case Study Cover`}
                fill
                className="object-cover opacity-90"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/40 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </Container>
      </div>

      {/* 2. Project Overview */}
      <Section className="py-16 lg:py-24 border-t border-white/5 bg-transparent">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Overview Description */}
            <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
              <Heading level="h3" className="text-2xl sm:text-3xl font-extrabold text-white border-none pb-0">
                Project Overview
              </Heading>
              <Text className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl">
                {project.description}
              </Text>
            </div>

            {/* Sidebar Metadata Card */}
            <div className="lg:col-span-4 rounded-3xl bg-[#11161C]/55 border border-white/10 p-8 sm:p-10 flex flex-col gap-8 shadow-xl backdrop-blur-md hover:border-[#16C7FF]/20 transition-all duration-300">
              <div className="grid grid-cols-2 gap-8 pb-6 border-b border-white/5">
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-white/50">Client</span>
                  <p className="text-sm font-bold text-white/80 mt-1.5">
                    {project.client}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-white/50">Year</span>
                  <p className="text-sm font-bold text-white/80 mt-1.5">
                    {project.year}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-white/50">Role</span>
                <p className="text-sm font-bold text-white/80 mt-1.5">
                  {project.role}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-white/50 block mb-4">
                  Deliverables
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {project.deliverables.map((item, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#11161C]/50 border border-white/10 text-white/70 animate-pulse"
                      style={{ animationDuration: "10s", animationDelay: `${idx * 0.2}s` }}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* 3. Showcase Sections */}
      {sections.map((section) => {
        const isLogoSection = section.title === "Logo Design" || section.title.toLowerCase().includes("logo");
        return (
          <div key={section.id} id={section.id}>
            <Section
              className="py-16 lg:py-24 border-t border-white/5 bg-transparent"
            >
              <Container>
                <div className="flex flex-col gap-10">
                  
                  {/* Section Header */}
                  <div className="flex flex-col gap-3">
                    <Badge
                      variant="secondary"
                      className="w-fit px-3 py-1 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                    >
                      SHOWCASE
                    </Badge>
                    <Heading level="h2" className="text-3xl font-extrabold text-white border-none pb-0 tracking-tight">
                      {section.title}
                    </Heading>
                  </div>

                  {/* Dynamic Image Gallery */}
                  <div
                    className={cn(
                      "grid gap-8",
                      section.images.length === 1 && "grid-cols-1 max-w-4xl mx-auto w-full",
                      section.images.length === 2 && "grid-cols-1 md:grid-cols-2",
                      section.images.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    )}
                  >
                    {section.images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 35, filter: "blur(5px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                          type: "spring",
                          stiffness: 85,
                          damping: 18,
                          delay: idx * 0.1,
                        }}
                        onClick={() => openLightbox(img)}
                        className={cn(
                          "reflection-sweep relative w-full aspect-[16/10] rounded-3xl overflow-hidden border border-white/10 shadow-sm group cursor-pointer flex items-center justify-center transition-all duration-300 hover:shadow-md hover:-translate-y-1",
                          isLogoSection
                            ? "bg-white/90 border border-white/20 p-8 sm:p-12"
                            : "bg-[#11161C]/55"
                        )}
                        data-cursor-label="OPEN"
                      >
                        <Image
                          src={img}
                          alt={`${project.title} - ${section.title} Image ${idx + 1}`}
                          fill
                          className={cn(
                            "transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                            isLogoSection ? "object-contain p-8 sm:p-12 opacity-100" : "object-cover opacity-90 group-hover:opacity-100"
                          )}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </motion.div>
                    ))}
                  </div>

                </div>
              </Container>
            </Section>
          </div>
        );
      })}

      {/* 4. Related Projects */}
      <Section className="py-16 lg:py-24 border-t border-white/5 bg-transparent">
        <Container>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <Badge
                variant="secondary"
                className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
              >
                PROJECT NAVIGATION
              </Badge>
              <Heading level="h2" className="text-3xl font-extrabold text-white border-none pb-0 tracking-tight">
                Explore More Case Studies
              </Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              
              {/* Previous Project Card */}
              <Link
                href={`/portfolio/${prevProject.slug}`}
                className="group block focus-visible:outline-none"
                aria-label={`View Previous Project: ${prevProject.title}`}
                data-cursor-label="VIEW"
              >
                <div className="flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1">
                  <div className="reflection-sweep relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900">
                    <Image
                      src={prevProject.cover}
                      alt={`${prevProject.title} Case Study Cover`}
                      fill
                      className="object-cover opacity-80 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:opacity-90"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:opacity-40 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-5 py-2.5 rounded-full bg-white/95 text-[#050608] text-xs font-bold uppercase tracking-wider shadow-md">
                        &larr; Previous Case
                      </span>
                    </div>
                  </div>
                  
                  {/* Footer with Logo & Titles */}
                  <div className="px-2 flex items-center gap-3.5">
                    <div className="relative size-12 rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E8E8] p-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] shrink-0 transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.22),0_8px_20px_rgba(0,0,0,0.04)] group-hover:border-[#16C7FF]/40">
                      <Image
                        src={prevProject.logo}
                        alt={`${prevProject.title} Logo`}
                        width={32}
                        height={32}
                        className="object-contain transition-all duration-300 ease-out group-hover:brightness-[1.04] group-hover:contrast-[1.04]"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#16C7FF]">
                        {prevProject.category}
                      </span>
                      <Heading level="h4" className="text-lg font-bold text-white mt-0.5 border-none pb-0 leading-tight">
                        {prevProject.title}
                      </Heading>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Next Project Card */}
              <Link
                href={`/portfolio/${nextProject.slug}`}
                className="group block focus-visible:outline-none"
                aria-label={`View Next Project: ${nextProject.title}`}
                data-cursor-label="VIEW"
              >
                <div className="flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900">
                    <Image
                      src={nextProject.cover}
                      alt={`${nextProject.title} Case Study Cover`}
                      fill
                      className="object-cover opacity-80 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:opacity-90"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:opacity-40 transition-opacity duration-300 flex items-center justify-center">
                      <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] text-xs font-bold uppercase tracking-wider shadow-md">
                        Next Case &rarr;
                      </span>
                    </div>
                  </div>
                  
                  {/* Footer with Logo & Titles */}
                  <div className="px-2 flex items-center gap-3.5">
                    <div className="relative size-12 rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E8E8E8] p-2 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.06)] shrink-0 transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.22),0_8px_20px_rgba(0,0,0,0.04)] group-hover:border-[#16C7FF]/40">
                      <Image
                        src={nextProject.logo}
                        alt={`${nextProject.title} Logo`}
                        width={32}
                        height={32}
                        className="object-contain transition-all duration-300 ease-out group-hover:brightness-[1.04] group-hover:contrast-[1.04]"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#16C7FF]">
                        {nextProject.category}
                      </span>
                      <Heading level="h4" className="text-lg font-bold text-white mt-0.5 border-none pb-0 leading-tight">
                        {nextProject.title}
                      </Heading>
                    </div>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </Container>
      </Section>

      {/* 5. Discussion CTA */}
      <Section className="py-12 pb-20 bg-transparent border-t border-white/5">
        <Container>
          <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#11161C]/55 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 blueprint-grid opacity-[0.25] pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16 z-10">
              <div className="lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
                <Badge
                  variant="secondary"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                >
                  HAVE A PROJECT IN MIND?
                </Badge>
                <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  Let&apos;s Create Something Remarkable
                </Heading>
                <Text className="max-w-2xl text-white/70 text-base sm:text-lg leading-relaxed">
                  We are ready to bring your vision to life with strategic branding, custom layouts, and highly functional web solutions.
                </Text>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-6 w-full">
                <motion.div
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                    boxShadow: "0 0 25px rgba(22, 199, 255, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-full sm:w-auto lg:w-full"
                >
                  <Link href="/contact" className="w-full block">
                    <Button
                      size="lg"
                      className="w-full rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-8 py-6 shadow-md transition-all duration-300 text-center cursor-pointer"
                    >
                      Start a Project
                    </Button>
                  </Link>
                </motion.div>
                
                <Link
                  href="/contact"
                  className="text-sm font-semibold text-white hover:text-[#16C7FF] transition-colors duration-300"
                >
                  Contact Our Team &rarr;
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. Fullscreen Interactive Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-6 select-none cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-neutral-900/60 border border-white/10 text-white hover:bg-neutral-800 hover:scale-105 transition-all duration-300 cursor-pointer z-50 shadow-lg"
              aria-label="Close image preview"
            >
              <X className="size-6" />
            </button>

            {/* Previous Image Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("prev");
              }}
              className="absolute left-4 sm:left-6 p-3 rounded-full bg-neutral-900/60 border border-white/10 text-white hover:bg-neutral-800 hover:scale-105 transition-all duration-300 cursor-pointer z-50 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* Image Showcase Container */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-full max-h-[75vh] flex flex-col items-center justify-center cursor-default"
            >
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full"
              >
                <Image
                  src={allImages[lightboxIndex].src}
                  alt={`Case Study Preview: ${allImages[lightboxIndex].sectionTitle}`}
                  fill
                  priority
                  className="object-contain"
                  sizes="100vw"
                />
              </motion.div>
            </div>

            {/* Next Image Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("next");
              }}
              className="absolute right-4 sm:right-6 p-3 rounded-full bg-neutral-900/60 border border-white/10 text-white hover:bg-neutral-800 hover:scale-105 transition-all duration-300 cursor-pointer z-50 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Info details footer */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-8 left-6 right-6 text-center select-text flex flex-col gap-1 z-40 bg-neutral-950/60 border border-white/10 backdrop-blur-md py-2.5 px-6 rounded-full w-fit mx-auto shadow-xl"
            >
              <p className="text-sm font-bold text-[#16C7FF] tracking-wider uppercase leading-none">
                {allImages[lightboxIndex].sectionTitle}
              </p>
              <p className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">
                Image {lightboxIndex + 1} of {allImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
