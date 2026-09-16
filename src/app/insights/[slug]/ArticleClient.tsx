"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Badge from "@/components/ui/Badge";
import type { PublicPost } from "@/lib/db/queries/posts";

interface ArticleClientProps {
  article: PublicPost;
}

export default function ArticleClient({ article }: ArticleClientProps) {
  // Simple markdown renderer for paragraphs, headings (##, ###), and bullet points
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: string | number) => {
      if (currentParagraph.length > 0) {
        const textContent = currentParagraph.join(" ").trim();
        if (textContent) {
          elements.push(
            <p key={`p-${key}`} className="text-white/75 text-base sm:text-lg leading-relaxed font-normal mb-6">
              {textContent}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("### ")) {
        flushParagraph(idx);
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xl sm:text-2xl font-bold text-white mt-8 mb-3">
            {trimmed.replace("### ", "")}
          </h3>
        );
      } else if (trimmed.startsWith("## ")) {
        flushParagraph(idx);
        elements.push(
          <h2 key={`h2-${idx}`} className="text-2xl sm:text-3xl font-extrabold text-white mt-10 mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#16C7FF]" />
            <span>{trimmed.replace("## ", "")}</span>
          </h2>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        flushParagraph(idx);
        elements.push(
          <li key={`li-${idx}`} className="text-white/75 text-base sm:text-lg leading-relaxed ml-6 list-disc mb-2">
            {trimmed.replace(/^[-*]\s+/, "")}
          </li>
        );
      } else if (trimmed === "") {
        flushParagraph(idx);
      } else {
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph("final");
    return elements;
  };

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-24 relative overflow-hidden">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#16C7FF]/4 blur-[120px]" />
        <div className="absolute top-[50%] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/3 blur-[110px]" />
      </div>

      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-[#16C7FF] transition-colors py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Insights</span>
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs font-bold rounded-full border border-white/10 bg-[#11161C]/60 text-[#16C7FF] uppercase tracking-wider"
              >
                {article.category}
              </Badge>
              {article.isFeatured && (
                <span className="text-xs text-[#16C7FF] font-bold flex items-center gap-1">
                  <Sparkles className="size-3" /> Featured
                </span>
              )}
            </div>

            <Heading level="h1" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] border-none pb-0">
              {article.title}
            </Heading>

            {article.description && (
              <p className="text-lg sm:text-xl text-white/70 leading-relaxed font-normal">
                {article.description}
              </p>
            )}

            {/* Author & Meta Row */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs font-semibold text-white/50">
              <div className="flex items-center gap-2 text-white/90">
                <div className="size-7 rounded-full bg-[#16C7FF]/20 border border-[#16C7FF]/40 flex items-center justify-center text-[#16C7FF] font-bold text-xs">
                  BH
                </div>
                <span>{article.author}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-white/40" />
                <span>{article.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-white/40" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Cover Image Frame */}
          {article.image && (
            <div className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 100vw, 1200px"
              />
            </div>
          )}

          {/* Main Article Content */}
          <div className="pt-6 pb-12 text-white/80 leading-relaxed">
            {renderFormattedContent(article.content)}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 mr-2 flex items-center gap-1.5">
                <Tag className="size-3.5" /> Topics:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] text-white/70 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Conversion CTA Banner */}
          <div className="mt-16 p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#0c111a] to-[#070b10] border border-white/10 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-[11px] font-bold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
              >
                READY TO ELEVATE?
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Turn insights into tangible digital growth.
              </h3>
              <p className="text-xs sm:text-sm text-white/60">
                Partner with BrandHive Studio to build your next-generation brand identity, custom website, or digital strategy.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#16C7FF] hover:bg-[#60D6FF] text-[#050608] font-bold text-xs shadow-[0_0_20px_rgba(22,199,255,0.3)] transition-all shrink-0 cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      </Container>
    </main>
  );
}
