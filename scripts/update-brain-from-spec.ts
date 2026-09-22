/**
 * update-brain-from-spec.ts
 *
 * Updates the live Turso Brain database (brain_services, brain_addons, brain_faqs, brain_settings)
 * with the authoritative data from the BrandHive Studio AI Agent Master Specification.
 *
 * Safe to re-run: uses INSERT OR REPLACE (upsert) by slug/key.
 *
 * Run with: npx tsx scripts/update-brain-from-spec.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db/index";
import { brainServices, brainAddons, brainFaqs, brainSettings } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// ============================================================
// HELPERS
// ============================================================

async function upsertService(data: {
  slug: string;
  name: string;
  description?: string;
  category: string;
  itemType: "service" | "package";
  pricingType: "fixed" | "starting_from" | "custom_quote";
  price?: number;
  startingPrice?: number;
  currency?: string;
  unit?: string;
  adBudgetSeparate?: boolean;
  inclusions?: string[];
  displayOrder: number;
}) {
  const existing = await db
    .select()
    .from(brainServices)
    .where(eq(brainServices.slug, data.slug))
    .limit(1);

  const row = {
    slug: data.slug,
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    itemType: data.itemType,
    pricingType: data.pricingType,
    price: data.price ?? null,
    startingPrice: data.startingPrice ?? null,
    currency: data.currency ?? "LKR",
    unit: data.unit ?? null,
    adBudgetSeparate: data.adBudgetSeparate ?? false,
    inclusions: data.inclusions ? JSON.stringify(data.inclusions) : null,
    isActive: true,
    displayOrder: data.displayOrder,
    updatedAt: new Date(),
  };

  if (existing.length > 0) {
    await db.update(brainServices).set(row).where(eq(brainServices.slug, data.slug));
    console.log(`  ✓ Updated service: ${data.slug}`);
  } else {
    await db.insert(brainServices).values({ ...row, id: randomUUID(), createdAt: new Date() });
    console.log(`  + Inserted service: ${data.slug}`);
  }
}

async function upsertFaq(data: {
  slug: string; // used as a stable lookup key via question hash
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}) {
  // Look up by question (closest to unique key for FAQs)
  const existing = await db
    .select()
    .from(brainFaqs)
    .where(eq(brainFaqs.question, data.question))
    .limit(1);

  const row = {
    question: data.question,
    answer: data.answer,
    category: data.category,
    isActive: true,
    displayOrder: data.displayOrder,
    updatedAt: new Date(),
  };

  if (existing.length > 0) {
    await db.update(brainFaqs).set(row).where(eq(brainFaqs.id, existing[0].id));
    console.log(`  ✓ Updated FAQ: ${data.question.substring(0, 50)}...`);
  } else {
    await db.insert(brainFaqs).values({ ...row, id: randomUUID(), createdAt: new Date() });
    console.log(`  + Inserted FAQ: ${data.question.substring(0, 50)}...`);
  }
}

async function upsertSetting(key: string, value: string, description: string) {
  const existing = await db
    .select()
    .from(brainSettings)
    .where(eq(brainSettings.key, key))
    .limit(1);

  const row = { key, value, description, isActive: true, updatedAt: new Date() };

  if (existing.length > 0) {
    await db.update(brainSettings).set(row).where(eq(brainSettings.key, key));
    console.log(`  ✓ Updated setting: ${key}`);
  } else {
    await db.insert(brainSettings).values({ ...row, id: randomUUID(), createdAt: new Date() });
    console.log(`  + Inserted setting: ${key}`);
  }
}

async function upsertAddon(data: {
  name: string;
  description?: string;
  pricingType: "fixed" | "starting_from" | "custom_quote";
  price?: number;
  startingPrice?: number;
  currency?: string;
  unit?: string;
  displayOrder: number;
}) {
  const existing = await db
    .select()
    .from(brainAddons)
    .where(eq(brainAddons.name, data.name))
    .limit(1);

  const row = {
    serviceId: null as string | null,
    name: data.name,
    description: data.description ?? null,
    pricingType: data.pricingType,
    price: data.price ?? null,
    startingPrice: data.startingPrice ?? null,
    currency: data.currency ?? "LKR",
    unit: data.unit ?? null,
    isActive: true,
    displayOrder: data.displayOrder,
    updatedAt: new Date(),
  };

  if (existing.length > 0) {
    await db.update(brainAddons).set(row).where(eq(brainAddons.id, existing[0].id));
    console.log(`  ✓ Updated addon: ${data.name}`);
  } else {
    await db.insert(brainAddons).values({ ...row, id: randomUUID(), createdAt: new Date() });
    console.log(`  + Inserted addon: ${data.name}`);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("\n🐝 BrandHive Studio — Brain Update from Master Spec\n");

  // ============================================================
  // 1. BRAIN SETTINGS (Company Profile)
  // ============================================================
  console.log("\n── Brain Settings ──");
  await upsertSetting("business_name", "BrandHive Studio", "Official business name");
  await upsertSetting("slogan", "Crafting Brands That Inspire", "Official business tagline/slogan");
  await upsertSetting("contact_phone_whatsapp", "+94 70 641 0093", "Primary WhatsApp & phone number");
  await upsertSetting("contact_email", "brandhive.studio.lk@gmail.com", "Primary contact email");
  await upsertSetting("website_url", "https://brandhivestudio.com.lk", "Official website URL");
  await upsertSetting(
    "business_hours",
    "Monday–Saturday: 9:00 AM – 6:00 PM. Sunday: Closed. Timezone: Asia/Colombo (UTC+5:30)",
    "Normal human support business hours"
  );
  await upsertSetting(
    "payment_terms_standard",
    "50% advance to initiate project, 50% before final delivery. Larger/custom projects may use milestone-based payments.",
    "Standard payment terms"
  );
  await upsertSetting("payment_methods", "Cash, Bank Transfer", "Accepted payment methods");
  await upsertSetting("portfolio_url", "https://brandhivestudio.com.lk/portfolio", "Official portfolio page URL");
  await upsertSetting(
    "social_instagram",
    "https://www.instagram.com/brandhivestudiolk",
    "Official Instagram profile URL"
  );
  await upsertSetting(
    "social_facebook",
    "https://www.facebook.com/brandhivestudiolk",
    "Official Facebook page URL"
  );
  await upsertSetting(
    "social_tiktok",
    "https://www.tiktok.com/@brandhivestudiolk",
    "Official TikTok profile URL"
  );
  await upsertSetting(
    "cancellation_policy",
    "Before work begins: Cancellation may qualify for a refund of the unused portion of the advance after deducting completed work and non-refundable third-party costs. After work begins: Payments relating to completed work are non-refundable. Third-party services (domain, hosting, advertising) are subject to the provider's own terms.",
    "Standard cancellation and refund policy"
  );
  await upsertSetting(
    "revision_policy",
    "Revision availability depends on the selected package or quotation. Exact allowance is specified per package.",
    "Standard revision policy"
  );
  await upsertSetting(
    "ownership_policy",
    "Final approved deliverables are transferred after full payment unless otherwise agreed in the quotation.",
    "Ownership/IP transfer policy"
  );
  await upsertSetting(
    "third_party_costs_policy",
    "Domain, hosting, advertising budgets, premium software subscriptions, payment gateway charges, and other third-party services are billed separately unless explicitly included in a quotation.",
    "Third-party cost disclaimer"
  );
  await upsertSetting(
    "advertising_budget_policy",
    "Advertising budgets are separate from BrandHive service fees unless a specific offering explicitly includes an advertising allocation.",
    "Advertising budget separation rule"
  );
  await upsertSetting(
    "quotation_validity",
    "30 days from the date of issue unless otherwise stated.",
    "Standard quotation validity period"
  );
  await upsertSetting(
    "discount_policy",
    "BrandHive AI may only communicate officially active promotions stored in the system. The AI cannot invent, negotiate, or promise discounts independently.",
    "Discount authorization policy"
  );
  await upsertSetting(
    "ai_model",
    "gemini-3.8-flash",
    "Gemini model used for HIVE AI website chat. Do not substitute with another model."
  );
  await upsertSetting(
    "core_services_summary",
    "Brand Strategy & Identity, Digital Experiences (websites, web apps), Growth Marketing (social media, TikTok, paid advertising), Academic Technology (software development mentoring)",
    "High-level summary of BrandHive Studio core service areas"
  );
  await upsertSetting(
    "business_registration_policy",
    "Registration status is internal information. Do not disclose, confirm, or deny registration. Escalate to Client Relations Team if asked.",
    "Business registration disclosure policy"
  );
  await upsertSetting(
    "payment_security_policy",
    "Never request OTP, card PIN, banking password, or sensitive payment credentials. Bank details must come from secure authorized payment system only.",
    "Payment security rules"
  );
  await upsertSetting(
    "academic_integrity_policy",
    "BrandHive provides mentoring, guidance, code review, and technical consulting. Students remain responsible for understanding and submitting their own academic work per institutional requirements.",
    "Academic integrity disclaimer"
  );
  await upsertSetting(
    "human_handoff_role",
    "BrandHive Studio Client Relations Team",
    "Official human handoff team name to use in customer conversations"
  );
  await upsertSetting(
    "whatsapp_ai_availability",
    "24/7 when automation is operational. Human support: Monday–Saturday, 9AM–6PM. Sunday: Closed.",
    "WhatsApp AI and human support availability"
  );

  // ============================================================
  // 2. BRAIN SERVICES — CATEGORY 01: BRAND IDENTITY PACKAGES
  // ============================================================
  console.log("\n── Brand Identity Packages ──");
  await upsertService({
    slug: "brd-pkg-01",
    name: "Starter Brand Identity",
    category: "branding",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 15000,
    description: "Foundational brand identity for startups, individuals, and small businesses.",
    inclusions: ["Logo Design", "Color Palette", "Typography Selection", "Basic Brand Guidelines"],
    displayOrder: 10,
  });
  await upsertService({
    slug: "brd-pkg-02",
    name: "Business Brand Identity",
    category: "branding",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 35000,
    description: "Professional identity system for growing businesses.",
    inclusions: ["Logo Design", "Color Palette", "Typography", "Business Card", "Letterhead", "Social Media Profile Kit", "Extended Brand Guidelines"],
    displayOrder: 11,
  });
  await upsertService({
    slug: "brd-pkg-03",
    name: "Premium Brand Identity",
    category: "branding",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 75000,
    description: "Complete brand system for established businesses.",
    inclusions: ["Everything in Business", "Brand Strategy", "Stationery Set", "Social Media Templates", "Marketing Assets"],
    displayOrder: 12,
  });
  await upsertService({
    slug: "brd-pkg-04",
    name: "Enterprise Brand Identity",
    category: "branding",
    itemType: "package",
    pricingType: "custom_quote",
    description: "Fully customized corporate identity system for organizations.",
    inclusions: ["Fully Customized Corporate Identity", "Scope Defined by Quotation"],
    displayOrder: 13,
  });

  // ============================================================
  // CATEGORY 02: INDIVIDUAL BRANDING SERVICES
  // ============================================================
  console.log("\n── Individual Branding Services ──");
  await upsertService({ slug: "brd-svc-01", name: "Logo Design", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 8000, description: "Professional custom logo design.", displayOrder: 20 });
  await upsertService({ slug: "brd-svc-02", name: "Logo Redesign", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 10000, description: "Modernize or refresh an existing logo.", displayOrder: 21 });
  await upsertService({ slug: "brd-svc-03", name: "Brand Color Palette", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 4000, description: "Professional brand color system.", displayOrder: 22 });
  await upsertService({ slug: "brd-svc-04", name: "Typography System", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 3500, description: "Curated brand typography selection.", displayOrder: 23 });
  await upsertService({ slug: "brd-svc-05", name: "Business Card Design", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 3000, description: "Professional business card design.", displayOrder: 24 });
  await upsertService({ slug: "brd-svc-06", name: "Letterhead Design", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 3500, description: "Corporate letterhead design.", displayOrder: 25 });
  await upsertService({ slug: "brd-svc-07", name: "Email Signature Design", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 2500, description: "Professional email signature.", displayOrder: 26 });
  await upsertService({ slug: "brd-svc-08", name: "Social Media Branding Kit", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 8000, description: "Branded social media profile and cover assets.", displayOrder: 27 });
  await upsertService({ slug: "brd-svc-09", name: "Brand Guidelines Document", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 15000, description: "Comprehensive brand usage guidelines document.", displayOrder: 28 });
  await upsertService({ slug: "brd-svc-10", name: "Complete Stationery Design", category: "branding", itemType: "service", pricingType: "starting_from", startingPrice: 12000, description: "Full stationery suite including business card, letterhead, and envelope.", displayOrder: 29 });

  // ============================================================
  // CATEGORY 03: WEBSITE PACKAGES
  // ============================================================
  console.log("\n── Website Packages ──");
  await upsertService({
    slug: "web-pkg-01",
    name: "Starter Website",
    category: "website",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 35000,
    description: "Ideal for startups and small businesses.",
    inclusions: ["Up to 5 Pages", "Responsive Design", "Contact Form", "Basic SEO", "Google Maps"],
    displayOrder: 30,
  });
  await upsertService({
    slug: "web-pkg-02",
    name: "Business Website",
    category: "website",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 75000,
    description: "Growing businesses with advanced online requirements.",
    inclusions: ["Up to 10 Pages", "Premium UI", "CMS Integration", "Advanced SEO", "Blog", "Analytics"],
    displayOrder: 31,
  });
  await upsertService({
    slug: "web-pkg-03",
    name: "Corporate Website",
    category: "website",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 150000,
    description: "Established businesses and organizations needing a full-scale web presence.",
    inclusions: ["Unlimited Pages", "Custom UI/UX", "Performance Optimization", "Advanced SEO", "Security", "Speed Optimization"],
    displayOrder: 32,
  });
  await upsertService({
    slug: "web-pkg-04",
    name: "Custom Web Solution",
    category: "website",
    itemType: "package",
    pricingType: "custom_quote",
    description: "Businesses requiring custom digital platforms, dashboards, or enterprise systems.",
    inclusions: ["Custom Features", "Business Systems", "Dashboards", "API Integration", "Database Design", "Enterprise Development"],
    displayOrder: 33,
  });

  // ============================================================
  // CATEGORY 04: INDIVIDUAL WEBSITE SERVICES
  // ============================================================
  console.log("\n── Individual Website Services ──");
  await upsertService({ slug: "web-svc-01", name: "Landing Page Design", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 15000, displayOrder: 40 });
  await upsertService({ slug: "web-svc-02", name: "Website Redesign", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 25000, displayOrder: 41 });
  await upsertService({ slug: "web-svc-03", name: "E-Commerce Website", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 75000, displayOrder: 42 });
  await upsertService({ slug: "web-svc-04", name: "Corporate Website Development", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 85000, displayOrder: 43 });
  await upsertService({ slug: "web-svc-05", name: "Website Speed Optimization", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 10000, displayOrder: 44 });
  await upsertService({ slug: "web-svc-06", name: "UI/UX Design", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 20000, displayOrder: 45 });
  await upsertService({ slug: "web-svc-07", name: "Business Website Development", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 35000, displayOrder: 46 });
  await upsertService({ slug: "web-svc-08", name: "Portfolio Website", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 25000, displayOrder: 47 });
  await upsertService({ slug: "web-svc-09", name: "Website Maintenance", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 8000, unit: "month", displayOrder: 48 });
  await upsertService({ slug: "web-svc-10", name: "SEO Optimization", category: "website", itemType: "service", pricingType: "starting_from", startingPrice: 15000, displayOrder: 49 });

  // ============================================================
  // CATEGORY 05: WEBSITE ADD-ONS
  // ============================================================
  console.log("\n── Website Add-Ons ──");
  await upsertAddon({ name: "Additional Page", pricingType: "starting_from", startingPrice: 4000, displayOrder: 50 });
  await upsertAddon({ name: "Blog Setup", pricingType: "starting_from", startingPrice: 7500, displayOrder: 51 });
  await upsertAddon({ name: "Booking System", pricingType: "starting_from", startingPrice: 15000, displayOrder: 52 });
  await upsertAddon({ name: "Online Payment Gateway", pricingType: "starting_from", startingPrice: 15000, displayOrder: 53 });
  await upsertAddon({ name: "Live Chat Integration", pricingType: "starting_from", startingPrice: 4000, displayOrder: 54 });
  await upsertAddon({ name: "WhatsApp Chat Integration", pricingType: "starting_from", startingPrice: 2500, displayOrder: 55 });
  await upsertAddon({ name: "Multilingual Website", pricingType: "starting_from", startingPrice: 20000, displayOrder: 56 });
  await upsertAddon({ name: "Website Maintenance (Monthly)", pricingType: "starting_from", startingPrice: 5000, unit: "month", displayOrder: 57 });
  await upsertAddon({ name: "Monthly Content Updates", pricingType: "starting_from", startingPrice: 5000, unit: "month", displayOrder: 58 });
  await upsertAddon({ name: "Website Backup & Security Monitoring", pricingType: "starting_from", startingPrice: 3500, unit: "month", displayOrder: 59 });

  // ============================================================
  // CATEGORY 06: SOCIAL MEDIA MARKETING
  // ============================================================
  console.log("\n── Social Media Marketing ──");
  await upsertService({
    slug: "smm-pkg-01a",
    name: "Social Media Starter — Organic",
    category: "social-media",
    itemType: "package",
    pricingType: "fixed",
    price: 14000,
    unit: "month",
    adBudgetSeparate: false,
    description: "Small businesses starting social media management. Organic only.",
    inclusions: ["15 Custom Posts", "Facebook", "Instagram", "Caption Writing", "Content Planning", "Basic Management"],
    displayOrder: 60,
  });
  await upsertService({
    slug: "smm-pkg-01b",
    name: "Social Media Starter — $20 Boosting",
    category: "social-media",
    itemType: "package",
    pricingType: "fixed",
    price: 20000,
    unit: "month",
    adBudgetSeparate: false,
    description: "Starter package with $20 boosting allocation explicitly included.",
    inclusions: ["15 Custom Posts", "Facebook", "Instagram", "Caption Writing", "Content Planning", "Basic Management", "$20 Boosting Allocation"],
    displayOrder: 61,
  });
  await upsertService({
    slug: "smm-pkg-02a",
    name: "Social Media Growth — Organic",
    category: "social-media",
    itemType: "package",
    pricingType: "fixed",
    price: 25000,
    unit: "month",
    adBudgetSeparate: false,
    description: "Grow your audience with posts and reels across Facebook, Instagram, and TikTok.",
    inclusions: ["20 Custom Posts", "4 Short Reels", "Facebook", "Instagram", "TikTok Management", "Caption Writing", "Content Calendar", "Basic Community Management", "Monthly Analytics Report"],
    displayOrder: 62,
  });
  await upsertService({
    slug: "smm-pkg-02b",
    name: "Social Media Growth — With Boosting",
    category: "social-media",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 25000,
    unit: "month",
    adBudgetSeparate: true,
    description: "Growth package with optional advertising budget added separately.",
    inclusions: ["Everything in Growth Organic", "Selected Ad Budget Added Separately"],
    displayOrder: 63,
  });
  await upsertService({
    slug: "smm-pkg-03a",
    name: "Social Media Premium — Organic",
    category: "social-media",
    itemType: "package",
    pricingType: "fixed",
    price: 40000,
    unit: "month",
    adBudgetSeparate: false,
    description: "Full-service premium social media management for ambitious brands.",
    inclusions: ["30 Custom Posts", "8 Short Reels", "Facebook", "Instagram", "TikTok", "Premium Graphic Design", "Content Strategy", "Community Management", "Monthly Performance Report", "Strategy Meeting", "Priority Support"],
    displayOrder: 64,
  });
  await upsertService({
    slug: "smm-pkg-03b",
    name: "Social Media Premium — With Boosting",
    category: "social-media",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 40000,
    unit: "month",
    adBudgetSeparate: true,
    description: "Premium package with optional advertising budget added separately.",
    inclusions: ["Everything in Premium Organic", "Selected Ad Budget Added Separately"],
    displayOrder: 65,
  });

  // ============================================================
  // CATEGORY 07: TIKTOK VIDEO PRODUCTION
  // ============================================================
  console.log("\n── TikTok Video Production ──");
  await upsertService({
    slug: "ttk-pkg-01",
    name: "TikTok Starter — Single Video",
    category: "tiktok",
    itemType: "package",
    pricingType: "fixed",
    price: 5000,
    unit: "video",
    adBudgetSeparate: false,
    description: "Single TikTok promotional video with client-location visit, shoot, editing, and upload.",
    inclusions: ["1 TikTok Video", "Product / Shop / Promotional Video", "Client-Location Visit", "Small On-Location Shoot", "Video Editing", "TikTok Upload"],
    displayOrder: 70,
  });
  await upsertService({
    slug: "ttk-pkg-02",
    name: "TikTok Growth — 4 Videos",
    category: "tiktok",
    itemType: "package",
    pricingType: "fixed",
    price: 18000,
    unit: "month",
    adBudgetSeparate: false,
    description: "4 TikTok videos per month with on-location shooting, editing, and content planning.",
    inclusions: ["4 TikTok Videos", "On-Location Shooting", "Product / Shop / Promotional Videos", "Video Editing", "Captions", "TikTok Uploads", "Basic Monthly Content Planning"],
    displayOrder: 71,
  });
  await upsertService({
    slug: "ttk-pkg-03",
    name: "TikTok Premium — 8 Videos",
    category: "tiktok",
    itemType: "package",
    pricingType: "fixed",
    price: 32000,
    unit: "month",
    adBudgetSeparate: false,
    description: "8 TikTok videos per month with professional editing, concepts, and optimization.",
    inclusions: ["8 TikTok Videos", "On-Location Shooting", "Promotional Concepts", "Professional Editing", "Captions", "TikTok Uploads", "Monthly Content Planning", "Content Optimization"],
    displayOrder: 72,
  });
  await upsertService({
    slug: "ttk-pkg-04",
    name: "Additional TikTok Video",
    category: "tiktok",
    itemType: "service",
    pricingType: "fixed",
    price: 5000,
    unit: "video",
    description: "Add-on single TikTok video to an existing package.",
    displayOrder: 73,
  });

  // ============================================================
  // CATEGORY 08: PAID ADVERTISING & ANALYTICS
  // ============================================================
  console.log("\n── Paid Advertising & Analytics ──");
  await upsertService({ slug: "ads-svc-01", name: "Facebook Ads Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 8000, adBudgetSeparate: true, displayOrder: 80 });
  await upsertService({ slug: "ads-svc-02", name: "Instagram Ads Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 8000, adBudgetSeparate: true, displayOrder: 81 });
  await upsertService({ slug: "ads-svc-03", name: "Meta Ads Management", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 15000, unit: "month", adBudgetSeparate: true, displayOrder: 82 });
  await upsertService({ slug: "ads-svc-04", name: "Google Ads Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 10000, adBudgetSeparate: true, displayOrder: 83 });
  await upsertService({ slug: "ads-svc-05", name: "Google Ads Management", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 18000, unit: "month", adBudgetSeparate: true, displayOrder: 84 });
  await upsertService({ slug: "ads-svc-06", name: "TikTok Ads Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 8000, adBudgetSeparate: true, displayOrder: 85 });
  await upsertService({ slug: "ads-svc-07", name: "Conversion Tracking Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 8000, displayOrder: 86 });
  await upsertService({ slug: "ads-svc-08", name: "Meta Pixel Installation", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 5000, displayOrder: 87 });
  await upsertService({ slug: "ads-svc-09", name: "Google Analytics 4 Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 5000, displayOrder: 88 });
  await upsertService({ slug: "ads-svc-10", name: "Google Tag Manager Setup", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 7500, displayOrder: 89 });
  await upsertService({ slug: "ads-svc-11", name: "A/B Campaign Testing", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 10000, displayOrder: 90 });
  await upsertService({ slug: "ads-svc-12", name: "Monthly Performance Report", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 5000, unit: "month", displayOrder: 91 });
  await upsertService({ slug: "ads-svc-13", name: "Marketing Consultation — 1 Hour", category: "advertising", itemType: "service", pricingType: "starting_from", startingPrice: 5000, displayOrder: 92 });

  // ============================================================
  // CATEGORY 09: CREATIVE DESIGN SERVICES
  // ============================================================
  console.log("\n── Creative Design Services ──");
  await upsertService({ slug: "crd-svc-01", name: "Social Media Post Design", category: "creative-design", itemType: "service", pricingType: "fixed", price: 1000, unit: "design", displayOrder: 100 });
  await upsertService({ slug: "crd-svc-02", name: "Carousel Design", category: "creative-design", itemType: "service", pricingType: "fixed", price: 3500, displayOrder: 101 });
  await upsertService({ slug: "crd-svc-03", name: "Short Promotional Reel", category: "creative-design", itemType: "service", pricingType: "fixed", price: 2500, displayOrder: 102 });
  await upsertService({ slug: "crd-svc-04", name: "Story Design", category: "creative-design", itemType: "service", pricingType: "fixed", price: 800, displayOrder: 103 });
  await upsertService({ slug: "crd-svc-05", name: "Advertising Banner Design", category: "creative-design", itemType: "service", pricingType: "fixed", price: 2500, displayOrder: 104 });
  await upsertService({ slug: "crd-svc-06", name: "Campaign Creative Set", category: "creative-design", itemType: "service", pricingType: "starting_from", startingPrice: 8000, displayOrder: 105 });
  await upsertService({ slug: "crd-svc-07", name: "Additional Social Media Post", category: "creative-design", itemType: "service", pricingType: "fixed", price: 900, displayOrder: 106 });
  await upsertService({ slug: "crd-svc-08", name: "Additional Reel", category: "creative-design", itemType: "service", pricingType: "fixed", price: 2000, displayOrder: 107 });
  await upsertService({ slug: "crd-svc-09", name: "Additional Platform Management", category: "creative-design", itemType: "service", pricingType: "fixed", price: 5000, unit: "month", displayOrder: 108 });
  await upsertService({ slug: "crd-svc-10", name: "Product Photography Coordination", category: "creative-design", itemType: "service", pricingType: "custom_quote", displayOrder: 109 });
  await upsertService({ slug: "crd-svc-11", name: "Copywriting", category: "creative-design", itemType: "service", pricingType: "starting_from", startingPrice: 3000, displayOrder: 110 });
  await upsertService({ slug: "crd-svc-12", name: "Influencer Campaign Planning", category: "creative-design", itemType: "service", pricingType: "custom_quote", displayOrder: 111 });

  // ============================================================
  // CATEGORY 10: ACADEMIC SOFTWARE DEVELOPMENT & MENTORING
  // ============================================================
  console.log("\n── Academic Packages ──");
  await upsertService({
    slug: "aca-pkg-01",
    name: "Project Guidance",
    category: "academic",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 10000,
    description: "Planning, requirement analysis, technology recommendation, and architecture guidance.",
    inclusions: ["Project Planning", "Requirement Analysis", "Technology Stack Recommendation", "Architecture Guidance", "Development Roadmap", "Consultation"],
    displayOrder: 120,
  });
  await upsertService({
    slug: "aca-pkg-02",
    name: "Project Development Support",
    category: "academic",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 25000,
    description: "Everything in Project Guidance plus development support, documentation, and testing.",
    inclusions: ["Everything in Project Guidance", "Software Development Support", "Database Design", "UI/UX Prototype", "Technical Documentation", "Code Review", "Testing Guidance", "2 Weeks Support"],
    displayOrder: 121,
  });
  await upsertService({
    slug: "aca-pkg-03",
    name: "Complete Project Mentoring",
    category: "academic",
    itemType: "package",
    pricingType: "starting_from",
    startingPrice: 45000,
    description: "End-to-end mentoring from architecture through viva preparation.",
    inclusions: ["End-to-End Mentoring", "Software Architecture", "AI/ML Guidance", "Web/Mobile Development Guidance", "Database Implementation", "Documentation Review", "Debugging Assistance", "Presentation Preparation", "Viva Preparation", "1 Month Support"],
    displayOrder: 122,
  });

  // ============================================================
  // CATEGORY 11: INDIVIDUAL TECHNICAL SERVICES
  // ============================================================
  console.log("\n── Individual Technical Services ──");
  await upsertService({ slug: "tec-svc-01", name: "Project Consultation — 1 Hour", category: "academic", itemType: "service", pricingType: "fixed", price: 3000, displayOrder: 130 });
  await upsertService({ slug: "tec-svc-02", name: "Software Engineering Project Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 10000, displayOrder: 131 });
  await upsertService({ slug: "tec-svc-03", name: "Web Application Development Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 20000, displayOrder: 132 });
  await upsertService({ slug: "tec-svc-04", name: "Mobile Application Development Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 25000, displayOrder: 133 });
  await upsertService({ slug: "tec-svc-05", name: "AI & Machine Learning Project Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 30000, displayOrder: 134 });
  await upsertService({ slug: "tec-svc-06", name: "Database Design & Implementation Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 10000, displayOrder: 135 });
  await upsertService({ slug: "tec-svc-07", name: "UI/UX Prototyping — Figma", category: "academic", itemType: "service", pricingType: "fixed", price: 10000, displayOrder: 136 });
  await upsertService({ slug: "tec-svc-08", name: "Technical Documentation Review", category: "academic", itemType: "service", pricingType: "fixed", price: 8000, displayOrder: 137 });
  await upsertService({ slug: "tec-svc-09", name: "Code Review & Debugging", category: "academic", itemType: "service", pricingType: "fixed", price: 5000, displayOrder: 138 });
  await upsertService({ slug: "tec-svc-10", name: "Git & GitHub Setup", category: "academic", itemType: "service", pricingType: "fixed", price: 3000, displayOrder: 139 });
  await upsertService({ slug: "tec-svc-11", name: "API Integration Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 8000, displayOrder: 140 });
  await upsertService({ slug: "tec-svc-12", name: "Deployment Guidance", category: "academic", itemType: "service", pricingType: "fixed", price: 5000, displayOrder: 141 });
  await upsertService({ slug: "tec-svc-13", name: "Final Project Presentation Coaching", category: "academic", itemType: "service", pricingType: "fixed", price: 5000, displayOrder: 142 });

  // Academic Add-Ons
  await upsertAddon({ name: "Additional Mentoring Session — 1 Hour", pricingType: "fixed", price: 2500, displayOrder: 150 });
  await upsertAddon({ name: "Extended Project Support — Weekly", pricingType: "fixed", price: 5000, unit: "week", displayOrder: 151 });
  await upsertAddon({ name: "Technical Interview Preparation", pricingType: "fixed", price: 5000, displayOrder: 152 });

  // ============================================================
  // 3. BRAIN FAQs
  // ============================================================
  console.log("\n── Brain FAQs ──");

  const faqs = [
    // Business info
    { question: "What does BrandHive Studio do?", answer: "BrandHive Studio is a premium creative agency providing Brand Strategy & Identity, Digital Experiences (websites & web apps), Growth Marketing (social media, TikTok, paid advertising), and Academic Technology services (software development mentoring).", category: "general", order: 1 },
    { question: "When are you open?", answer: "Our regular team support hours are Monday–Saturday, 9 AM–6 PM. We're closed on Sundays. Our website AI assistant is available 24/7.", category: "general", order: 2 },
    { question: "How can I contact BrandHive Studio?", answer: "You can reach us via:\n📱 WhatsApp / Phone: +94 70 641 0093\n📧 Email: brandhive.studio.lk@gmail.com\n🌐 Website: www.brandhivestudio.com.lk\nWe're also on Instagram, Facebook, and TikTok.", category: "general", order: 3 },
    { question: "Where can I see your portfolio?", answer: "Our portfolio is available at: https://brandhivestudio.com.lk/portfolio — You can view featured case studies and past projects there.", category: "general", order: 4 },

    // Pricing / payment
    { question: "How much do you charge for a logo?", answer: "Logo Design starts from LKR 8,000. If you're starting a new business and need a complete identity, our Starter Brand Identity package starts from LKR 15,000 and includes the logo, color palette, typography, and basic brand guidelines.", category: "pricing", order: 10 },
    { question: "How much does a website cost?", answer: "Our website packages start from LKR 35,000 (Starter), LKR 75,000 (Business), LKR 150,000 (Corporate), and Custom Quote for advanced web solutions. The final price depends on your specific requirements.", category: "pricing", order: 11 },
    { question: "How much does social media management cost?", answer: "Social media packages:\n• Starter Organic: LKR 14,000/month (15 posts)\n• Starter + $20 Boosting: LKR 20,000/month\n• Growth Organic: LKR 25,000/month (20 posts + 4 reels)\n• Premium Organic: LKR 40,000/month (30 posts + 8 reels)", category: "pricing", order: 12 },
    { question: "How much does TikTok video production cost?", answer: "TikTok production packages:\n• Single Video: LKR 5,000\n• Growth (4 Videos/month): LKR 18,000\n• Premium (8 Videos/month): LKR 32,000\n• Additional Video: LKR 5,000\nNote: These do not include advertising/boosting budgets.", category: "pricing", order: 13 },
    { question: "Do you require an advance payment?", answer: "Yes. For most projects, we require a 50% advance to begin, with the remaining 50% due before final delivery. Larger or custom projects may use milestone-based payments.", category: "payment", order: 14 },
    { question: "What payment methods do you accept?", answer: "We currently accept Cash and Bank Transfer.", category: "payment", order: 15 },
    { question: "Is domain and hosting included?", answer: "Domain and hosting are third-party services and are generally billed separately unless they're specifically included in your quotation.", category: "pricing", order: 16 },
    { question: "Is the advertising budget included in your social media packages?", answer: "For most packages, advertising budgets are separate from BrandHive's service fee. The only exception is the Starter $20 Boosting package (LKR 20,000/month) which explicitly includes a $20 boosting allocation.", category: "pricing", order: 17 },
    { question: "Can I get a discount?", answer: "I can check with the BrandHive team regarding a special offer for your project. 😊", category: "pricing", order: 18 },
    { question: "Can you give a custom quotation?", answer: "Yes. BrandHive Studio can prepare custom quotations based on your business goals, requirements, and project scope.", category: "pricing", order: 19 },
    { question: "How long is a quotation valid?", answer: "Quotations are valid for 30 days from the date of issue unless otherwise stated.", category: "pricing", order: 20 },

    // Services
    { question: "Do you offer individual services or only packages?", answer: "Yes, individual services are available across most categories, so you don't always need to choose a full package.", category: "services", order: 30 },
    { question: "Do you manage TikTok separately from social media?", answer: "Yes. TikTok video production is a dedicated service category. We offer TikTok video packages separately from general social media management. Note that TikTok advertising budgets are separate from production packages.", category: "services", order: 31 },
    { question: "Do you offer academic project help?", answer: "Yes. We provide mentoring, technical consultation, code review, debugging assistance, and project guidance for academic software projects. Students remain responsible for their own academic work per institutional requirements.", category: "services", order: 32 },
    { question: "Do you do website maintenance?", answer: "Yes. Website maintenance is available from LKR 8,000/month (individual service) or LKR 5,000/month (as a website add-on).", category: "services", order: 33 },
    { question: "Do you offer SEO services?", answer: "Yes. SEO Optimization starts from LKR 15,000. We also include Basic SEO in our Starter Website package and Advanced SEO in higher-tier website packages.", category: "services", order: 34 },

    // Process
    { question: "How do I get started with BrandHive Studio?", answer: "Simply tell us what you'd like to build or improve. We'll understand your requirements, recommend the most suitable service, and arrange a quotation where needed. You can reach us via WhatsApp at +94 70 641 0093 or through our website.", category: "process", order: 40 },
    { question: "What is the project process?", answer: "Our process: Discovery → Strategy → Design → Development → Launch. For larger projects, this may include milestone-based checkpoints.", category: "process", order: 41 },
    { question: "How long does a project take?", answer: "Delivery depends on the project scope, complexity, and timely client feedback. Once we understand your requirements, the BrandHive team can provide a more accurate timeline.", category: "process", order: 42 },
    { question: "How many revisions are included?", answer: "Revision availability depends on the selected package or quotation. The exact allowance is specified per package. Please ask about the specific package you're interested in.", category: "process", order: 43 },
    { question: "Who owns the final work?", answer: "Final approved deliverables are transferred to you after full payment, unless otherwise agreed in the quotation.", category: "process", order: 44 },
    { question: "What happens if I delay providing feedback or content?", answer: "Project timelines depend on client feedback, content, approvals, and required information. If client inputs are delayed, the project timeline may be extended. BrandHive may pause a project when necessary inputs are unavailable.", category: "process", order: 45 },

    // Policies
    { question: "What is the cancellation policy?", answer: "Before work begins: Cancellation may qualify for a refund of the unused advance portion after deducting completed work and non-refundable third-party costs. After work begins: Payments for completed work are non-refundable. Third-party services (domain, hosting, advertising) are subject to each provider's own terms.", category: "policies", order: 50 },
    { question: "Can I request a refund?", answer: "Refund eligibility depends on the project stage, completed work, third-party costs, and agreed terms. Please contact our Client Relations Team for review.", category: "policies", order: 51 },

    // Academic
    { question: "What academic project types do you support?", answer: "We support web applications, mobile apps, AI/ML projects, database systems, desktop applications, software engineering projects, and general software development projects at academic level.", category: "academic", order: 60 },
    { question: "Will you complete my assignment for me?", answer: "No. BrandHive provides mentoring, guidance, code review, and technical consultation only. Students remain responsible for completing and submitting their own academic work according to their institution's integrity requirements.", category: "academic", order: 61 },
  ];

  let faqOrder = 0;
  for (const faq of faqs) {
    await upsertFaq({
      slug: `faq-${faqOrder}`,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.order,
    });
    faqOrder++;
  }

  console.log("\n✅ Brain update complete!\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Brain update failed:", err);
  process.exit(1);
});
