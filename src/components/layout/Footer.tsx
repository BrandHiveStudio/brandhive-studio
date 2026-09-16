"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Container from "./Container";
import Text from "@/components/typography/Text";
import Magnetic from "@/components/ui/Magnetic";

const footerLinks = {
  services: [
    { name: "Brand Strategy", href: "/services" },
    { name: "Brand Identity", href: "/services" },
    { name: "Website Design", href: "/services" },
    { name: "UI/UX Design", href: "/services" },
    { name: "Growth Marketing", href: "/services" },
    { name: "Software Development", href: "/services" },
  ],
  company: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Process", href: "/process" },
    { name: "Insights", href: "/insights" },
    { name: "Contact", href: "/contact" },
  ],
};

interface SocialItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  hoverClass: string;
}

const defaultSocials: SocialItem[] = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/brandhivestudiolk",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    ),
    hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/brandhivestudiolk",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@brandhivestudiolk",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.42-.43-.61-.67-.02 1.91-.01 3.83-.02 5.74-.15 2.51-1.37 4.93-3.55 6.25-2.24 1.42-5.18 1.66-7.58.64-2.58-1.01-4.57-3.41-4.91-6.19-.48-3.24 1.16-6.66 4.15-7.98 1.45-.66 3.07-.82 4.63-.51V7.91c-1.1-.38-2.31-.28-3.32.32-1.39.79-2.22 2.37-2.14 3.97.06 1.75.98 3.42 2.5 4.29 1.49.88 3.45.89 4.92-.01 1.25-.74 1.96-2.13 1.93-3.57v-12.9z" />
      </svg>
    ),
    hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/94706410093",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
      </svg>
    ),
    hoverClass: "hover:text-[#25D366] hover:border-[#25D366]/45 hover:shadow-[0_0_15px_rgba(37,211,102,0.3)]",
  },
];

