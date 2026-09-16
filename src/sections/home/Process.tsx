"use client";

import { useRef } from "react";
import { motion, Variants, useScroll, useSpring } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";

const steps = [
  {
    step: "01",
    title: "Discover",
    description: "We learn about your business, audience, and goals.",
    icon: (
      <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Strategy",
    description: "We create a solid plan and creative direction.",
    icon: (
      <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Design",
    description: "We craft stunning designs that communicate.",
    icon: (
      <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Develop",
    description: "We build, refine and perfect every detail.",
    icon: (
      <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Launch",
    description: "We launch your brand and help you grow.",
    icon: (
      <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 18,
    },
  },
};

import type { PublicProcessStep } from "@/lib/db/queries/process";

function getStepIconNode(iconName: string, fallbackIdx: number) {
  switch (iconName?.toLowerCase()) {
    case "strategy":
      return (
        <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case "design":
      return (
        <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      );
    case "code":
      return (
        <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case "launch":
      return (
        <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "search":
    default:
      if (steps[fallbackIdx]?.icon) return steps[fallbackIdx].icon;
      return (
        <svg className="size-5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
  }
}

interface ProcessProps {
  initialSteps?: PublicProcessStep[];
}

export default function Process({ initialSteps }: ProcessProps) {
  const renderedSteps = (initialSteps && initialSteps.length > 0)
    ? initialSteps.map((s, idx) => ({
        step: s.stepNumber,
        title: s.shortTitle || s.title,
        description: s.shortDescription || s.description.slice(0, 70),
        icon: getStepIconNode(s.icon, idx),
      }))
    : steps;

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "center center"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <div id="process">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 bg-transparent">
        {/* Volumetric Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[25%] w-[320px] h-[320px] rounded-full bg-[#16C7FF]/3 blur-[100px]" />
        </div>

        {/* Header split section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
            >
              Our Process
            </Badge>
            <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
              Our <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Creative Process</span>
            </Heading>
          </div>
          <div className="lg:col-span-5">
            <Text className="text-white/60 text-base sm:text-lg leading-relaxed">
              A simple and proven process that ensures we deliver exceptional results every single time.
            </Text>
          </div>
        </div>

        {/* Process nodes and connecting lines */}
        <div ref={targetRef} className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Horizontal Line connecting nodes (Desktop only) */}
          <motion.div
            style={{ scaleX, originX: 0 }}
            className="hidden lg:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#16C7FF] to-blue-500 -z-10 shadow-[0_0_8px_rgba(22,199,255,0.4)]"
          />
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 sm:gap-8 relative z-10"
          >
            {renderedSteps.map((step) => (
              <motion.div
                key={step.step}
                variants={cardVariants}
                className="flex flex-col items-center text-center gap-4 group"
              >
                {/* Circular Node with shadow, border, and icons */}
                <div className="relative size-12 rounded-full bg-[#11161C]/80 border border-white/10 flex items-center justify-center shadow-sm backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-[#16C7FF]/40 group-hover:shadow-[0_0_20px_rgba(22,199,255,0.25)] shrink-0">
                  {step.icon}
                  {/* Step index badge */}
                  <span className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-[#0C1117] text-white/90 border border-white/10 text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {step.step}
                  </span>
                </div>

                {/* Text details */}
                <div className="flex flex-col gap-2 max-w-[200px]">
                  <Heading level="h3" className="text-lg font-bold text-white border-none pb-0 leading-tight">
                    {step.title}
                  </Heading>
                  <Text className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                    {step.description}
                  </Text>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
