"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Process", href: "/process" },
  { name: "Insights", href: "/insights" },
  { name: "Contact", href: "/contact" },
];

import Magnetic from "@/components/ui/Magnetic";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const mobileNavContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const mobileNavItemVariants = {
    hidden: { x: 25, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 16 } },
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Outer Floating Wrapper */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
        
        {/* Floating Header */}
        <motion.header
          initial={{ y: -20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative w-full max-w-[1400px] mt-[16px] h-[76px] rounded-full flex items-center justify-between px-6 sm:px-8 transition-all duration-500 ease-out border border-white/[0.08] border-t-white/[0.12] bg-gradient-to-b from-white/[0.02] to-black/40 shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(22,199,255,0.02)] backdrop-blur-[16px] pointer-events-auto hover:shadow-[0_15px_40px_rgba(0,0,0,0.55),0_0_25px_rgba(22,199,255,0.04)] hover:border-white/[0.12]",
            isScrolled && "h-[64px] mt-[8px] bg-black/65 border-white/[0.12] border-t-white/[0.18] shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_30px_rgba(22,199,255,0.05)] backdrop-blur-[20px] hover:shadow-[0_15px_45px_rgba(0,0,0,0.75),0_0_35px_rgba(22,199,255,0.08)]"
          )}
        >
          {/* Faint cyan reflection sweep overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#16C7FF]/[0.015] to-transparent pointer-events-none" />

          {/* Logo Brand Block */}
          <Link
            href="/"
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12BDF7] rounded-full shrink-0 z-10 group/logo"
            aria-label="BrandHive Studio Home"
          >
            <div className="flex items-center gap-1.5 min-w-[240px] sm:min-w-[250px] transition-all duration-300 ease-out group-hover/logo:scale-103 group-hover/logo:drop-shadow-[0_0_15px_rgba(22,199,255,0.35)]">
              <div className="relative shrink-0 transition-transform duration-300">
                <Image
                  src="/favicon/brandhive-studio-navbar.png"
                  alt="BrandHive Studio Logo"
                  width={72}
                  height={72}
                  priority
                  className={cn(
                    "object-contain transition-all duration-500 group-hover/logo:brightness-110",
                    isScrolled ? "scale-90" : "scale-100"
                  )}
                />
                {/* Subtle digital pixel shimmer backing */}
                <span className="absolute inset-0 bg-[#16C7FF]/10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 rounded-full blur-[8px] pointer-events-none -z-10" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F5F7FA] leading-none whitespace-nowrap group-hover/logo:text-white transition-colors duration-300">
                Brand<span className="text-[#00B2FE] group-hover/logo:text-[#16C7FF] transition-colors duration-300">Hive</span> Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7.5 z-10" aria-label="Desktop navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href.startsWith("/#") && pathname === "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative text-sm font-medium transition-all duration-300 hover:text-white hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF] rounded-md px-2.5 py-1",
                    isActive ? "text-[#16C7FF] font-semibold drop-shadow-[0_0_8px_rgba(22,199,255,0.45)]" : "text-white/70"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                  
                  {/* Subtle background glow on hover */}
                  <span className="absolute inset-0 -z-10 rounded-lg bg-[#16C7FF]/4 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none blur-[1px]" />
                  
                  {/* Hover indicator line */}
                  <span className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-[#16C7FF]/70 rounded-full opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300" />
                  
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1.5 left-1 right-1 h-[2px] bg-[#16C7FF] shadow-[0_0_12px_rgba(22,199,255,1),0_0_6px_rgba(22,199,255,0.6)] rounded-full"
                      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block shrink-0 z-10">
            <Magnetic>
              <Link
                href="/contact"
                data-cursor-label="BUILD"
                className="relative inline-flex items-center justify-center overflow-hidden rounded-full text-[#050608] font-bold text-sm px-7 py-3 transition-all duration-300 bg-gradient-to-r from-[#16C7FF]/90 via-[#00c4ff] to-[#0096C7]/90 hover:from-[#60D6FF] hover:to-[#16C7FF] shadow-md shadow-[#16C7FF]/10 hover:shadow-[0_8px_25px_rgba(22,199,255,0.35)] hover:-translate-y-0.5 cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                aria-label="Start a Project with BrandHive Studio"
              >
                Start a Project
              </Link>
            </Magnetic>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden flex items-center justify-center p-2.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md shadow-sm text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF] z-10"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </motion.header>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-in glass panel drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[320px] bg-[#0C1117]/85 backdrop-blur-xl border-l border-white/10 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="flex flex-col gap-8">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xl font-bold tracking-tight text-[#F5F7FA]">
                    Navigation
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-neutral-100/50 dark:hover:bg-neutral-950/50 transition-colors text-neutral-800 dark:text-white"
                    aria-label="Close menu"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Mobile Links with Staggered Entrance */}
                <motion.nav
                  variants={mobileNavContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-3"
                  aria-label="Mobile navigation"
                >
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href.startsWith("/#") && pathname === "/");
                    return (
                      <motion.div key={item.href} variants={mobileNavItemVariants}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-base font-semibold py-2.5 px-3 rounded-xl transition-all duration-200 border border-transparent block w-full",
                            isActive
                              ? "text-[#16C7FF] bg-[#16C7FF]/10 border-white/5"
                              : "text-white/70 hover:bg-white/5"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>

              {/* Mobile CTA */}
              <div className="pt-6 border-t border-white/10">
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 rounded-full text-[#050608] font-bold text-center bg-gradient-to-r from-[#16C7FF] to-[#0096C7] shadow-[0_0_15px_rgba(22,199,255,0.25)] transition-all active:scale-[0.98] cursor-pointer outline-none focus:outline-none focus-visible:outline-none select-none"
                  aria-label="Start a Project with BrandHive Studio"
                >
                  Start a Project
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
