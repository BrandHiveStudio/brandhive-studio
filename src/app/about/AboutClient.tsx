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
import { Card } from "@/components/cards/Card";

export default function AboutClient() {
  return (
    <main className="min-h-screen bg-transparent pt-32 pb-16 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#16C7FF]/4 blur-[120px]" />
        <div className="absolute bottom-[30%] left-[5%] w-[350px] h-[350px] rounded-full bg-blue-500/3 blur-[100px]" />
      </div>
      
      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pb-12 lg:pb-20 bg-transparent">
        <Container>
          <div className="flex flex-col gap-6 max-w-4xl">
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              Who We Are
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              Crafting Brands That <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">Inspire & Deliver.</span>
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              BrandHive Studio is a premium creative design and digital agency. We specialize in building robust visual identities, bespoke web interfaces, and growth strategies that help modern businesses scale.
            </Text>
          </div>
          
          {/* Large Hero Image */}
          <div className="relative w-full aspect-[21/9] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 mt-12 lg:mt-16">
            <Image
              src="/images/about/studio/about-creative-office-interior.webp"
              alt="BrandHive Studio Creative Office Interior"
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/40 to-transparent pointer-events-none" />
          </div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Our Story Section */}
      <Section className="py-16 lg:py-24 border-t border-white/5 bg-transparent">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Story Text */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <Badge
                variant="secondary"
                className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
              >
                Our Journey
              </Badge>
              <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                Designed to Scale with Strategic Precision
              </Heading>
              <Text className="text-white/75 text-base sm:text-lg leading-relaxed">
                BrandHive Studio was founded to bridge the gap between creative visual artistry and technical performance. We believe that a brand should not only look exceptionally premium but should also function flawlessly on every screen.
              </Text>
              <Text className="text-white/75 text-base sm:text-lg leading-relaxed">
                Our team brings together award-winning designers, product managers, and developers who work collaboratively with forward-thinking businesses around the globe to establish their unique footprints.
              </Text>
            </div>

            {/* Story Photo */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/10 shadow-xl bg-neutral-900">
                <Image
                  src="/images/about/collaboration/about-designers-at-work.webp"
                  alt="BrandHive designers working collaboratively on brand assets"
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* 3. Mission & Vision */}
      <Section className="py-16 lg:py-24 border-t border-white/5 bg-transparent">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Mission Card */}
            <Card className="p-8 sm:p-10 rounded-[2rem] border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-lg hover:border-[#16C7FF]/20 hover:shadow-[0_0_20px_rgba(22,199,255,0.05)] transition-all duration-300">
              <div className="size-12 rounded-2xl bg-[#16C7FF]/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(22,199,255,0.15)]">
                <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <Heading level="h3" className="text-2xl font-bold text-white border-none pb-0 mb-4 leading-tight">
                Our Mission
              </Heading>
              <Text className="text-white/60 leading-relaxed font-normal">
                To elevate how businesses connect with their audiences by delivering premium brand identities, intuitive user experiences, and fast modern web products engineered for maximum growth.
              </Text>
            </Card>

            {/* Vision Card */}
            <Card className="p-8 sm:p-10 rounded-[2rem] border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-lg hover:border-[#16C7FF]/20 hover:shadow-[0_0_20px_rgba(22,199,255,0.05)] transition-all duration-300">
              <div className="size-12 rounded-2xl bg-[#16C7FF]/10 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(22,199,255,0.15)]">
                <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <Heading level="h3" className="text-2xl font-bold text-white border-none pb-0 mb-4 leading-tight">
                Our Vision
              </Heading>
              <Text className="text-white/60 leading-relaxed font-normal">
                To become the premier creative partner for industry leaders, recognized globally for setting new standards in digital aesthetics, structural accessibility, and strategic brand execution.
              </Text>
            </Card>

          </div>
        </Container>
      </Section>

      {/* 4. Workspace Gallery */}
      <Section className="py-16 lg:py-24 border-t border-white/5 bg-transparent">
        <Container>
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
            >
              Creative Studio
            </Badge>
            <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
              Where Creative Energy Flows
            </Heading>
            <Text className="max-w-2xl text-white/60 text-base leading-relaxed font-normal">
              Take a look inside our workspace and materials board where premium ideas are mapped, illustrated, and brought to life.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { src: "/images/about/studio/about-design-desk-flat-lay.webp", alt: "Workspace flat lay tools" },
              { src: "/images/about/studio/about-modern-agency-workspace.webp", alt: "Creative agency studio workstation" },
              { src: "/images/about/studio/about-premium-creative-studio.webp", alt: "Premium workspace materials" }
            ].map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-md bg-neutral-900 cursor-pointer"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. Discussion CTA */}
      <Section className="py-12 pb-20 bg-transparent border-t border-white/5">
        <Container>
          <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#11161C]/55 backdrop-blur-md p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 blueprint-grid opacity-[0.25] pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none" />
            
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16 z-10">
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
                <Badge
                  variant="secondary"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                >
                  START THE TRANSFORMATION
                </Badge>
                <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0 leading-tight">
                  Ready to Build Something Incredible?
                </Heading>
                <Text className="max-w-2xl text-white/70 text-base sm:text-lg leading-relaxed font-normal">
                  Our team is ready to map out your digital journey. Reach out today and let&apos;s talk about your next project.
                </Text>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-5 sm:gap-6 w-full">
                <motion.div
                  whileHover={{ y: -3, scale: 1.03, boxShadow: "0 0 25px rgba(22, 199, 255, 0.4)" }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="shrink-0"
                >
                  <Link href="/contact" className="inline-block rounded-full outline-none focus:outline-none">
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-8 py-6 shadow-md transition-all duration-300 text-center cursor-pointer"
                    >
                      Start a Project
                    </Button>
                  </Link>
                </motion.div>
                
                <Link
                  href="/contact"
                  className="text-sm font-semibold text-white hover:text-[#16C7FF] transition-colors duration-300 whitespace-nowrap"
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
