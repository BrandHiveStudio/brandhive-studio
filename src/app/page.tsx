import dynamic from "next/dynamic";
import Hero from "@/sections/home/Hero";
import TrustedBrands from "@/sections/home/TrustedBrands";
import { getPublishedTestimonials } from "@/lib/db/queries/testimonials";
import { getPublishedProcessSteps } from "@/lib/db/queries/process";
import { getSiteContentMap } from "@/lib/db/queries/content";
import { getPublishedServices } from "@/lib/db/queries/services";
import { getPublishedProjects } from "@/lib/db/queries/projects";

// Code-split heavy below-the-fold sections to boost LCP and TBT
const About = dynamic(() => import("@/sections/home/About"), { ssr: true });
const Services = dynamic(() => import("@/sections/home/Services"), { ssr: true });
const Portfolio = dynamic(() => import("@/sections/home/Portfolio"), { ssr: true });
const Stats = dynamic(() => import("@/sections/home/Stats"), { ssr: true });
const Process = dynamic(() => import("@/sections/home/Process"), { ssr: true });
const Testimonials = dynamic(() => import("@/sections/home/Testimonials"), { ssr: true });
const CTA = dynamic(() => import("@/sections/home/CTA"), { ssr: true });

export default async function Home() {
  const [
    dynamicTestimonials,
    dynamicProcessSteps,
    contentMap,
    dynamicServices,
    dynamicProjects,
  ] = await Promise.all([
    getPublishedTestimonials(),
    getPublishedProcessSteps(),
    getSiteContentMap(),
    getPublishedServices(),
    getPublishedProjects(),
  ]);

  return (
    <>
      <Hero contentMap={contentMap} />
      <TrustedBrands />
      <About contentMap={contentMap} />
      <Services initialServices={dynamicServices} />
      <Portfolio initialProjects={dynamicProjects} />
      <Stats contentMap={contentMap} />
      <Process initialSteps={dynamicProcessSteps} />
      <Testimonials initialTestimonials={dynamicTestimonials} />
      <CTA contentMap={contentMap} />
    </>
  );
}
