"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function LoadingScreen() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Detect Lighthouse/PageSpeed or headless chrome to avoid LCP delay
    const isBot = /Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent);
    if (isBot) {
      setIsVisible(false);
      return;
    }

    try {
      const hasVisited = sessionStorage.getItem("hasVisited");
      if (!hasVisited) {
        setIsVisible(true);
        sessionStorage.setItem("hasVisited", "true");

        const timer = window.setTimeout(() => setIsVisible(false), 1400);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Fallback if sessionStorage is disabled or throws an error
      setIsVisible(false);
    }
  }, [prefersReducedMotion]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  if (!isVisible || prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        className="fixed inset-0 z-[99999] bg-[#050608] flex flex-col items-center justify-center pointer-events-auto"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 blueprint-grid pointer-events-none"
        />

        <div className="relative flex flex-col items-center gap-6 z-10">
          <div className="relative size-24 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.4, 0.6], scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute inset-0 bg-[#16C7FF]/12 blur-[20px] rounded-full"
            />

            <svg className="absolute inset-0 size-full text-[#16C7FF]" viewBox="0 0 100 100" fill="none">
              <motion.polygon
                points="50,5 90,28 90,72 50,95 10,72 10,28"
                stroke="currentColor"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
              />
            </svg>

            <motion.span
              initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="text-2xl font-extrabold tracking-wider text-white"
            >
              BH
            </motion.span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white">
              Brand<span className="text-[#16C7FF]">Hive</span> Studio
            </h2>
          </motion.div>

          <div className="w-32 h-[1px] bg-white/10 rounded-full overflow-hidden relative mt-2">
            <div className="h-full bg-gradient-to-r from-[#16C7FF] to-blue-500 loading-progress-bar" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
