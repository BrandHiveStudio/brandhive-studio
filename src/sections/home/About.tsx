"use client";

import { useState } from "react";
import Image from "next/image";
import aboutWorkspaceImg from "../../../public/images/about/studio/about-modern-agency-workspace.webp";
import creativeTeamImg from "../../../public/images/about/collaboration/about-creative-team-meeting.webp";
import uiuxProcessImg from "../../../public/images/about/process/about-uiux-design-process.webp";
import brandStrategyImg from "../../../public/images/about/branding/about-brand-strategy-workspace.webp";
import inspirationBoardImg from "../../../public/images/about/lifestyle/about-creative-inspiration-board.webp";
import { motion, Variants } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import Counter from "@/components/ui/Counter";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 20,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      delay: 0.25,
    },
  },
};

const floatAnimation = (yOffset = 6, duration = 5, delay = 0) => ({
  animate: {
    y: [0, -yOffset, 0],
  },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  },
  style: {
    willChange: "transform",
  },
});

interface AboutProps {
  contentMap?: Record<string, string>;
}

export default function About({ contentMap }: AboutProps = {}) {
  const [coords, setCoords] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setCoords({ rx: -y * 6, ry: x * 6 });
  };

  const handleMouseLeave = () => {
    setCoords({ rx: 0, ry: 0 });
  };

  return (
    <div id="about">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-28 bg-transparent">
        {/* About Section Ambient Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#16C7FF]/4 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[90px]" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid items-center gap-16 lg:grid-cols-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Left Column - Dynamic Workspace cluster */}
          <motion.div
            variants={imageVariants}
            className="lg:col-span-6 flex items-center justify-center relative py-12 lg:py-0"
          >
            {/* Main Workspace Frame with 3D tilt */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg)`,
                transition: "transform 0.18s ease-out"
              }}
              className="relative w-full max-w-[380px] aspect-[4/3] rounded-3xl border border-white/10 bg-[#11161C]/40 p-3 shadow-2xl backdrop-blur-md"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={aboutWorkspaceImg}
                  alt="BrandHive Workspace"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 380px, 340px"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>

              {/* Team Overlay (bottom-right) */}
              <motion.div
                {...floatAnimation(8, 4.2, 0.1)}
                className="absolute -bottom-8 -right-8 z-10 w-[110px] sm:w-[130px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <div className="relative w-full h-full">
                  <Image
                     src={creativeTeamImg}
                     alt="Our Creative Team"
                     fill
                     className="object-cover animate-pulse"
                     style={{ animationDuration: "12s" }}
                     sizes="130px"
                     placeholder="blur"
                     loading="lazy"
                   />
                </div>
              </motion.div>

              {/* Process Card (top-left) */}
              <motion.div
                {...floatAnimation(6, 3.8, 0.3)}
                className="absolute -top-8 -left-8 z-10 w-[90px] sm:w-[110px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <div className="relative w-full h-full">
                  <Image
                     src={uiuxProcessImg}
                     alt="Creative Process"
                     fill
                     className="object-cover"
                     sizes="110px"
                     placeholder="blur"
                     loading="lazy"
                   />
                </div>
              </motion.div>

              {/* Brand Strategy Card (bottom-left) */}
              <motion.div
                {...floatAnimation(10, 4.8, 0.5)}
                className="absolute -bottom-10 -left-6 z-10 w-[100px] sm:w-[120px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <div className="relative w-full h-full">
                  <Image
                     src={brandStrategyImg}
                     alt="Brand Strategy Session"
                     fill
                     className="object-cover"
                     sizes="120px"
                     placeholder="blur"
                     loading="lazy"
                   />
                </div>
              </motion.div>

              {/* Design Thinking Card (top-right) */}
              <motion.div
                {...floatAnimation(7, 4.5, 0.7)}
                className="absolute -top-10 -right-6 z-10 w-[100px] sm:w-[120px] aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#11161C]/60 shadow-[0_10px_20px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                <div className="relative w-full h-full">
                  <Image
                     src={inspirationBoardImg}
                     alt="Design Thinking moodboard"
                     fill
                     className="object-cover"
                     sizes="120px"
                     placeholder="blur"
                     loading="lazy"
                   />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <div className="lg:col-span-6 flex flex-col items-start text-left gap-6 z-10">
            <motion.div variants={fadeUpVariants}>
              <Badge
                variant="secondary"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
              >
                {contentMap?.["about_badge"] || "Who We Are"}
              </Badge>
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
                {contentMap?.["about_heading"] || "Crafting Brands that Connect & Inspire"}
              </Heading>
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <Text className="text-base text-white/70 leading-relaxed">
                {contentMap?.["about_story_lead"] || "At BrandHive Studio, we blend design strategy, technology, and artistic thinking to build outstanding brands and digital platforms. We partner with ambitious organizations to transform ideas into premium digital assets."}
              </Text>
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <Text className="text-base text-white/70 leading-relaxed">
                {contentMap?.["about_mission"] || "Our workspace fosters collaboration, creative research, and iterative design thinking. By bringing team strategists and developers together, we deliver clean, optimized codebases that execute high-fidelity, responsive layouts seamlessly."}
              </Text>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={fadeUpVariants}
              className="grid grid-cols-3 gap-6 w-full pt-6 border-t border-white/10 mt-2"
            >
              <div>
                <p className="text-3xl font-extrabold text-[#16C7FF]">
                  <Counter value={2} />+
                </p>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mt-1">
                  Years of Experience
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#16C7FF]">
                  <Counter value={25} />+
                </p>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mt-1">
                  Clients Served
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#16C7FF]">
                  <Counter value={100} />%
                </p>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mt-1">
                  Satisfaction
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
