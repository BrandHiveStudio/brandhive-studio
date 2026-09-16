"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroDivider from "@/components/ui/HeroDivider";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/cards/Card";
import { fallbackArticles, type PublicPost } from "@/lib/db/queries/posts";

interface InsightsClientProps {
  initialPosts?: PublicPost[];
}

export default function InsightsClient({ initialPosts }: InsightsClientProps) {
  const allArticles = initialPosts && initialPosts.length > 0 ? initialPosts : fallbackArticles;

  const featuredArticle = allArticles.find((a) => a.isFeatured) || allArticles[0];
  const gridArticles = allArticles.filter((a) => a.id !== featuredArticle?.id);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", ...Array.from(new Set(allArticles.map((a) => a.category)))];

  const filteredArticles = gridArticles.filter((post) => {
    const matchesCategory = selectedCategory === "All" || post.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-16 relative">
      {/* Volumetric Lights */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#16C7FF]/4 blur-[110px]" />
        <div className="absolute top-[60%] left-[5%] w-[320px] h-[320px] rounded-full bg-blue-500/3 blur-[95px]" />
      </div>

      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pb-8 lg:pb-12 bg-transparent">
        <Container>
          <div className="flex flex-col gap-6 max-w-4xl">
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              OUR INSIGHTS
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              Perspectives on <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] to-blue-500">
                Design &amp; Technology.
              </span>
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              Discover expert insights, practical strategies, and real-world perspectives on branding, web design, digital marketing, business growth, and modern technology—crafted to help ambitious businesses make better digital decisions.
            </Text>
          </div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Featured Article Spot */}
      {featuredArticle && (selectedCategory === "All" || featuredArticle.category.toLowerCase() === selectedCategory.toLowerCase()) && (
        <Section className="py-8 bg-transparent">
          <Container>
            <Link href={`/insights/${featuredArticle.slug}`} className="block group">
              <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-[#11161C]/55 overflow-hidden shadow-2xl hover:border-[#16C7FF]/30 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
                  {/* Image Column */}
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-video w-full bg-neutral-900 overflow-hidden">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </div>

                  {/* Details Column */}
                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col gap-5">
                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#16C7FF]">
                      <span>FEATURED ARTICLE</span>
                      <span className="size-1 rounded-full bg-white/10" />
                      <span>{featuredArticle.category}</span>
                    </div>
                    <Heading level="h2" className="text-2xl sm:text-3xl font-extrabold text-white border-none pb-0 leading-tight group-hover:text-[#16C7FF] transition-colors">
                      {featuredArticle.title}
                    </Heading>
                    <Text className="text-sm sm:text-base text-white/70 leading-relaxed font-normal">
                      {featuredArticle.description}
                    </Text>
                    <div className="flex items-center justify-between text-xs font-bold text-white/50 mt-2">
                      <span>{featuredArticle.date}</span>
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Container>
        </Section>
      )}

      {/* 3. Search and Category Filter Row */}
      <Section className="py-12 bg-transparent border-t border-white/5">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            {/* Category chips list */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-gradient-to-r from-[#16C7FF] to-[#0096C7] border-none text-[#050608] shadow-[0_0_15px_rgba(22,199,255,0.25)]"
                      : "bg-[#11161C]/50 border-white/10 text-white/60 hover:border-[#16C7FF]/30 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search box */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                aria-label="Search articles"
                id="search-articles-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-white/10 bg-[#050608]/40 text-[#F5F7FA] placeholder-white/30 text-sm focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all"
              />
              <svg className="absolute left-3.5 top-3.5 size-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Grid list of posts */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <Text className="text-white/50">No articles found matching your criteria.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((post) => (
                <motion.div
                  key={post.id || post.slug}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="h-full"
                >
                  <Link href={`/insights/${post.slug}`} className="block h-full group">
                    <Card className="flex flex-col h-full overflow-hidden p-0 rounded-[2rem] border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-lg hover:border-[#16C7FF]/30 hover:shadow-[0_15px_30px_rgba(22,199,255,0.06)] transition-all duration-300">
                      {/* Cover image */}
                      <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-900">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>

                      {/* Metadata Header */}
                      <CardHeader className="p-8 pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            variant="secondary"
                            className="px-2.5 py-0.5 text-[9px] font-bold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
                          >
                            {post.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-extrabold text-white leading-tight group-hover:text-[#16C7FF] transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>

                      {/* Content Body */}
                      <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between gap-6">
                        <CardDescription className="text-sm text-white/60 leading-relaxed font-normal line-clamp-3">
                          {post.description}
                        </CardDescription>

                        <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider pt-4 border-t border-white/5">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* 4. Newsletter Subscription Form */}
      <Section className="py-12 pb-20 bg-transparent border-t border-white/5">
        <Container>
          <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#11161C]/55 backdrop-blur-md p-8 sm:p-12 md:p-16 overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute inset-0 blueprint-grid opacity-[0.25] pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#16C7FF]/15 blur-[90px] pointer-events-none animate-pulse" style={{ animationDuration: "7s" }} />

            <div className="relative flex flex-col items-center text-center gap-6 max-w-2xl mx-auto z-10">
              <Badge
                variant="secondary"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF]"
              >
                STAY INFORMED
              </Badge>
              <Heading level="h2" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white border-none pb-0">
                Subscribe to Our Newsletter
              </Heading>
              <Text className="text-white/70 text-sm sm:text-base leading-relaxed font-normal">
                Receive exclusive insights, practical design strategies, digital marketing trends, and business growth ideas delivered directly to your inbox.
              </Text>

              {/* Form Input */}
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  aria-label="Email address for newsletter"
                  id="newsletter-subscription-email"
                  className="flex-grow px-5 py-3 rounded-full border border-white/10 bg-[#050608]/40 text-[#F5F7FA] placeholder-white/30 text-sm focus:outline-none focus:border-[#16C7FF]/40 focus:ring-2 focus:ring-[#16C7FF]/10 transition-all"
                  required
                />
                <Button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#16C7FF] to-[#0096C7] text-[#050608] font-bold px-6 py-3 cursor-pointer shrink-0 transition-all hover:from-[#60D6FF] hover:to-[#16C7FF] shadow-[0_0_15px_rgba(22,199,255,0.2)]"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
