"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import ParallaxOrb from "@/components/backgrounds/ParallaxOrb";
import { staggerContainer } from "@/lib/animations";

const containerVariants: Variants = staggerContainer(0.15);
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
    },
  },
};

interface CTAProps {
  contentMap?: Record<string, string>;
}

export default function CTA({ contentMap }: CTAProps = {}) {
  return (
    <div id="cta">
      <Section className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-32 bg-transparent">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="w-full relative"
        >
          {/* Glass Card Container */}
          <div className="relative w-full rounded-3xl bg-[#11161C]/55 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            
            {/* Dense blueprint grid inside CTA box */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.25] pointer-events-none" />

            {/* Parallax Glow Accents — only decorative orbs get parallax */}
            <ParallaxOrb depth={0.03} className="absolute -top-32 -left-32 pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] animate-pulse" style={{ animationDuration: "6s" }} />
            </ParallaxOrb>
            <ParallaxOrb depth={0.025} className="absolute -bottom-32 -right-32 pointer-events-none">
              <div className="w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] animate-pulse" style={{ animationDuration: "7s" }} />
            </ParallaxOrb>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#16C7FF]/5 blur-[120px] pointer-events-none" />

            {/* Grid Layout */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16 z-10">
              
              {/* Left Content Area */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
                <motion.div variants={itemVariants}>
                  <Badge
                    variant="secondary"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                  >
                    {contentMap?.["cta_badge"] || "READY TO START?"}
                  </Badge>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                    {contentMap?.["cta_heading"] || "Let's Build Something Extraordinary."}
                  </Heading>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Text className="max-w-2xl text-white/75 text-base sm:text-lg leading-relaxed">
                    {contentMap?.["cta_description"] || "Whether you're launching a new business, refreshing your brand, or creating a premium digital experience, BrandHive Studio is ready to bring your vision to life."}
                  </Text>
                </motion.div>
              </div>

              {/* Right Buttons Area */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-5 sm:gap-6">
                {/* Primary Button — cta-sweep-auto adds periodic light sweep */}
                <motion.div variants={itemVariants} className="shrink-0">
                  <motion.div
                    whileHover={{
                      y: -3,
                      scale: 1.03,
                      boxShadow: "0 0 28px rgba(22, 199, 255, 0.5)",
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  >
                    <Link href="/contact" className="inline-block rounded-full outline-none focus:outline-none">
                      <Button
                        size="lg"
                        className="cta-sweep-auto rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-8 py-6 shadow-[0_0_20px_rgba(22,199,255,0.2)] hover:from-[#60D6FF] hover:to-[#16C7FF] transition-all duration-300 text-center cursor-pointer"
                        aria-label="Start a Project with BrandHive Studio"
                      >
                        {contentMap?.["cta_button_text"] || "Start a Project"}
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Secondary Link */}
                <motion.div variants={itemVariants} className="shrink-0 flex items-center">
                  <Link
                    href="/portfolio"
                    className="group flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-[#16C7FF] transition-colors duration-300 whitespace-nowrap"
                    aria-label="View our portfolio of projects"
                  >
                    View Our Portfolio
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
