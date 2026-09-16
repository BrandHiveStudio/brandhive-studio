"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion, Variants, useReducedMotion } from "framer-motion";
import type { PublicService } from "@/lib/db/queries/services";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/cards/Card";

const services = [
  {
    title: "Brand Strategy",
    description: "Build strong business foundations through positioning, audience research, messaging, and long-term brand planning.",
    tags: ["Positioning", "Research", "Strategy"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11a13.917 13.917 0 00-2.333-7.352M3 13a9 9 0 0115 0H3z" />
      </svg>
    ),
  },
  {
    title: "Brand Identity",
    description: "Create memorable visual identities including logos, typography, color systems, and comprehensive brand guidelines.",
    tags: ["Logo Systems", "Visual Identity", "Guidelines"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    title: "Website Design & Development",
    description: "Design and develop premium, responsive websites focused on performance, usability, SEO, and conversion.",
    tags: ["Next.js", "Responsive", "Performance"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "UI / UX Design",
    description: "Design intuitive digital experiences with user-centered interfaces, wireframes, prototypes, and scalable design systems.",
    tags: ["UX Research", "Wireframes", "Prototyping"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Growth Marketing",
    description: "Accelerate business growth through SEO, paid advertising, analytics, conversion optimization, and digital strategy.",
    tags: ["SEO", "Paid Ads", "Analytics"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    title: "Software Development",
    description: "Develop custom web applications, business systems, automation platforms, and intelligent digital solutions.",
    tags: ["Web Apps", "Automation", "Business Systems"],
    icon: (
      <svg className="size-6 text-[#16C7FF] transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

interface ServicesProps {
  initialServices?: PublicService[];
}

export default function Services({ initialServices }: ServicesProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  const displayedServices = useMemo(() => {
    if (initialServices && initialServices.length > 0) {
      return initialServices.slice(0, 6).map((s, idx) => {
        const matched = services.find(
          (staticS) =>
            staticS.title.toLowerCase() === s.title.toLowerCase() ||
            staticS.title.toLowerCase().includes(s.title.toLowerCase())
        );
        return {
          title: s.title,
          description: s.shortDescription || s.description,
          tags: s.tags && s.tags.length > 0 ? s.tags : matched?.tags || ["Strategy", "Design"],
          icon: matched?.icon || services[idx % services.length].icon,
        };
      });
    }
    return services;
  }, [initialServices]);

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

  return (
    <div id="services">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-28 bg-transparent">
        {/* Volumetric Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#16C7FF]/3 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[5%] w-[350px] h-[350px] rounded-full bg-blue-500/3 blur-[110px]" />
        </div>

        {/* Header Block split style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
            >
              What We Do
            </Badge>
            <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
              Creative Solutions <br />
              That <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Drive Growth</span>
            </Heading>
          </div>
          <div className="lg:col-span-5">
            <Text className="text-white/60 text-base sm:text-lg leading-relaxed">
              We offer end-to-end creative and digital solutions designed to elevate your brand and grow your business.
            </Text>
          </div>
        </div>

        {/* Services Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          {displayedServices.map((service, index) => (
            <motion.div key={index} variants={cardVariants} style={{ willChange: "transform, opacity" }} className="h-full">
              <Link href="/services" className="group block h-full focus-visible:outline-none" data-cursor-label="DISCOVER">
                  <Card className="reflection-sweep breathing-card relative flex flex-col h-full p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#11161C]/55 hover:bg-[#161f28]/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#16C7FF]/35 hover:shadow-[0_20px_45px_rgba(22,199,255,0.1),0_0_25px_rgba(22,199,255,0.03)] hover:-translate-y-2 transition-all duration-350 ease-out">
                    
                    {/* Subtle Honeycomb Backing */}
                    <div className="absolute top-4 right-4 size-16 text-[#16C7FF]/4 pointer-events-none select-none z-0">
                      <svg className="size-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" />
                      </svg>
                    </div>

                    {/* Icon Block */}
                    <CardHeader className="p-0 flex flex-col gap-5 items-start">
                      <div className="flex items-center justify-between w-full z-10">
                        <div className="size-12 rounded-2xl bg-[#16C7FF]/10 flex items-center justify-center transition-all duration-350 ease-out group-hover:scale-110 group-hover:rotate-[8deg] group-hover:bg-[#16C7FF]/20 group-hover:shadow-[0_0_15px_rgba(22,199,255,0.25)]">
                          {service.icon}
                        </div>
                        <span className="text-[8px] font-mono text-white/25 group-hover:text-[#16C7FF]/40 transition-colors duration-300">
                          [EXP_GRID_0{index + 1}]
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#16C7FF]">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                  
                  {/* Description Block */}
                  <CardContent className="p-0 mt-4 flex-grow flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4">
                      <CardDescription className="text-sm text-white/60 leading-relaxed font-normal">
                        {service.description}
                      </CardDescription>

                      {/* Service tags that fade and shift upward on hover */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {service.tags.map((tag, tIdx) => (
                          <Badge
                            key={tIdx}
                            variant="secondary"
                            className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 border border-white/5 text-white/40 transition-all duration-300 group-hover:text-white/80 group-hover:border-[#16C7FF]/20 group-hover:-translate-y-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Learn More link CTA */}
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#16C7FF] group-hover:text-[#60D6FF] transition-all duration-300 mt-2">
                      Learn more
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">
                        &rarr;
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </div>
  );
}
