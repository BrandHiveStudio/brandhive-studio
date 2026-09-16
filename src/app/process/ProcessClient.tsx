"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroDivider from "@/components/ui/HeroDivider";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const processStages = [
  {
    step: "01",
    badge: "RESEARCH & COMPASS",
    title: "Discovery & Audits",
    description: "We start by learning about your business. We audit your visual style, study your target audience, identify competitor gaps, and build a strategic blueprint to guide all future steps.",
    image: "/images/process/discovery/process-discovery-workshop.webp",
    bullets: ["Competitor Visual Audits", "Target Audience Profiles", "Strategic Strategy Blueprint", "Project Scope Mapping"],
    isReversed: false,
  },
  {
    step: "02",
    badge: "BLUEPRINTING",
    title: "Strategy & Creative Direction",
    description: "We map out the core visuals and user journey. We choose corporate color palettes, typographies, design structures, moodboards, and build low-fidelity wireframes to finalize the direction.",
    image: "/images/process/strategy/process-brand-strategy.webp",
    bullets: ["Moodboards & Aesthetics", "Bespoke Color Palettes", "User Journey Mapping", "Wireframe Architecture"],
    isReversed: true,
  },
  {
    step: "03",
    badge: "CREATION PHASE",
    title: "Visual Design & Prototyping",
    description: "We design high-fidelity components, custom mockups, packaging structures, and corporate page layouts. We link them into interactive prototypes so you can click and test before coding starts.",
    image: "/images/process/design/process-ui-design-process.webp",
    bullets: ["Corporate Layout Designs", "Packaging & Print Mockups", "Interactive Prototypes", "Design Systems Hand-off"],
    isReversed: false,
  },
  {
    step: "04",
    badge: "ENGINEERING",
    title: "High Performance Web Development",
    description: "We translate approved designs into clean code. We build using modern technologies, optimize assets, create fluid custom transitions, implement responsive sizing, and perform cross-browser tests.",
    image: "/images/process/development/process-development-workflow.webp",
    bullets: ["Semantic Code structures", "Asset Optimizations Pass", "Subtle Custom Animations", "Cross-Browser Quality Checks"],
    isReversed: true,
  },
  {
    step: "05",
    badge: "LAUNCH TIME",
    title: "Deployment & Quality Checks",
    description: "We run final page optimizations. We verify site loading speeds, audit Accessibility configurations, set up SEO tags, establish domain routing, and launch your brand platform safely.",
    image: "/images/process/launch/process-launch-checklist.webp",
    bullets: ["Cross-Device UI Verification", "SEO Metadata Final Checks", "Domain & DNS Routing", "Google Analytics & Tags Setups"],
    isReversed: false,
  },
];

import type { PublicProcessStep } from "@/lib/db/queries/process";

interface ProcessClientProps {
  initialSteps?: PublicProcessStep[];
}

export default function ProcessClient({ initialSteps }: ProcessClientProps) {
  const stages = (initialSteps && initialSteps.length > 0)
    ? initialSteps.map((s, idx) => ({
        step: s.stepNumber,
        badge: s.badge || "WORKFLOW",
        title: s.title,
        description: s.description,
        image: s.imageUrl || "/images/process/discovery/process-discovery-workshop.webp",
        bullets: s.deliverables && s.deliverables.length > 0 ? s.deliverables : [],
        isReversed: idx % 2 === 1,
      }))
    : processStages;

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-16 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#16C7FF]/4 blur-[100px]" />
        <div className="absolute top-[60%] left-[5%] w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[90px]" />
      </div>
      
      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pb-12 lg:pb-20 bg-transparent">
        <Container>
          <div className="flex flex-col gap-6 max-w-4xl">
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              Our Workflow
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              A Proven Workflow for <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Outstanding Results.</span>
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              We eliminate guesswork. Our systematic process takes your project from discovery to deployment, ensuring premium quality and visual precision at every step.
            </Text>
          </div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Process Timeline Blocks */}
      {stages.map((stage, idx) => (
        <Section
          key={idx}
          className="py-16 lg:py-24 border-t border-white/5 bg-transparent"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Text Side — staggered fade+blur reveal */}
              <motion.div
                initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                className={`lg:col-span-6 flex flex-col gap-6 ${stage.isReversed ? "lg:order-2" : ""}`}
              >
                <div className="flex items-center gap-4">
                  {/* Big blue circular step number */}
                  <div className="size-12 rounded-full bg-gradient-to-br from-[#16C7FF] to-[#0096C7] text-[#050608] flex items-center justify-center font-extrabold text-lg shadow-[0_0_15px_rgba(22,199,255,0.25)] border border-white/10">
                    {stage.step}
                  </div>
                  <Badge
                    variant="secondary"
                    className="px-3.5 py-1 text-[10px] font-bold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase"
                  >
                    {stage.badge}
                  </Badge>
                </div>
                
                <Heading level="h2" className="text-3xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  {stage.title}
                </Heading>
                <Text className="text-white/75 text-base sm:text-lg leading-relaxed">
                  {stage.description}
                </Text>
                
                {/* Bullets List */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {stage.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-sm text-white/60 font-medium">
                      <span className="size-1.5 rounded-full bg-[#16C7FF] shadow-[0_0_8px_rgba(22,199,255,0.8)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Image Side — clip-path reveal */}
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.06, opacity: 0 }}
                whileInView={{ clipPath: "inset(0% 0 0 0)", scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1], delay: 0.04 }}
                className={`lg:col-span-6 ${stage.isReversed ? "lg:order-1" : ""}`}
              >
                <div className="image-reveal-container relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-xl bg-neutral-900 hover:border-[#16C7FF]/20 transition-colors duration-500">
                  <Image
                    src={stage.image}
                    alt={`${stage.title} Stage Illustration`}
                    fill
                    className="object-cover opacity-90 transition-all duration-500 hover:opacity-100 hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>

            </div>
          </Container>
        </Section>
      ))}

      {/* 3. CTA Block */}
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
                  COLLABORATE WITH US
                </Badge>
                <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  Ready to Kickstart Stage 01?
                </Heading>
                <Text className="max-w-2xl text-white/70 text-base sm:text-lg leading-relaxed font-normal">
                  Our team is ready to deploy discovery audits and analyze your brand&apos;s product positioning. Contact us today.
                </Text>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-6 w-full">
                <motion.div
                  whileHover={{ y: -3, scale: 1.03, boxShadow: "0 0 25px rgba(22, 199, 255, 0.4)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-full sm:w-auto lg:w-full"
                >
                  <Link href="/contact" className="w-full block">
                    <Button
                      size="lg"
                      className="cta-sweep-auto w-full rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-8 py-6 shadow-md transition-all duration-300 text-center cursor-pointer"
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

    </main>
  );
}
