"use client";

import Image from "next/image";
import { motion, Variants, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/cards/Card";
import type { PublicTestimonial } from "@/lib/db/queries/testimonials";

interface FallbackTestimonial {
  client: string;
  company: string;
  role: string;
  review: string;
  logo?: React.ReactNode;
  logoUrl?: string | null;
}

const fallbackLogos: Record<string, React.ReactNode> = {
  "uzee tech": (
    <svg className="w-20 h-6 text-white/80" viewBox="0 0 120 32" fill="currentColor">
      <path d="M10 8h4v12h-4V8zm2 14a1 1 0 110-2 1 1 0 010 2zM20 8h8a4 4 0 010 8h-4v4h-4V8zm4 4h4a1.5 1.5 0 100-3h-4v3zM34 8h10v4H38v3h5v4h-5v5h6v4H34V8zm16 0h10v4H54v3h5v4h-5v5h6v4H50V8zm16 0h10v4H54v3h5v4h-5v5h6v4H50V8z" fill="#16C7FF" />
      <text x="65" y="21" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="1">TECH</text>
    </svg>
  ),
  "leo villas": (
    <svg className="w-20 h-6 text-white/80" viewBox="0 0 120 32" fill="currentColor">
      <path d="M12 6l-8 6h4v14h8V12h4l-8-6z" fill="#16C7FF" />
      <text x="32" y="22" fontFamily="serif" fontSize="13" fontWeight="bold" letterSpacing="0.5">LEO VILLAS</text>
    </svg>
  ),
  "seya beauty studio": (
    <svg className="w-24 h-6 text-white/80" viewBox="0 0 150 32" fill="currentColor">
      <path d="M12 6c-3 3-5 7-5 10s2 7 5 10c3-3 5-7 5-10s-2-7-5-10z" fill="#16C7FF" opacity="0.8" />
      <text x="30" y="21" fontFamily="sans-serif" fontSize="10" fontWeight="normal" letterSpacing="1">SEYA BEAUTY</text>
    </svg>
  ),
};

const defaultTestimonials: FallbackTestimonial[] = [
  {
    client: "Umar Farook",
    company: "UZEE TECH",
    role: "Founder",
    review: "BrandHive Studio completely transformed our brand. Their creativity, professionalism and attention to detail are unmatched.",
    logo: fallbackLogos["uzee tech"],
  },
  {
    client: "Ajay Kumar",
    company: "Leo Villas",
    role: "Owner",
    review: "They understood our vision perfectly and delivered a brand identity that truly represents who we are.",
    logo: fallbackLogos["leo villas"],
  },
  {
    client: "Natasha Silva",
    company: "Seya Beauty Studio",
    role: "Founder",
    review: "Amazing team, great communication and outstanding results. Highly recommended!",
    logo: fallbackLogos["seya beauty studio"],
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

interface TestimonialsProps {
  initialTestimonials?: PublicTestimonial[];
}

export default function Testimonials({ initialTestimonials }: TestimonialsProps) {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const displayList = (initialTestimonials && initialTestimonials.length > 0)
    ? initialTestimonials.map((t) => ({
        id: t.id,
        client: t.client,
        company: t.company,
        role: t.role,
        review: t.review,
        logoUrl: t.logoUrl,
        logo: fallbackLogos[t.company.trim().toLowerCase()] || null,
      }))
    : defaultTestimonials;

  return (
    <div id="testimonials">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 bg-transparent">
        {/* Volumetric Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#16C7FF]/3 blur-[100px]" />
          <div className="absolute bottom-[20%] left-[10%] w-[320px] h-[320px] rounded-full bg-blue-500/3 blur-[100px]" />
        </div>
        
        {/* Header split layout matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
            >
              Testimonials
            </Badge>
            <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
              What Our <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Clients Say</span>
            </Heading>
          </div>
          <div className="lg:col-span-5 text-left lg:text-right">
            <Text className="text-white/60 text-base sm:text-lg leading-relaxed">
              <span className="text-[#16C7FF] font-semibold">Real reviews from</span> real clients who love our work.
            </Text>
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"
        >
          {displayList.map((t, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="h-full"
            >
              <Card className="flex flex-col h-full justify-between p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#16C7FF]/35 hover:shadow-[0_20px_45px_rgba(22,199,255,0.08),0_0_20px_rgba(22,199,255,0.03)] hover:-translate-y-2 transition-all duration-300 ease-out">
                <CardHeader className="p-0 relative">
                  {/* Quote SVG icon */}
                  <div className="text-[#16C7FF]/25 mb-6">
                    <svg className="size-8" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H6c0-2.2 1.8-4 4-4V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14H18c0-2.2 1.8-4 4-4V8z" />
                    </svg>
                  </div>
                  
                  {/* Review Text */}
                  <Text className="text-white/70 text-sm sm:text-base leading-relaxed font-normal">
                    {t.review}
                  </Text>
                </CardHeader>
                
                {/* Client Profile details card footer */}
                <CardContent className="p-0 mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-white leading-none">
                      — {t.client}
                    </p>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mt-1.5">
                      {t.role}, {t.company}
                    </span>
                  </div>
                  <div className="shrink-0 max-w-[80px] flex items-center justify-end">
                    {t.logoUrl ? (
                      <Image
                        src={t.logoUrl}
                        alt={t.company}
                        width={80}
                        height={28}
                        className="object-contain max-h-7 max-w-[80px] brightness-90 opacity-80"
                      />
                    ) : t.logo ? (
                      t.logo
                    ) : (
                      <span className="text-[10px] font-semibold text-white/40 tracking-wider uppercase font-mono">
                        {t.company}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </div>
  );
}
