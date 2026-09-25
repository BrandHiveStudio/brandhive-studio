"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: ReactNode;
}

const policyNavItems = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Cookie Policy", href: "/cookie-policy" },
  { name: "Refund & Cancellation", href: "/refund-policy" },
];

export default function PolicyLayout({
  title,
  subtitle,
  lastUpdated = "July 2026",
  children,
}: PolicyLayoutProps) {
  const pathname = usePathname();

  return (
    <article className="min-h-screen bg-transparent text-white/80 pt-32 pb-24 md:pt-40 md:pb-32 selection:bg-[#16C7FF]/20 selection:text-[#16C7FF] relative overflow-hidden">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#16C7FF]/[0.035] blur-[140px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-blue-600/[0.025] blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Document Header */}
        <header className="border-b border-white/10 pb-8 sm:pb-10 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16C7FF]/10 border border-[#16C7FF]/25 text-[11px] font-bold tracking-[0.2em] uppercase text-[#16C7FF] mb-4 shadow-[0_0_15px_rgba(22,199,255,0.06)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16C7FF] animate-pulse" />
            BRANDHIVE STUDIO
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-white/70 mt-3 sm:mt-4 leading-relaxed max-w-2xl font-normal">
            {subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-white/50">
            <span className="flex items-center gap-1.5 text-white/70">
              <svg className="w-4 h-4 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last Updated: <strong className="text-white font-semibold">{lastUpdated}</strong>
            </span>
            <span className="text-white/20">•</span>
            <span>Version: July 2026</span>
            <span className="text-white/20">•</span>
            <span>Official Policy</span>
          </div>

          {/* Quick Legal Policy Navigation Pills */}
          <nav className="mt-8 pt-6 border-t border-white/10" aria-label="Legal policies navigation">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {policyNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/40 shadow-[0_0_15px_rgba(22,199,255,0.15)] font-bold"
                        : "bg-white/[0.03] text-white/60 border border-white/10 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Policy Body Content */}
        <section className="legal-prose space-y-10 sm:space-y-12 text-[15px] sm:text-base leading-relaxed text-white/75">
          {children}
        </section>

        {/* Contact and Help Box */}
        <footer className="mt-14 sm:mt-16 pt-10 border-t border-white/10">
          <div className="rounded-2xl sm:rounded-3xl bg-[#11161C]/60 border border-white/10 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Questions Regarding Our Policies?
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-lg leading-relaxed">
                  If you have any questions about our terms, privacy practices, cookies, or project cancellation policies, our team is here to assist you.
                </p>
                <div className="mt-3.5 space-y-1 text-xs text-white/50">
                  <p>
                    <strong className="text-white/80">Address:</strong> Interceed Waththa, Kattuwa, Negombo, Sri Lanka
                  </p>
                  <p>
                    <strong className="text-white/80">Website:</strong>{" "}
                    <a href="https://www.brandhivestudio.com.lk" className="text-[#16C7FF] hover:underline">
                      www.brandhivestudio.com.lk
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <a
                  href="mailto:info@brandhivestudio.com.lk"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#16C7FF]/90 via-[#00c4ff] to-[#0096C7]/90 hover:from-[#60D6FF] hover:to-[#16C7FF] text-[#050608] text-xs font-bold shadow-[0_0_15px_rgba(22,199,255,0.25)] transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 text-[#050608]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@brandhivestudio.com.lk
                </a>

                <a
                  href="tel:+94706410093"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white/90 border border-white/10 text-xs font-semibold transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +94 70 641 0093
                </a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </article>
  );
}
