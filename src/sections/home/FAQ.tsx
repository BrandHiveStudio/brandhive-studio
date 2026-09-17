"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "@/components/layout/Section";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";
import { fallbackFaqs, type PublicFaq } from "@/data/faqs";

interface FaqProps {
  initialFaqs?: PublicFaq[];
}

export default function FAQ({ initialFaqs }: FaqProps) {
  const faqsList = initialFaqs && initialFaqs.length > 0 ? initialFaqs : fallbackFaqs;

  // Active category filter state
  const [activeCategory, setActiveCategory] = useState<string>("All");
  // Open accordion indices (single or multi expand - single expand provides a cleaner Apple aesthetic)
  const [openId, setOpenId] = useState<string | null>(null);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(faqsList.map((f) => f.category)))];

  const filteredFaqs = faqsList.filter((f) => {
    if (activeCategory === "All") return true;
    return f.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="faq">
      <Section className="relative overflow-hidden pt-20 pb-20 lg:pt-28 lg:pb-32 bg-transparent">
        {/* Volumetric Ambience Lights */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="absolute top-[25%] left-[15%] w-[320px] h-[320px] rounded-full bg-[#16C7FF]/3 blur-[110px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-600/3 blur-[120px]" />
        </div>

        {/* Section Header Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <Badge
              variant="secondary"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md"
            >
              Frequently Asked Questions
            </Badge>
            <Heading level="h2" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white border-none pb-0">
              Clear Answers to <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] via-[#00c4ff] to-blue-500">
                Common Questions
              </span>
            </Heading>
          </div>
          <div className="lg:col-span-5 text-left lg:text-right">
            <Text className="text-white/60 text-base sm:text-lg leading-relaxed">
              Everything you need to know about our design framework, sprint timelines, pricing, and project deliverables.
            </Text>
          </div>
        </div>

        {/* Category Selector Tabs */}
        {categories.length > 2 && (
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#16C7FF] text-[#050608] shadow-[0_0_20px_rgba(22,199,255,0.3)]"
                      : "bg-[#11161C]/60 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Accordion Stack */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openId === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
                  isOpen
                    ? "bg-[#11161C]/80 border-[#16C7FF]/40 shadow-[0_10px_35px_rgba(22,199,255,0.08),0_0_20px_rgba(22,199,255,0.03)]"
                    : "bg-[#11161C]/45 border-white/10 hover:border-white/20 hover:bg-[#11161C]/65"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-[#16C7FF]/60 shrink-0">
                      0{index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white transition-colors duration-200">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`size-9 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[#16C7FF] text-[#050608] border-[#16C7FF] rotate-180 shadow-[0_0_15px_rgba(22,199,255,0.3)]"
                        : "bg-white/[0.04] text-white/50 border-white/10 hover:text-white"
                    }`}
                  >
                    <ChevronDown className="size-4.5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 border-t border-white/5">
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed font-normal">
                          {faq.answer}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-white/[0.04] text-white/40 border border-white/5">
                            {faq.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
