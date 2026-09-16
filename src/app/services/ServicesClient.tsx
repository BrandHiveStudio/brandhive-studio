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

const serviceSections = [
  {
    badge: "BRAND FOUNDATION",
    title: "Brand Strategy & Identity Systems",
    description: "Create a memorable brand built on strategy, consistency, and visual excellence. From defining your market position to developing complete identity systems, we help businesses establish a professional presence that inspires trust and recognition across every customer touchpoint.",
    image: "/images/services/branding/service-brand-strategy-workshop.webp",
    features: [
      "Brand Positioning",
      "Visual Identity Design",
      "Corporate Logo Systems",
      "Typography Systems",
      "Brand Guidelines"
    ],
    isReversed: false,
  },
  {
    badge: "DIGITAL EXPERIENCES",
    title: "Web Experience & Digital Platforms",
    description: "Design and develop high-performance websites and digital platforms that combine modern aesthetics with exceptional usability. Every solution is responsive, scalable, and engineered to deliver a seamless experience across every device.",
    image: "/images/services/website-design/service-web-experience-digital-platforms.webp",
    features: [
      "Custom Website Design",
      "Corporate Web Portals",
      "Responsive Development",
      "High-Fidelity UI/UX Prototypes"
    ],
    isReversed: true,
  },
  {
    badge: "DIGITAL GROWTH",
    title: "Growth Marketing & Performance",
    description: "Drive measurable business growth through strategic digital marketing. We create high-converting campaigns, optimize customer journeys, and provide performance insights that help brands reach the right audience and maximize return on investment.",
    image: "/images/services/digital-marketing/growth-marketing-performance.webp",
    features: [
      "Paid Advertising Creatives",
      "Conversion Tracking",
      "A/B Campaign Testing",
      "Performance Analytics & Reporting"
    ],
    isReversed: false,
  },
  {
    badge: "ACADEMIC TECHNOLOGY",
    title: "Academic Software Development & Mentoring",
    description: "Support software engineering and technology projects with professional guidance from planning to implementation. We help students and aspiring developers build high-quality software, strengthen technical skills, and deliver polished project outcomes through structured mentoring and development support.",
    image: "/images/services/academic/academic-software-development-mentoring.webp",
    features: [
      "Software Engineering Projects",
      "AI & Machine Learning Solutions",
      "Web & Mobile Application Development",
      "Database Design & Implementation",
      "UI/UX Prototyping",
      "Technical Documentation",
      "Code Review & Debugging",
      "Project Consultation & Mentoring"
    ],
    isReversed: true,
  }
];

interface ServiceItemProp {
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  features: string[];
}

interface ServicesClientProps {
  initialServices?: ServiceItemProp[];
}

export default function ServicesClient({ initialServices }: ServicesClientProps = {}) {
  const displayServices =
    initialServices && initialServices.length > 0
      ? initialServices.map((s, idx) => ({
          badge: s.badge || "OUR EXPERTISE",
          title: s.title,
          description: s.description,
          image: s.imageUrl || "/images/services/branding/service-brand-strategy-workshop.webp",
          features: s.features || [],
          isReversed: idx % 2 === 1,
        }))
      : serviceSections;

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-16 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#16C7FF]/4 blur-[100px]" />
        <div className="absolute top-[60%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-[110px]" />
      </div>
      
      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pb-12 lg:pb-20 bg-transparent">
        <Container>
          <div className="flex flex-col gap-6 max-w-4xl">
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              OUR EXPERTISE
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              Digital Solutions <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Built for Modern Businesses.</span>
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              We design brands, build digital experiences, develop software, and create intelligent solutions that help businesses and professionals grow with confidence.
            </Text>
          </div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Detailed Service Blocks */}
      {displayServices.map((sec, idx) => (
        <Section
          key={idx}
          className="py-16 lg:py-24 border-t border-white/5 bg-transparent"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Text Side — staggered fadeUp reveal */}
              <motion.div
                initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className={`lg:col-span-6 flex flex-col gap-6 ${sec.isReversed ? "lg:order-2" : ""}`}
              >
                <Badge
                  variant="secondary"
                  className="w-fit px-3.5 py-1 text-xs font-bold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase"
                >
                  {sec.badge}
                </Badge>
                <Heading level="h2" className="text-3xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  {sec.title}
                </Heading>
                <Text className="text-white/75 text-base sm:text-lg leading-relaxed">
                  {sec.description}
                </Text>
                
                {/* Deliverables/Features list */}
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {sec.features.map((feat, fIdx) => (
                    <Badge
                      key={fIdx}
                      variant="secondary"
                      className="px-3.5 py-1 text-xs font-semibold bg-[#11161C]/40 border border-white/10 text-white/70"
                    >
                      {feat}
                    </Badge>
                  ))}
                </div>
              </motion.div>

              {/* Image Side — clip-path reveal */}
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.06, opacity: 0 }}
                whileInView={{ clipPath: "inset(0% 0 0 0)", scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1], delay: 0.05 }}
                className={`lg:col-span-6 ${sec.isReversed ? "lg:order-1" : ""}`}
              >
                <div className="image-reveal-container relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-xl bg-neutral-900 hover:border-[#16C7FF]/20 transition-colors duration-500">
                  <Image
                    src={sec.image}
                    alt={`${sec.title} Presentation Mockup`}
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

      {/* 3. CTA conversion block */}
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
                  READY TO ENGAGE?
                </Badge>
                <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  Ready to Build Something Exceptional?
                </Heading>
                <Text className="max-w-2xl text-white/70 text-base sm:text-lg leading-relaxed font-normal">
                  Whether you&apos;re launching a new brand, building a digital platform, growing your business, or developing an innovative software solution, BrandHive Studio is ready to bring your vision to life.
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
