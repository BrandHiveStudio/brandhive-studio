"use client";

import Link from "next/link";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center relative overflow-hidden pt-32 pb-20">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#16C7FF]/5 blur-[120px]" />
      </div>

      <Container className="flex flex-col items-center text-center max-w-xl">
        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#11161C]/60 border border-[#16C7FF]/20 text-[#16C7FF] mb-6 backdrop-blur-md">
          404 Error
        </span>

        <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight border-none pb-0 mb-4">
          Page Not Found
        </Heading>

        <Text className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
          The page or project you are looking for doesn&apos;t exist, is unpublished, or has been relocated.
        </Text>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-full bg-[#16C7FF] hover:bg-[#16C7FF]/90 text-black font-semibold px-8 py-3.5 text-sm shadow-lg shadow-[#16C7FF]/20 transition-all active:scale-95"
          >
            Explore Portfolio
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 hover:border-white/20 bg-[#11161C]/80 hover:bg-[#11161C] text-white font-medium px-8 py-3.5 text-sm transition-all"
          >
            Return Home
          </Link>
        </div>
      </Container>
    </main>
  );
}
