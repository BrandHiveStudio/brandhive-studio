"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import heroLaptopImage from "../../../public/images/hero/devices/hero-laptop-website-presentation.webp";
import heroIphoneImage from "../../../public/images/hero/devices/hero-iphone-homepage.png";
import heroUIBranding from "../../../public/images/hero/UI Cards/hero-ui-branding.png";
import heroUIWebsite from "../../../public/images/hero/UI Cards/hero-ui-website.png";
import heroUISocial from "../../../public/images/hero/UI Cards/hero-ui-social.png";
import avatarAbout from "../../../public/images/about/studio/about-design-desk-flat-lay.webp";
import avatarUzee from "../../../public/images/portfolio/covers/portfolio-uzee-tech-cover.png";
import avatarSeya from "../../../public/images/portfolio/covers/portfolio-seya-beauty-cover.png";
import avatarLeo from "../../../public/images/portfolio/covers/portfolio-leo-villas-cover.png";
import Link from "next/link";
import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import Section from "@/components/layout/Section";
import Text from "@/components/typography/Text";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Counter from "@/components/ui/Counter";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 18,
    },
  },
};

const headlineParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 18,
    },
  },
};

const avatarParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const avatarChildVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, x: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 14,
    },
  },
};

const awardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: 0.45,
    },
  },
};

interface HeroProps {
  contentMap?: Record<string, string>;
}