function getSocialDetails(platform: string, label: string, url: string): SocialItem {
  const p = platform.toLowerCase();
  switch (p) {
    case "whatsapp":
      return {
        name: label || "WhatsApp",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
          </svg>
        ),
        hoverClass: "hover:text-[#25D366] hover:border-[#25D366]/45 hover:shadow-[0_0_15px_rgba(37,211,102,0.3)]",
      };
    case "facebook":
      return {
        name: label || "Facebook",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
    case "instagram":
      return {
        name: label || "Instagram",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
    case "tiktok":
      return {
        name: label || "TikTok",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.42-.43-.61-.67-.02 1.91-.01 3.83-.02 5.74-.15 2.51-1.37 4.93-3.55 6.25-2.24 1.42-5.18 1.66-7.58.64-2.58-1.01-4.57-3.41-4.91-6.19-.48-3.24 1.16-6.66 4.15-7.98 1.45-.66 3.07-.82 4.63-.51V7.91c-1.1-.38-2.31-.28-3.32.32-1.39.79-2.22 2.37-2.14 3.97.06 1.75.98 3.42 2.5 4.29 1.49.88 3.45.89 4.92-.01 1.25-.74 1.96-2.13 1.93-3.57v-12.9z" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
    case "linkedin":
      return {
        name: label || "LinkedIn",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
    case "behance":
      return {
        name: label || "Behance",
        href: url,
        icon: (
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.171 3-3.455 0-5.555-2.477-5.555-5.555 0-3.255 2.247-5.445 5.344-5.445 3.528 0 5.156 2.455 4.882 6H16.03c.061 1.322.849 2.148 2.254 2.148.971 0 1.811-.479 2.16-1.148h3.282zm-7.656-4h4.757c-.078-1.148-.75-1.852-2.128-1.852-1.378 0-2.289.704-2.629 1.852zm-12.07-5h5.45c2.441 0 3.95 1.134 3.95 2.955 0 1.258-.696 2.222-1.782 2.645 1.402.438 2.282 1.545 2.282 3.125 0 2.225-1.814 3.275-4.325 3.275h-5.575v-12zm3.225 4.542h1.8c.847 0 1.45-.398 1.45-1.148 0-.75-.603-1.145-1.45-1.145h-1.8v2.293zm0 5.208h2.025c.95 0 1.675-.453 1.675-1.312 0-.86-.725-1.313-1.675-1.313h-2.025v2.625z" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
    default:
      return {
        name: label || platform,
        href: url,
        icon: (
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        ),
        hoverClass: "hover:text-[#16C7FF] hover:border-[#16C7FF]/45 hover:shadow-[0_0_15px_rgba(22,199,255,0.3)]",
      };
  }
}

export default function Footer() {
  const pathname = usePathname();
  const [linksData, setLinksData] = useState<Array<{ platform: string; label: string; url: string }> | null>(null);

  useEffect(() => {
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.links) && data.links.length > 0) {
          setLinksData(data.links);
        }
      })
      .catch((err) => {
        console.warn("Using default static footer links:", err);
      });
  }, []);

  const activeSocials = useMemo(() => {
    if (!linksData) return defaultSocials;
    const filtered = linksData.filter(
      (l) => l.platform !== "phone" && l.platform !== "email"
    );
    if (filtered.length === 0) return defaultSocials;
    return filtered.map((l) => getSocialDetails(l.platform, l.label, l.url));
  }, [linksData]);

  const contactDetails = useMemo(() => {
    const phoneRecord = linksData?.find((l) => l.platform === "phone");
    const emailRecord = linksData?.find((l) => l.platform === "email");
    const whatsappRecord = linksData?.find((l) => l.platform === "whatsapp");

    return {
      phoneUrl: phoneRecord?.url || "tel:+94706410093",
      phoneLabel: phoneRecord?.label && !phoneRecord.label.toLowerCase().includes("phone")
        ? phoneRecord.label
        : (phoneRecord?.url.replace("tel:", "") || "+94 70 641 0093"),
      emailUrl: emailRecord?.url || "mailto:brandhive.studio.lk@gmail.com",
      emailLabel: emailRecord?.label && !emailRecord.label.toLowerCase().includes("email")
        ? emailRecord.label
        : (emailRecord?.url.replace("mailto:", "") || "brandhive.studio.lk@gmail.com"),
      whatsappUrl: whatsappRecord?.url || "https://wa.me/94706410093",
    };
  }, [linksData]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isHomePage = pathname === "/";

  return (
    <>
      {/* Premium Pre-Footer CTA (Only displayed on internal pages to prevent double banners on the homepage) */}
      {!isHomePage && (
        <div className="border-b border-white/5 relative py-12 lg:py-16 bg-transparent z-10 overflow-hidden">
          {/* Background ambient light for transition */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[120px] bg-[#16C7FF]/4.5 blur-[90px] rounded-full pointer-events-none" />

          <Container>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-[950px] mx-auto text-center md:text-left">
              <div className="flex flex-col gap-3 max-w-xl">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {pathname === "/services" ? "Let's Build Something Incredible." : "Ready to Build Something Incredible?"}
                </h3>
                <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal">
                  {pathname === "/services"
                    ? "Partner with BrandHive Studio to create impactful brands, premium digital experiences, and intelligent technology solutions that move ideas forward."
                    : "Let's collaborate to craft a brand identity and website that defines your industry."}
                </p>
              </div>

              <div className="shrink-0 z-10">
                <Link href="/contact" data-cursor-label="BUILD">
                  <Magnetic>
                    <button
                      className="relative overflow-hidden rounded-full text-[#050608] font-bold text-sm px-8 py-4 transition-all duration-300 bg-gradient-to-r from-[#16C7FF]/90 via-[#00c4ff] to-[#0096C7]/90 hover:from-[#60D6FF] hover:to-[#16C7FF] shadow-md shadow-[#16C7FF]/10 hover:shadow-[0_8px_25px_rgba(22,199,255,0.35)] hover:-translate-y-0.5 cursor-pointer"
                      aria-label="Let's Build Something Incredible with BrandHive Studio"
                    >
                      Let&apos;s Build Something Incredible
                    </button>
                  </Magnetic>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Main Footer Block */}
      <footer className="relative overflow-hidden bg-[#050608] border-t border-white/5 text-white/50 pt-4 pb-1 lg:pt-5 lg:pb-1.5">
        {/* Blueprint Grid */}
        <div className="absolute inset-0 blueprint-grid opacity-[0.12] pointer-events-none" />

        <Container className="relative z-10">

          {/* Desktop View (Flex percentages for exact proportions) */}
          <div className="hidden lg:flex flex-row items-start justify-between w-full pb-2">

            {/* Column 1: Brand Column (35%) */}
            <div className="w-[35%] flex flex-col items-start justify-start relative">
              {/* Subtle ambient cyan glow behind the Brand logo */}
              <motion.div
                animate={{
                  opacity: [0.35, 0.75, 0.35],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-[#16C7FF]/4.5 blur-[65px] rounded-full pointer-events-none -z-10"
              />

              <Link
                href="/"
                className="relative flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] rounded-xl transition-all duration-300"
                aria-label="BrandHive Studio Homepage"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(22, 199, 255, 0)",
                      "0 0 16px rgba(22, 199, 255, 0.08)",
                      "0 0 0px rgba(22, 199, 255, 0)",
                    ]
                  }}
                  transition={{
                    duration: 13,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative rounded-xl overflow-hidden pointer-events-none"
                >
                  <Image
                    src="/favicon/brandhive-studio-footer.png"
                    alt="BrandHive Studio Logo"
                    width={200}
                    height={200}
                    className="object-contain rounded-xl"
                    loading="lazy"
                  />

                  {/* Subtle rising pixel particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                    <motion.div
                      animate={{
                        y: [40, -10],
                        x: [50, 45],
                        opacity: [0, 0.35, 0],
                        scale: [0.8, 1, 0.6],
                      }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeOut", delay: 0 }}
                      className="absolute size-1.5 bg-[#16C7FF]/40 rounded-sm left-[20%] bottom-0"
                    />
                    <motion.div
                      animate={{
                        y: [30, -20],
                        x: [80, 85],
                        opacity: [0, 0.25, 0],
                        scale: [0.6, 1.2, 0.5],
                      }}
                      transition={{ duration: 9, repeat: Infinity, ease: "easeOut", delay: 3 }}
                      className="absolute size-1 bg-blue-500/30 rounded-sm left-[65%] bottom-0"
                    />
                    <motion.div
                      animate={{
                        y: [50, -5],
                        x: [35, 40],
                        opacity: [0, 0.3, 0],
                        scale: [0.8, 1, 0.6],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeOut", delay: 5.5 }}
                      className="absolute size-1.5 bg-[#16C7FF]/35 rounded-sm left-[45%] bottom-0"
                    />
                  </div>
                </motion.div>
              </Link>

              <Text className="text-sm font-bold text-white tracking-wide mt-3">
                Building Brands That Get Noticed.
              </Text>

              <Text className="max-w-[280px] text-xs text-neutral-400/85 leading-[1.65] mt-1.5">
                Building premium brands, digital products, and intelligent business solutions that help companies grow with confidence.
              </Text>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-3">
                {activeSocials.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 backdrop-blur-md transition-all duration-250 ease-out hover:-translate-y-0.5 hover:scale-[1.08] ${s.hoverClass}`}
                    aria-label={`Follow BrandHive Studio on ${s.name}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: EXPLORE (18%) */}
            <div className="w-[18%] flex flex-col gap-5 justify-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                EXPLORE
              </span>
              <ul className="flex flex-col gap-3">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/50 hover:text-[#16C7FF] transition-all duration-250 ease-out hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: EXPERTISE (22%) */}
            <div className="w-[22%] flex flex-col gap-5 justify-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                EXPERTISE
              </span>
              <ul className="flex flex-col gap-3">
                {footerLinks.services.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/50 hover:text-[#16C7FF] transition-all duration-250 ease-out hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: GET IN TOUCH (25%) */}
            <div className="w-[25%] flex flex-col gap-5 justify-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                GET IN TOUCH
              </span>
              <ul className="flex flex-col gap-3 text-xs text-white/50">
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Sri Lanka</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={contactDetails.phoneUrl} className="hover:text-[#16C7FF] transition-colors">
                    {contactDetails.phoneLabel}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={contactDetails.emailUrl} className="hover:text-[#16C7FF] transition-colors break-all">
                    {contactDetails.emailLabel}
                  </a>
                </li>
                <li className="pt-0.5">
                  <a
                    href={contactDetails.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/wa flex items-center gap-2"
                  >
                    <svg className="size-3.5 text-[#16C7FF] group-hover/wa:text-[#25D366] shrink-0 fill-current transition-colors duration-300" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
                    </svg>
                    <span className="font-semibold text-white">WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Mobile/Tablet View (Responsive Fallback) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4 lg:hidden">
            {/* Brand */}
            <div className="flex flex-col items-start justify-start relative">
              <motion.div
                animate={{
                  opacity: [0.35, 0.75, 0.35],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-[-30px] left-[-30px] w-48 h-48 bg-[#16C7FF]/4.5 blur-[55px] rounded-full pointer-events-none -z-10"
              />

              <Link
                href="/"
                className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] rounded-md transition-opacity hover:opacity-90"
              >
                <Image
                  src="/favicon/brandhive-studio-footer.png"
                  alt="BrandHive Studio Logo"
                  width={200}
                  height={200}
                  className="object-contain rounded-xl"
                  loading="lazy"
                />
              </Link>
              <Text className="text-sm font-bold text-white tracking-wide mt-3">
                Building Brands That Get Noticed.
              </Text>
              <Text className="text-xs text-neutral-400/85 leading-[1.65] mt-1.5 max-w-sm">
                Building premium brands, digital products, and intelligent business solutions that help companies grow with confidence.
              </Text>
              <div className="flex items-center gap-4 mt-3">
                {activeSocials.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/60 transition-all duration-250 hover:-translate-y-0.5 hover:scale-105 ${s.hoverClass}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* EXPLORE */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                EXPLORE
              </span>
              <ul className="grid grid-cols-2 gap-2">
                {footerLinks.company.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/50 hover:text-[#16C7FF] transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXPERTISE */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                EXPERTISE
              </span>
              <ul className="grid grid-cols-2 gap-2">
                {footerLinks.services.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/50 hover:text-[#16C7FF] transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* GET IN TOUCH */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                GET IN TOUCH
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-white/50">
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Sri Lanka</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={contactDetails.phoneUrl} className="hover:text-[#16C7FF] transition-colors">
                    {contactDetails.phoneLabel}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="size-3.5 text-[#16C7FF] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={contactDetails.emailUrl} className="hover:text-[#16C7FF] transition-colors break-all">
                    {contactDetails.emailLabel}
                  </a>
                </li>
                <li className="pt-0.5">
                  <a
                    href={contactDetails.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/wa flex items-center gap-2"
                  >
                    <svg className="size-3.5 text-[#16C7FF] group-hover/wa:text-[#25D366] shrink-0 fill-current transition-colors duration-300" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
                    </svg>
                    <span className="font-semibold text-white">WhatsApp</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Refined Divider with Central Glow */}
          <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mb-1.5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[6px] bg-[#16C7FF]/20 blur-[4px] rounded-full pointer-events-none" />
          </div>

          {/* Bottom copyright details */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 pb-0">
            <p>&copy; 2026 BrandHive Studio. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with precision &amp; passion.
            </p>
          </div>
        </Container>
      </footer>
    </>
  );
}
