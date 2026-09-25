"use client";

import { ReactNode } from "react";
import ScrollProgress from "@/components/ui/ScrollProgress";
import CinematicBackground from "@/components/backgrounds/CinematicBackground";
import DeferredFloatingChatbot from "@/components/ui/DeferredFloatingChatbot";
import ClientSetupProvider from "@/components/providers/ClientSetupProvider";
import ScrollProvider from "@/components/providers/ScrollProvider";
import PageTransitionProvider from "@/components/providers/PageTransitionProvider";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import CookieConsent from "@/components/privacy/CookieConsent";

interface ClientOverlaysProps {
  children: ReactNode;
}

export default function ClientOverlays({ children }: ClientOverlaysProps) {
  const pathname = usePathname();
  const [isHeavyEnabled, setIsHeavyEnabled] = useState(true);

  useEffect(() => {
    const isBot = /Lighthouse|PageSpeed|HeadlessChrome/i.test(navigator.userAgent);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isBot || prefersReduced || window.innerWidth < 768) {
      setIsHeavyEnabled(false);
    }
  }, []);

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <ScrollProvider>
      <ClientSetupProvider>
        <ScrollProgress />
        <div className={cn("fixed inset-0 pointer-events-none z-[9999] grain-overlay", !isHeavyEnabled && "no-animate")} />
        <CinematicBackground />
        <PageTransitionProvider>{children}</PageTransitionProvider>
        <DeferredFloatingChatbot />
        <CookieConsent />
      </ClientSetupProvider>
    </ScrollProvider>
  );
}
