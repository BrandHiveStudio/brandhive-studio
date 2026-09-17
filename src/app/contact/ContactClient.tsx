"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HeroDivider from "@/components/ui/HeroDivider";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/cards/Card";

export default function ContactClient() {
  const [formData, setFormData] = useState({ name: "", email: "", service: "Brand Identity", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", email: "", message: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name.";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "Please enter a short project description.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit inquiry.");
      }

      setIsSubmitted(true);

      setFormData({
        name: "",
        email: "",
        service: "Brand Identity",
        message: "",
      });
    } catch (error) {
      console.error(error);
      setServerError(
        error instanceof Error ? error.message : "Failed to send inquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <main className="min-h-screen bg-transparent pt-32 pb-16 relative overflow-hidden">
      
      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pb-8 lg:pb-12 bg-transparent z-10">
        <Container>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start text-left gap-6 max-w-4xl"
          >
            <Badge
              variant="secondary"
              className="w-fit px-3.5 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-[#11161C]/50 text-[#16C7FF] backdrop-blur-md tracking-wider uppercase shadow-[0_0_15px_rgba(22,199,255,0.05)]"
            >
              Get In Touch
            </Badge>
            <Heading level="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white border-none pb-0">
              Let&apos;s Build Something <br />
              <span className="text-[#16C7FF] bg-clip-text bg-gradient-to-r from-[#16C7FF] via-[#00c4ff] to-[#0096C7] drop-shadow-[0_0_18px_rgba(22,199,255,0.2)] animate-pulse" style={{ animationDuration: "5s" }}>
                Incredible Together.
              </span>
            </Heading>
            <Text className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              Ready to elevate your brand? We&apos;d love to hear about your project.
            </Text>
          </motion.div>
        </Container>
      </Section>

      <HeroDivider />

      {/* 2. Main Split Content Section */}
      <Section className="py-6 bg-transparent z-10 relative">
        <Container>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-[1280px] mx-auto"
          >
            
            {/* LEFT COLUMN: Contact Cards (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5 w-full">
              
              {/* Card 1: Agency intro */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-[10px] font-bold tracking-widest text-[#16C7FF] uppercase">Your Creative Partner</span>
                <p className="text-sm text-white/70 mt-3.5 leading-relaxed font-normal">
                  Whether you&apos;re launching a new business, refreshing your brand, or growing your online presence, BrandHive Studio is here to help bring your ideas to life with creative design and strategic thinking.
                </p>
              </motion.div>

              {/* Card 2: Phone */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4.5"
              >
                <div className="size-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16C7FF] shrink-0 shadow-sm">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Phone</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">+94 70 641 0093</p>
                </div>
              </motion.div>

              {/* Card 3: Email */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4.5"
              >
                <div className="size-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16C7FF] shrink-0 shadow-sm">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Email</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5 break-all">brandhive.studio.lk@gmail.com</p>
                </div>
              </motion.div>

              {/* Card 4: Location */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-5 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4.5"
              >
                <div className="size-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#16C7FF] shrink-0 shadow-sm">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Location</span>
                  <p className="text-sm font-semibold text-white/90 mt-0.5">Sri Lanka</p>
                </div>
              </motion.div>

              {/* Card 5: WhatsApp Button & QR Code Box */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="text-[10px] font-bold tracking-widest text-[#16C7FF] uppercase block mb-3.5">WhatsApp</span>
                
                <a
                  href="https://wa.me/94706410093"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-[#050608] font-bold text-sm py-3.5 rounded-2xl transition-all duration-300 mb-5 shadow-[0_4px_15px_rgba(37,211,102,0.22)] cursor-pointer"
                >
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
                  </svg>
                  Chat on WhatsApp
                </a>

                {/* Scan Box with Border */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pt-5 border-t border-white/10">
                  <div className="relative w-[110px] aspect-[9/16] rounded-xl overflow-hidden bg-black/40 border border-white/5 flex-shrink-0 flex items-center justify-center p-1 shadow-inner">
                    <Image
                      src="/favicon/whatsapp-qr-scan.png"
                      alt="BrandHive Studio WhatsApp QR Code"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-center sm:text-left">
                    <Heading level="h4" className="text-base font-bold text-white border-none pb-0">
                      Scan to Chat Instantly
                    </Heading>
                    <p className="text-xs text-white/50 leading-relaxed font-normal">
                      Open your phone camera and point it at the QR code to start a WhatsApp conversation directly.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 6: Accepting Projects Status */}
              <motion.div
                variants={itemVariants}
                className="bg-[#11161C]/55 border border-white/10 rounded-3xl p-5.5 backdrop-blur-md shadow-xl hover:border-[#16C7FF]/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#16C7FF] tracking-wider uppercase">Currently Accepting Projects</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed mt-2.5 font-normal">
                  We&apos;re open to new projects and collaborations. Reach out and let&apos;s discuss your vision.
                </p>
              </motion.div>

            </div>

            {/* RIGHT COLUMN: Contact Form (7 cols) */}
            <div className="lg:col-span-7 w-full h-full">
              <motion.div variants={itemVariants} className="h-full">
                <Card className="p-8 sm:p-10 md:p-12 rounded-3xl border border-white/10 bg-[#11161C]/55 backdrop-blur-md shadow-2xl hover:border-[#16C7FF]/20 transition-all duration-500 h-full relative overflow-hidden">
                  
                  {/* Subtle inner ambient card glow */}
                  <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-[#16C7FF]/4 blur-[45px] rounded-full pointer-events-none -z-10" />
                  
                  <AnimatePresence mode="wait">
                    {isSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="py-16 text-center flex flex-col items-center justify-center gap-6 h-full"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* Expanding confirmation ring */}
                          <motion.div 
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: [0.75, 1.2, 1], opacity: [0, 0.45, 0.15] }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute size-24 rounded-full border border-[#16C7FF]/40 pointer-events-none"
                          />
                          
                          <div className="size-16 rounded-full bg-[#16C7FF]/10 flex items-center justify-center text-[#16C7FF] shadow-[0_0_20px_rgba(22,199,255,0.12)]">
                            <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <motion.path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7" 
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
                              />
                            </svg>
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="flex flex-col gap-2"
                        >
                          <Heading level="h3" className="text-2xl font-bold text-white border-none pb-0 mt-2">
                            Inquiry Received!
                          </Heading>
                          <Text className="text-white/60 text-sm max-w-sm leading-relaxed">
                            Thank you for reaching out. A BrandHive team member will analyze your request and reply within 24 hours.
                          </Text>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full"
                      >
                        <Heading level="h3" className="text-2xl font-bold text-white border-none pb-0 mb-7 leading-tight">
                          Project Planner
                        </Heading>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                          
                          {/* Split layout: Name & Email */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Name field */}
                            <div className="flex flex-col gap-2">
                              <label htmlFor="full-name" className="text-[10px] uppercase tracking-wider font-extrabold text-white/50">Full Name *</label>
                              <input
                                type="text"
                                id="full-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                className={`w-full px-4.5 py-3.5 rounded-2xl border bg-[#050608]/40 text-sm text-[#F5F7FA] placeholder-white/20 focus:outline-none transition-all duration-300 ${
                                  errors.name
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                    : "border-white/10 focus:border-[#16C7FF]/40 focus:ring-4 focus:ring-[#16C7FF]/10"
                                }`}
                              />
                              {errors.name && (
                                <span className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.name}</span>
                              )}
                            </div>

                            {/* Email field */}
                            <div className="flex flex-col gap-2">
                              <label htmlFor="email-address" className="text-[10px] uppercase tracking-wider font-extrabold text-white/50">Email *</label>
                              <input
                                type="email"
                                id="email-address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className={`w-full px-4.5 py-3.5 rounded-2xl border bg-[#050608]/40 text-sm text-[#F5F7FA] placeholder-white/20 focus:outline-none transition-all duration-300 ${
                                  errors.email
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                    : "border-white/10 focus:border-[#16C7FF]/40 focus:ring-4 focus:ring-[#16C7FF]/10"
                                }`}
                              />
                              {errors.email && (
                                <span className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.email}</span>
                              )}
                            </div>
                          </div>

                          {/* Service interested in */}
                          <div className="flex flex-col gap-2">
                            <label htmlFor="service-select" className="text-[10px] uppercase tracking-wider font-extrabold text-white/50">Service Interested In</label>
                            <select
                              value={formData.service}
                              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                              id="service-select"
                              className="w-full px-4.5 py-3.5 rounded-2xl border border-white/10 bg-[#050608]/40 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#16C7FF]/40 focus:ring-4 focus:ring-[#16C7FF]/10 transition-all duration-300"
                            >
                              <option className="bg-[#0C1117] text-white">Brand Identity</option>
                              <option className="bg-[#0C1117] text-white">Logo Design</option>
                              <option className="bg-[#0C1117] text-white">Website Design &amp; Development</option>
                              <option className="bg-[#0C1117] text-white">UI/UX Design</option>
                              <option className="bg-[#0C1117] text-white">Digital Marketing &amp; SEO</option>
                              <option className="bg-[#0C1117] text-white">Other</option>
                            </select>
                          </div>

                          {/* Message */}
                          <div className="flex flex-col gap-2">
                            <label htmlFor="project-message" className="text-[10px] uppercase tracking-wider font-extrabold text-white/50">Message *</label>
                            <textarea
                              rows={5}
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                              id="project-message"
                              placeholder="Tell us about your project..."
                              className={`w-full px-4.5 py-3.5 rounded-2xl border bg-[#050608]/40 text-sm text-[#F5F7FA] placeholder-white/20 focus:outline-none transition-all duration-300 resize-none ${
                                errors.message
                                  ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                  : "border-white/10 focus:border-[#16C7FF]/40 focus:ring-4 focus:ring-[#16C7FF]/10"
                              }`}
                            />
                            {errors.message && (
                              <span className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.message}</span>
                            )}
                          </div>

                          {/* Actions Area */}
                          <div className="flex flex-col gap-4 mt-2">
                            {serverError && (
                              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium text-center animate-in fade-in">
                                {serverError}
                              </div>
                            )}

                            {/* Submit Button */}
                            <motion.div
                              whileHover={{
                                y: -2,
                                boxShadow: "0 8px 25px rgba(22, 199, 255, 0.35), 0 0 15px rgba(22, 199, 255, 0.12)",
                              }}
                              transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
                              className="w-full rounded-2xl overflow-hidden"
                            >
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#16C7FF]/90 via-[#00c4ff] to-[#0096C7]/90 hover:from-[#60D6FF] hover:to-[#16C7FF] text-[#050608] font-bold text-sm py-3.5 transition-all duration-300 cursor-pointer disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <svg className="animate-spin h-5 w-5 text-[#050608]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                ) : (
                                  <>
                                    Send Message
                                    <svg className="size-4 rotate-45 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            </motion.div>

                            {/* WhatsApp Button */}
                            <a
                              href="https://wa.me/94706410093"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-[#050608] font-bold text-sm py-3.5 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(37,211,102,0.15)] cursor-pointer"
                            >
                              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.012 11.5 1.012c-5.443 0-9.867 4.371-9.871 9.8-.002 2.024.528 4.004 1.536 5.75L2.148 20.89l4.499-1.736z" />
                              </svg>
                              Chat on WhatsApp
                            </a>

                            {/* Browse Portfolio Button */}
                            <Link
                              href="/portfolio"
                              className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-2xl transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer"
                            >
                              <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              Browse Full Portfolio
                            </Link>

                          </div>

                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </Card>
              </motion.div>
            </div>

          </motion.div>
        </Container>
      </Section>

    </main>
  );
}