export default function Hero({ contentMap }: HeroProps = {}) {
  const [coords, setCoords] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setCoords({ rx: -y * 8, ry: x * 8 });
  };

  const handleMouseLeave = () => {
    setCoords({ rx: 0, ry: 0 });
  };

  // Cursor-based multi-layer parallax springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120, mass: 0.55 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  // Map coordinate offsets for 4 depth layers
  const gridX = useTransform(smoothX, (x) => x * -5);
  const gridY = useTransform(smoothY, (y) => y * -5);

  const glowX = useTransform(smoothX, (x) => x * 8);
  const glowY = useTransform(smoothY, (y) => y * 8);

  const deviceX = useTransform(smoothX, (x) => x * 12);
  const deviceY = useTransform(smoothY, (y) => y * 12);

  const particlesX = useTransform(smoothX, (x) => x * -18);
  const particlesY = useTransform(smoothY, (y) => y * -18);

  return (
    <Section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 bg-transparent">
      {/* 1. Background grid layer (5px scope) */}
      <motion.div 
        style={{ x: gridX, y: gridY }}
        className="absolute inset-0 blueprint-grid opacity-[0.14] pointer-events-none -z-30" 
      />

      {/* 2. Ambient glows (8px scope) */}
      <motion.div 
        style={{ x: glowX, y: glowY }}
        className="absolute inset-0 -z-20 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[10%] left-[20%] w-[35vw] h-[35vw] min-w-[300px] rounded-full bg-[#16C7FF]/8 blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] min-w-[350px] rounded-full bg-blue-500/4 blur-[120px]" />
        
        <motion.div
          animate={{
            x: [-30, 30, -30],
            y: [-25, 25, -25],
            scale: [0.92, 1.08, 0.92],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[15%] left-[15%] w-[320px] h-[320px] rounded-full bg-[#16C7FF]/5 blur-[100px]"
        />
      </motion.div>

      {/* 3. Parallax Particles (18px scope) */}
      <motion.div
        style={{ x: particlesX, y: particlesY }}
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
      >
        <div className="absolute top-[15%] right-[42%] size-2.5 bg-[#16C7FF]/40 rounded-full blur-[0.3px]" />
        <div className="absolute bottom-[25%] left-[45%] size-3.5 bg-[#16C7FF]/35 rounded-[30%] blur-[0.4px]" />
        <div className="absolute top-[65%] right-[10%] size-2 bg-blue-500/40 rounded-full blur-[0.2px]" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid items-center gap-12 lg:grid-cols-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Left Column Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 z-10">
          
          {/* Subtitle Badge */}
          <motion.div variants={fadeUpVariants}>
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)] cursor-default"
              data-cursor-hover
            >
              {contentMap?.["hero_badge"] || "Creative Branding & Digital Agency"}
            </Badge>
          </motion.div>

          {/* Headline with Staggered Lines Reveal */}
          <motion.div variants={fadeUpVariants} className="w-full">
            <motion.h1 
              variants={headlineParentVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white"
            >
              <span className="block overflow-hidden py-1">
                <motion.span className="block" variants={lineVariants}>
                  {contentMap?.["hero_title_line1"] || "Building Brands"}
                </motion.span>
              </span>
              <span className="block overflow-hidden py-1">
                <motion.span className="block" variants={lineVariants}>
                  {contentMap?.["hero_title_line2"] || "That Get"}
                </motion.span>
              </span>
              <span className="block overflow-hidden py-1">
                <motion.span 
                  className="inline-block text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] via-[#00c4ff] to-[#0096C7] drop-shadow-[0_0_18px_rgba(22,199,255,0.25)] animate-pulse" 
                  style={{ animationDuration: "4.5s" }}
                  variants={lineVariants}
                >
                  {contentMap?.["hero_title_highlight"] || "Noticed."}
                </motion.span>
              </span>
            </motion.h1>
          </motion.div>

          {/* Description */}
          <motion.div variants={fadeUpVariants}>
            <Text className="max-w-xl text-lg sm:text-xl text-white/70 leading-relaxed font-normal">
              {contentMap?.["hero_description"] || "We help businesses grow with stunning brand identities, creative designs, powerful websites, and result-driven digital marketing."}
            </Text>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            variants={fadeUpVariants}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Link href="/contact" data-cursor-label="BUILD">
                <Button
                  size="lg"
                  className="rounded-full text-[#050608] font-bold px-8 py-5 transition-all duration-300 bg-gradient-to-r from-[#16C7FF] via-[#00c4ff] to-[#0096C7] hover:from-[#60D6FF] hover:to-[#16C7FF] shadow-[0_0_20px_rgba(22,199,255,0.25)] cursor-pointer"
                >
                  {contentMap?.["hero_cta_primary"] || "Start a Project"}
                </Button>
              </Link>
            </motion.div>

            <Link
              href="/portfolio"
              className="group flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-white/80 hover:text-[#16C7FF] transition-colors py-2 px-4"
              aria-label="View BrandHive Studio work portfolio"
              data-cursor-label="VIEW"
            >
              {contentMap?.["hero_cta_secondary"] || "View our Work"}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </motion.div>

          {/* Trust Metrics and Awwwards Glass Badge (Row) */}
          <motion.div
            variants={fadeUpVariants}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-8 border-t border-white/10 pt-8 mt-4"
            data-cursor-label="PEOPLE"
          >
            {/* Metrices list */}
            <div className="flex flex-col gap-4">
              <motion.div 
                variants={avatarParentVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center -space-x-3.5"
              >
                {[
                  avatarAbout,
                  avatarUzee,
                  avatarSeya,
                  avatarLeo,
                ].map((src, i) => (
                  <motion.div 
                    key={i} 
                    variants={avatarChildVariants}
                    className="relative size-10 rounded-full overflow-hidden border border-white/15 bg-[#11161C] shadow-sm"
                    whileHover={{ scale: 1.15, zIndex: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Image
                      src={src}
                      alt="User avatar thumbnail representation"
                      fill
                      className="object-cover"
                      loading="lazy"
                      placeholder="blur"
                      sizes="40px"
                    />
                  </motion.div>
                ))}
                <motion.div 
                  variants={avatarChildVariants}
                  className="flex items-center justify-center size-10 rounded-full border border-white/15 bg-[#0C1117] text-white/90 text-[10px] font-bold shadow-sm z-10"
                >
                  +{parseInt(contentMap?.["stats_clients_number"] || "25", 10) || 25}
                </motion.div>
              </motion.div>
              <div className="grid grid-cols-3 gap-6 text-white/70">
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-white leading-none">
                    <Counter value={parseInt(contentMap?.["stats_clients_number"] || "25", 10) || 25} />{contentMap?.["stats_clients_suffix"] ?? "+"}
                  </p>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{contentMap?.["stats_clients_label"] || "Clients Served"}</span>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-white leading-none">
                    <Counter value={parseInt(contentMap?.["stats_projects_number"] || "50", 10) || 50} />{contentMap?.["stats_projects_suffix"] ?? "+"}
                  </p>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{contentMap?.["stats_projects_label"] || "Projects Delivered"}</span>
                </div>
                <div>
                  <p className="text-sm sm:text-base font-extrabold text-white leading-none">
                    <Counter value={parseInt(contentMap?.["stats_years_number"] || "2", 10) || 2} />{contentMap?.["stats_years_suffix"] ?? "+"}
                  </p>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{contentMap?.["stats_years_label"] || "Years of Experience"}</span>
                </div>
              </div>
            </div>

            {/* Awwwards Glass Badge */}
            <motion.div 
              variants={awardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl border border-white/5 bg-[#11161C]/40 p-4 flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(22,199,255,0.02)]"
            >
              <div className="size-8 rounded-lg bg-[#16C7FF]/10 flex items-center justify-center">
                <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider leading-none">
                  {contentMap?.["stats_awwwards_title"] || "AWWWARDS"}
                </p>
                <span className="text-[10px] text-white/50 font-bold block mt-1">
                  {contentMap?.["stats_awwwards_subtitle"] || "Honorable Member Agency 2026"}
                </span>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Right Column Artwork - Laptop + Phone Showcase */}
        <motion.div
          variants={fadeUpVariants}
          style={{ x: deviceX, y: deviceY }}
          className="lg:col-span-5 flex items-center justify-center relative py-12 lg:py-0"
        >
          {/* Main Container with 3D Perspective Mouse Tracking */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg)`,
              transition: "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)"
            }}
            className="relative w-full max-w-[480px] aspect-[4/3] flex items-center justify-center"
            data-cursor-label="EXPLORE"
          >
            
            {/* 1. MacBook Laptop Mockup */}
            <motion.div
              initial={{ opacity: 1, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [20, 0, -4, 0],
                rotate: [0, 0, -0.5, 0.5, -0.5],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
                rotate: { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
              }}
              style={{
                rotateX: coords.rx * 0.7,
                rotateY: coords.ry * 0.7,
                transformStyle: "preserve-3d" as const,
                willChange: "transform",
              }}
              className="relative w-full aspect-[16/10] z-20 drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] pointer-events-none"
            >
              {/* Rim lighting effect */}
              <div className="absolute inset-x-[12%] top-[8%] bottom-[13%] -z-10 rounded-md bg-[#16C7FF]/6 blur-[25px] pointer-events-none" />
              {/* Ambient reflection overlay */}
              <div 
                className="absolute inset-x-[12%] top-[8%] bottom-[13%] bg-gradient-to-tr from-transparent via-[#16C7FF]/4 to-transparent opacity-40 pointer-events-none rounded-md mix-blend-screen z-10 transition-transform duration-300"
                style={{
                  transform: `translate(${coords.ry * 3}px, ${-coords.rx * 3}px)`,
                }}
              />
              <Image
                src={heroLaptopImage}
                alt="BrandHive Agency MacBook presentation mockup"
                fill
                placeholder="blur"
                className="object-contain"
                sizes="(max-width: 1024px) 480px, 420px"
                priority
                quality={75}
              />
            </motion.div>

            {/* 2. iPhone Phone Mockup (bottom-right overlap) */}
            <motion.div
              data-nosnippet
              initial={{ opacity: 1, scale: 0.88, y: 16 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [16, 0, -8, 0],
                rotate: [-1.2, 1.2, -1.2],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                rotate: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
              }}
              style={{
                rotateX: coords.rx * 1.2,
                rotateY: coords.ry * 1.2,
                transformStyle: "preserve-3d" as const,
                x: coords.ry * -4,
                willChange: "transform",
              }}
              className="absolute bottom-[-15px] right-[-15px] z-30 w-[140px] sm:w-[170px] aspect-[1/2] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-none"
            >
              <div className="absolute inset-0 bg-[#16C7FF]/5 blur-[15px] pointer-events-none z-10" />
              {/* Ambient reflection */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#16C7FF]/6 to-transparent opacity-50 pointer-events-none mix-blend-screen z-10 transition-transform duration-300"
                style={{
                  transform: `translate(${coords.ry * 2}px, ${-coords.rx * 2}px)`,
                }}
              />
              <Image
                src={heroIphoneImage}
                alt="Responsive mobile homepage mockup showcase"
                fill
                className="object-contain z-0"
                sizes="170px"
                placeholder="blur"
                loading="lazy"
              />
            </motion.div>

            {/* 3. Floating UI Card (top-left) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [12, 0, -6, 0],
                rotate: [1.5, -1.5, 1.5],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.75, ease: "easeOut" },
                scale: { duration: 0.5, delay: 0.75, ease: "easeOut" },
                y: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.4 },
                rotate: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.4 },
              }}
              style={{
                rotateX: coords.rx * 1.5,
                rotateY: coords.ry * 1.5,
                x: coords.ry * -8,
                willChange: "transform",
              }}
              className="absolute -top-6 -left-6 z-10 w-[100px] sm:w-[130px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.4)] p-0.5 hover:border-[#16C7FF]/30 transition-colors duration-300 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#16C7FF]/5 to-transparent pointer-events-none" />
              <Image
                src={heroUIBranding}
                alt="Brand Identity UI moodboard card representation"
                fill
                className="object-contain"
                sizes="130px"
                placeholder="blur"
                loading="lazy"
              />
            </motion.div>

            {/* 4. Floating UI Card (top-right) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [12, 0, -10, 0],
                rotate: [-1, 1, -1],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 0.9, ease: "easeOut" },
                scale: { duration: 0.5, delay: 0.9, ease: "easeOut" },
                y: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
                rotate: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
              }}
              style={{
                rotateX: coords.rx * 1.4,
                rotateY: coords.ry * 1.4,
                x: coords.ry * -6,
                willChange: "transform",
              }}
              className="absolute -top-8 right-12 z-10 w-[90px] sm:w-[110px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.4)] p-0.5 hover:border-[#16C7FF]/30 transition-colors duration-300 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#16C7FF]/5 to-transparent pointer-events-none" />
              <Image
                src={heroUIWebsite}
                alt="Custom Web Design layout card representation"
                fill
                className="object-contain"
                sizes="110px"
                placeholder="blur"
                loading="lazy"
              />
            </motion.div>

            {/* 5. Floating UI Card (bottom-left) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [12, 0, -7, 0],
                rotate: [1.5, -1.5, 1.5],
              }}
              transition={{
                opacity: { duration: 0.5, delay: 1.05, ease: "easeOut" },
                scale: { duration: 0.5, delay: 1.05, ease: "easeOut" },
                y: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
                rotate: { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
              }}
              style={{
                rotateX: coords.rx * 1.6,
                rotateY: coords.ry * 1.6,
                x: coords.ry * -10,
                willChange: "transform",
              }}
              className="absolute -bottom-8 left-4 z-10 w-[90px] sm:w-[110px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.4)] p-0.5 hover:border-[#16C7FF]/30 transition-colors duration-300 pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#16C7FF]/5 to-transparent pointer-events-none" />
              <Image
                src={heroUISocial}
                alt="Social Media creative card representation"
                fill
                className="object-contain"
                sizes="110px"
                placeholder="blur"
                loading="lazy"
              />
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </Section>
  );
}
