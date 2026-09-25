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
    <article className="min-h-screen bg-[#F8FAFC] text-[#334155] pt-32 pb-24 md:pt-40 md:pb-32 selection:bg-[#12BDF7]/20 selection:text-[#0F172A]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Document Header */}
        <header className="border-b border-slate-200/90 pb-8 sm:pb-10 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12BDF7]/10 border border-[#12BDF7]/25 text-[11px] font-bold tracking-[0.2em] uppercase text-[#0284C7] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12BDF7]" />
            BRANDHIVE STUDIO
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
            {title}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] mt-3 sm:mt-4 leading-relaxed max-w-2xl font-normal">
            {subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#12BDF7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last Updated: <strong className="text-[#0F172A] font-semibold">{lastUpdated}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>Version: July 2026</span>
            <span className="text-slate-300">•</span>
            <span>Official Policy</span>
          </div>

          {/* Quick Legal Policy Navigation Pills */}
          <nav className="mt-8 pt-6 border-t border-slate-200/80" aria-label="Legal policies navigation">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {policyNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-[#0F172A] text-white shadow-sm ring-1 ring-[#0F172A]"
                        : "bg-white text-[#475569] border border-slate-200 hover:text-[#0F172A] hover:border-slate-300 hover:bg-slate-50"
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
        <section className="legal-prose space-y-10 sm:space-y-12 text-[15px] sm:text-base leading-relaxed text-[#334155]">
          {children}
        </section>

        {/* Contact and Help Box */}
        <footer className="mt-14 sm:mt-16 pt-10 border-t border-slate-200/90">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Questions Regarding Our Policies?
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-lg leading-relaxed">
                  If you have any questions about our terms, privacy practices, cookies, or project cancellation policies, our team is here to assist you.
                </p>
                <div className="mt-3.5 space-y-1 text-xs text-[#475569]">
                  <p>
                    <strong className="text-[#0F172A]">Address:</strong> Interceed Waththa, Kattuwa, Negombo, Sri Lanka
                  </p>
                  <p>
                    <strong className="text-[#0F172A]">Website:</strong>{" "}
                    <a href="https://www.brandhivestudio.com.lk" className="text-[#0284C7] hover:underline">
                      www.brandhivestudio.com.lk
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                <a
                  href="mailto:info@brandhivestudio.com.lk"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-sm transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5 text-[#12BDF7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@brandhivestudio.com.lk
                </a>

                <a
                  href="tel:+94706410093"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-colors duration-200"
                >
                  <svg className="w-3.5 h-3.5 text-[#12BDF7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
