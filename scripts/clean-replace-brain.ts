/**
 * clean-replace-brain.ts
 *
 * CLEAN BRAIN REPLACEMENT:
 * 1. Exports existing brain data to a backup JSON file.
 * 2. Deletes ALL brain_services, brain_addons, brain_faqs, and brain_settings records.
 * 3. Inserts the authoritative spec data fresh — no duplicates, no stale records.
 *
 * Safe: does NOT touch projects, testimonials, inquiries, or any other tables.
 *
 * Run with: npx tsx scripts/clean-replace-brain.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db/index";
import { brainServices, brainAddons, brainFaqs, brainSettings } from "../src/lib/db/schema";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const BACKUP_DIR = path.join(process.cwd(), "scripts", "brain-backup");

// ============================================================
// STEP 1: BACKUP EXISTING DATA
// ============================================================
async function backup() {
  console.log("📦 Backing up existing brain data...");
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const [svcs, addons, faqs, settings] = await Promise.all([
    db.select().from(brainServices),
    db.select().from(brainAddons),
    db.select().from(brainFaqs),
    db.select().from(brainSettings),
  ]);

  const backupData = { timestamp, svcs, addons, faqs, settings };
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

  console.log(`  ✓ Backup saved: ${backupPath}`);
  console.log(`  → Services: ${svcs.length}, Add-ons: ${addons.length}, FAQs: ${faqs.length}, Settings: ${settings.length}`);
  return { svcs, addons, faqs, settings };
}

// ============================================================
// STEP 2: DELETE ALL BRAIN RECORDS
// ============================================================
async function clearAll() {
  console.log("\n🗑  Clearing all brain tables...");
  await db.delete(brainAddons);
  await db.delete(brainServices);
  await db.delete(brainFaqs);
  await db.delete(brainSettings);
  console.log("  ✓ All brain tables cleared");
}

// ============================================================
// STEP 3: FRESH INSERT FROM SPEC
// ============================================================

type PricingType = "fixed" | "starting_from" | "custom_quote";
type ItemType = "service" | "package";

interface ServiceDef {
  slug: string;
  name: string;
  description?: string;
  category: string;
  itemType: ItemType;
  pricingType: PricingType;
  price?: number;
  startingPrice?: number;
  currency?: string;
  unit?: string;
  adBudgetSeparate?: boolean;
  inclusions?: string[];
  displayOrder: number;
}

interface AddonDef {
  name: string;
  description?: string;
  pricingType: PricingType;
  price?: number;
  startingPrice?: number;
  unit?: string;
  displayOrder: number;
}

interface FaqDef {
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
}

interface SettingDef {
  key: string;
  value: string;
  description: string;
}

// ── SERVICES ──────────────────────────────────────────────────

const SERVICES: ServiceDef[] = [
  // CAT 01: Brand Identity Packages
  { slug:"brd-pkg-01", name:"Starter Brand Identity", category:"branding", itemType:"package", pricingType:"starting_from", startingPrice:15000, description:"Foundational brand identity for startups and small businesses.", inclusions:["Logo Design","Color Palette","Typography Selection","Basic Brand Guidelines"], displayOrder:10 },
  { slug:"brd-pkg-02", name:"Business Brand Identity", category:"branding", itemType:"package", pricingType:"starting_from", startingPrice:35000, description:"Professional identity system for growing businesses.", inclusions:["Logo Design","Color Palette","Typography","Business Card","Letterhead","Social Media Profile Kit","Extended Brand Guidelines"], displayOrder:11 },
  { slug:"brd-pkg-03", name:"Premium Brand Identity", category:"branding", itemType:"package", pricingType:"starting_from", startingPrice:75000, description:"Complete brand system for established businesses.", inclusions:["Everything in Business","Brand Strategy","Stationery Set","Social Media Templates","Marketing Assets"], displayOrder:12 },
  { slug:"brd-pkg-04", name:"Enterprise Brand Identity", category:"branding", itemType:"package", pricingType:"custom_quote", description:"Fully customized corporate identity for organizations.", inclusions:["Fully Customized Corporate Identity","Scope Defined by Quotation"], displayOrder:13 },

  // CAT 02: Individual Branding Services
  { slug:"brd-svc-01", name:"Logo Design", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:8000, description:"Professional custom logo design.", displayOrder:20 },
  { slug:"brd-svc-02", name:"Logo Redesign", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:10000, description:"Modernize or refresh an existing logo.", displayOrder:21 },
  { slug:"brd-svc-03", name:"Brand Color Palette", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:4000, description:"Professional brand color system.", displayOrder:22 },
  { slug:"brd-svc-04", name:"Typography System", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:3500, description:"Curated brand typography selection.", displayOrder:23 },
  { slug:"brd-svc-05", name:"Business Card Design", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:3000, description:"Professional business card design.", displayOrder:24 },
  { slug:"brd-svc-06", name:"Letterhead Design", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:3500, description:"Corporate letterhead design.", displayOrder:25 },
  { slug:"brd-svc-07", name:"Email Signature Design", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:2500, description:"Professional email signature.", displayOrder:26 },
  { slug:"brd-svc-08", name:"Social Media Branding Kit", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:8000, description:"Branded social media profile and cover assets.", displayOrder:27 },
  { slug:"brd-svc-09", name:"Brand Guidelines Document", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:15000, description:"Comprehensive brand usage guidelines.", displayOrder:28 },
  { slug:"brd-svc-10", name:"Complete Stationery Design", category:"branding", itemType:"service", pricingType:"starting_from", startingPrice:12000, description:"Full stationery suite.", displayOrder:29 },

  // CAT 03: Website Packages
  { slug:"web-pkg-01", name:"Starter Website", category:"website", itemType:"package", pricingType:"starting_from", startingPrice:35000, description:"For startups and small businesses.", inclusions:["Up to 5 Pages","Responsive Design","Contact Form","Basic SEO","Google Maps"], displayOrder:30 },
  { slug:"web-pkg-02", name:"Business Website", category:"website", itemType:"package", pricingType:"starting_from", startingPrice:75000, description:"For growing businesses.", inclusions:["Up to 10 Pages","Premium UI","CMS Integration","Advanced SEO","Blog","Analytics"], displayOrder:31 },
  { slug:"web-pkg-03", name:"Corporate Website", category:"website", itemType:"package", pricingType:"starting_from", startingPrice:150000, description:"For established businesses and organizations.", inclusions:["Unlimited Pages","Custom UI/UX","Performance Optimization","Advanced SEO","Security","Speed Optimization"], displayOrder:32 },
  { slug:"web-pkg-04", name:"Custom Web Solution", category:"website", itemType:"package", pricingType:"custom_quote", description:"Custom digital platforms, dashboards, or enterprise systems.", inclusions:["Custom Features","Business Systems","Dashboards","API Integration","Database Design","Enterprise Development"], displayOrder:33 },

  // CAT 04: Individual Website Services
  { slug:"web-svc-01", name:"Landing Page Design", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:15000, displayOrder:40 },
  { slug:"web-svc-02", name:"Website Redesign", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:25000, displayOrder:41 },
  { slug:"web-svc-03", name:"E-Commerce Website", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:75000, displayOrder:42 },
  { slug:"web-svc-04", name:"Corporate Website Development", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:85000, displayOrder:43 },
  { slug:"web-svc-05", name:"Website Speed Optimization", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:10000, displayOrder:44 },
  { slug:"web-svc-06", name:"UI/UX Design", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:20000, displayOrder:45 },
  { slug:"web-svc-07", name:"Business Website Development", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:35000, displayOrder:46 },
  { slug:"web-svc-08", name:"Portfolio Website", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:25000, displayOrder:47 },
  { slug:"web-svc-09", name:"Website Maintenance", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:8000, unit:"month", displayOrder:48 },
  { slug:"web-svc-10", name:"SEO Optimization", category:"website", itemType:"service", pricingType:"starting_from", startingPrice:15000, displayOrder:49 },

  // CAT 06: Social Media Marketing
  { slug:"smm-pkg-01a", name:"Social Media Starter — Organic", category:"social-media", itemType:"package", pricingType:"fixed", price:14000, unit:"month", adBudgetSeparate:false, description:"Organic-only starter for small businesses.", inclusions:["15 Custom Posts","Facebook","Instagram","Caption Writing","Content Planning","Basic Management"], displayOrder:60 },
  { slug:"smm-pkg-01b", name:"Social Media Starter — $20 Boosting", category:"social-media", itemType:"package", pricingType:"fixed", price:20000, unit:"month", adBudgetSeparate:false, description:"Starter with $20 boosting allocation explicitly included.", inclusions:["15 Custom Posts","Facebook","Instagram","Caption Writing","Content Planning","Basic Management","$20 Boosting Allocation"], displayOrder:61 },
  { slug:"smm-pkg-02a", name:"Social Media Growth — Organic", category:"social-media", itemType:"package", pricingType:"fixed", price:25000, unit:"month", adBudgetSeparate:false, description:"Grow with posts and reels across Facebook, Instagram, TikTok.", inclusions:["20 Custom Posts","4 Short Reels","Facebook","Instagram","TikTok Management","Caption Writing","Content Calendar","Basic Community Management","Monthly Analytics Report"], displayOrder:62 },
  { slug:"smm-pkg-02b", name:"Social Media Growth — With Boosting", category:"social-media", itemType:"package", pricingType:"starting_from", startingPrice:25000, unit:"month", adBudgetSeparate:true, description:"Growth package with optional ad budget added separately.", inclusions:["Everything in Growth Organic","Selected Ad Budget Added Separately"], displayOrder:63 },
  { slug:"smm-pkg-03a", name:"Social Media Premium — Organic", category:"social-media", itemType:"package", pricingType:"fixed", price:40000, unit:"month", adBudgetSeparate:false, description:"Full-service premium management.", inclusions:["30 Custom Posts","8 Short Reels","Facebook","Instagram","TikTok","Premium Graphic Design","Content Strategy","Community Management","Monthly Performance Report","Strategy Meeting","Priority Support"], displayOrder:64 },
  { slug:"smm-pkg-03b", name:"Social Media Premium — With Boosting", category:"social-media", itemType:"package", pricingType:"starting_from", startingPrice:40000, unit:"month", adBudgetSeparate:true, description:"Premium package with optional ad budget added separately.", inclusions:["Everything in Premium Organic","Selected Ad Budget Added Separately"], displayOrder:65 },

  // CAT 07: TikTok Video Production
  { slug:"ttk-pkg-01", name:"TikTok Starter — Single Video", category:"tiktok", itemType:"package", pricingType:"fixed", price:5000, unit:"video", adBudgetSeparate:false, description:"Single TikTok video with client-location shoot, edit, and upload.", inclusions:["1 TikTok Video","Product / Shop / Promotional Video","Client-Location Visit","Small On-Location Shoot","Video Editing","TikTok Upload"], displayOrder:70 },
  { slug:"ttk-pkg-02", name:"TikTok Growth — 4 Videos", category:"tiktok", itemType:"package", pricingType:"fixed", price:18000, unit:"month", adBudgetSeparate:false, description:"4 TikTok videos per month.", inclusions:["4 TikTok Videos","On-Location Shooting","Product / Shop / Promotional Videos","Video Editing","Captions","TikTok Uploads","Basic Monthly Content Planning"], displayOrder:71 },
  { slug:"ttk-pkg-03", name:"TikTok Premium — 8 Videos", category:"tiktok", itemType:"package", pricingType:"fixed", price:32000, unit:"month", adBudgetSeparate:false, description:"8 TikTok videos per month with professional editing and optimization.", inclusions:["8 TikTok Videos","On-Location Shooting","Promotional Concepts","Professional Editing","Captions","TikTok Uploads","Monthly Content Planning","Content Optimization"], displayOrder:72 },
  { slug:"ttk-pkg-04", name:"Additional TikTok Video", category:"tiktok", itemType:"service", pricingType:"fixed", price:5000, unit:"video", description:"Add-on single TikTok video.", displayOrder:73 },

  // CAT 08: Paid Advertising & Analytics
  { slug:"ads-svc-01", name:"Facebook Ads Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:8000, adBudgetSeparate:true, displayOrder:80 },
  { slug:"ads-svc-02", name:"Instagram Ads Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:8000, adBudgetSeparate:true, displayOrder:81 },
  { slug:"ads-svc-03", name:"Meta Ads Management", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:15000, unit:"month", adBudgetSeparate:true, displayOrder:82 },
  { slug:"ads-svc-04", name:"Google Ads Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:10000, adBudgetSeparate:true, displayOrder:83 },
  { slug:"ads-svc-05", name:"Google Ads Management", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:18000, unit:"month", adBudgetSeparate:true, displayOrder:84 },
  { slug:"ads-svc-06", name:"TikTok Ads Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:8000, adBudgetSeparate:true, displayOrder:85 },
  { slug:"ads-svc-07", name:"Conversion Tracking Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:8000, displayOrder:86 },
  { slug:"ads-svc-08", name:"Meta Pixel Installation", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:5000, displayOrder:87 },
  { slug:"ads-svc-09", name:"Google Analytics 4 Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:5000, displayOrder:88 },
  { slug:"ads-svc-10", name:"Google Tag Manager Setup", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:7500, displayOrder:89 },
  { slug:"ads-svc-11", name:"A/B Campaign Testing", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:10000, displayOrder:90 },
  { slug:"ads-svc-12", name:"Monthly Performance Report", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:5000, unit:"month", displayOrder:91 },
  { slug:"ads-svc-13", name:"Marketing Consultation — 1 Hour", category:"advertising", itemType:"service", pricingType:"starting_from", startingPrice:5000, displayOrder:92 },

  // CAT 09: Creative Design Services
  { slug:"crd-svc-01", name:"Social Media Post Design", category:"creative-design", itemType:"service", pricingType:"fixed", price:1000, unit:"design", displayOrder:100 },
  { slug:"crd-svc-02", name:"Carousel Design", category:"creative-design", itemType:"service", pricingType:"fixed", price:3500, displayOrder:101 },
  { slug:"crd-svc-03", name:"Short Promotional Reel", category:"creative-design", itemType:"service", pricingType:"fixed", price:2500, displayOrder:102 },
  { slug:"crd-svc-04", name:"Story Design", category:"creative-design", itemType:"service", pricingType:"fixed", price:800, displayOrder:103 },
  { slug:"crd-svc-05", name:"Advertising Banner Design", category:"creative-design", itemType:"service", pricingType:"fixed", price:2500, displayOrder:104 },
  { slug:"crd-svc-06", name:"Campaign Creative Set", category:"creative-design", itemType:"service", pricingType:"starting_from", startingPrice:8000, displayOrder:105 },
  { slug:"crd-svc-07", name:"Additional Social Media Post", category:"creative-design", itemType:"service", pricingType:"fixed", price:900, displayOrder:106 },
  { slug:"crd-svc-08", name:"Additional Reel", category:"creative-design", itemType:"service", pricingType:"fixed", price:2000, displayOrder:107 },
  { slug:"crd-svc-09", name:"Additional Platform Management", category:"creative-design", itemType:"service", pricingType:"fixed", price:5000, unit:"month", displayOrder:108 },
  { slug:"crd-svc-10", name:"Product Photography Coordination", category:"creative-design", itemType:"service", pricingType:"custom_quote", displayOrder:109 },
  { slug:"crd-svc-11", name:"Copywriting", category:"creative-design", itemType:"service", pricingType:"starting_from", startingPrice:3000, displayOrder:110 },
  { slug:"crd-svc-12", name:"Influencer Campaign Planning", category:"creative-design", itemType:"service", pricingType:"custom_quote", displayOrder:111 },

  // CAT 10: Academic Packages
  { slug:"aca-pkg-01", name:"Project Guidance", category:"academic", itemType:"package", pricingType:"starting_from", startingPrice:10000, description:"Planning, requirement analysis, technology recommendation.", inclusions:["Project Planning","Requirement Analysis","Technology Stack Recommendation","Architecture Guidance","Development Roadmap","Consultation"], displayOrder:120 },
  { slug:"aca-pkg-02", name:"Project Development Support", category:"academic", itemType:"package", pricingType:"starting_from", startingPrice:25000, description:"Full development support with documentation and testing.", inclusions:["Everything in Project Guidance","Software Development Support","Database Design","UI/UX Prototype","Technical Documentation","Code Review","Testing Guidance","2 Weeks Support"], displayOrder:121 },
  { slug:"aca-pkg-03", name:"Complete Project Mentoring", category:"academic", itemType:"package", pricingType:"starting_from", startingPrice:45000, description:"End-to-end mentoring from architecture through viva preparation.", inclusions:["End-to-End Mentoring","Software Architecture","AI/ML Guidance","Web/Mobile Development Guidance","Database Implementation","Documentation Review","Debugging Assistance","Presentation Preparation","Viva Preparation","1 Month Support"], displayOrder:122 },

  // CAT 11: Individual Technical Services
  { slug:"tec-svc-01", name:"Project Consultation — 1 Hour", category:"academic", itemType:"service", pricingType:"fixed", price:3000, displayOrder:130 },
  { slug:"tec-svc-02", name:"Software Engineering Project Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:10000, displayOrder:131 },
  { slug:"tec-svc-03", name:"Web Application Development Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:20000, displayOrder:132 },
  { slug:"tec-svc-04", name:"Mobile Application Development Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:25000, displayOrder:133 },
  { slug:"tec-svc-05", name:"AI & Machine Learning Project Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:30000, displayOrder:134 },
  { slug:"tec-svc-06", name:"Database Design & Implementation Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:10000, displayOrder:135 },
  { slug:"tec-svc-07", name:"UI/UX Prototyping — Figma", category:"academic", itemType:"service", pricingType:"fixed", price:10000, displayOrder:136 },
  { slug:"tec-svc-08", name:"Technical Documentation Review", category:"academic", itemType:"service", pricingType:"fixed", price:8000, displayOrder:137 },
  { slug:"tec-svc-09", name:"Code Review & Debugging", category:"academic", itemType:"service", pricingType:"fixed", price:5000, displayOrder:138 },
  { slug:"tec-svc-10", name:"Git & GitHub Setup", category:"academic", itemType:"service", pricingType:"fixed", price:3000, displayOrder:139 },
  { slug:"tec-svc-11", name:"API Integration Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:8000, displayOrder:140 },
  { slug:"tec-svc-12", name:"Deployment Guidance", category:"academic", itemType:"service", pricingType:"fixed", price:5000, displayOrder:141 },
  { slug:"tec-svc-13", name:"Final Project Presentation Coaching", category:"academic", itemType:"service", pricingType:"fixed", price:5000, displayOrder:142 },
];

// ── ADD-ONS ───────────────────────────────────────────────────

const ADDONS: AddonDef[] = [
  // Website add-ons (CAT 05)
  { name:"Additional Page", pricingType:"starting_from", startingPrice:4000, displayOrder:50 },
  { name:"Blog Setup", pricingType:"starting_from", startingPrice:7500, displayOrder:51 },
  { name:"Booking System", pricingType:"starting_from", startingPrice:15000, displayOrder:52 },
  { name:"Online Payment Gateway", pricingType:"starting_from", startingPrice:15000, displayOrder:53 },
  { name:"Live Chat Integration", pricingType:"starting_from", startingPrice:4000, displayOrder:54 },
  { name:"WhatsApp Chat Integration", pricingType:"starting_from", startingPrice:2500, displayOrder:55 },
  { name:"Multilingual Website", pricingType:"starting_from", startingPrice:20000, displayOrder:56 },
  { name:"Website Maintenance (Monthly)", pricingType:"starting_from", startingPrice:5000, unit:"month", displayOrder:57 },
  { name:"Monthly Content Updates", pricingType:"starting_from", startingPrice:5000, unit:"month", displayOrder:58 },
  { name:"Website Backup & Security Monitoring", pricingType:"starting_from", startingPrice:3500, unit:"month", displayOrder:59 },
  // Academic add-ons
  { name:"Additional Mentoring Session — 1 Hour", pricingType:"fixed", price:2500, displayOrder:150 },
  { name:"Extended Project Support — Weekly", pricingType:"fixed", price:5000, unit:"week", displayOrder:151 },
  { name:"Technical Interview Preparation", pricingType:"fixed", price:5000, displayOrder:152 },
];

// ── FAQs ──────────────────────────────────────────────────────

const FAQS: FaqDef[] = [
  { question:"What does BrandHive Studio do?", answer:"BrandHive Studio is a premium creative agency providing Brand Strategy & Identity, Digital Experiences (websites & web apps), Growth Marketing (social media, TikTok, paid advertising), and Academic Technology services (software development mentoring).", category:"general", displayOrder:1 },
  { question:"When are you open?", answer:"Our regular team support hours are Monday–Saturday, 9 AM–6 PM. We're closed on Sundays. Our website AI assistant is available 24/7.", category:"general", displayOrder:2 },
  { question:"How can I contact BrandHive Studio?", answer:"You can reach us via:\n📱 WhatsApp / Phone: +94 70 641 0093\n📧 Email: brandhive.studio.lk@gmail.com\n🌐 Website: www.brandhivestudio.com.lk\nWe're also on Instagram, Facebook, and TikTok.", category:"general", displayOrder:3 },
  { question:"Where can I see your portfolio?", answer:"Our portfolio is available at: https://brandhivestudio.com.lk/portfolio", category:"general", displayOrder:4 },
  { question:"How much do you charge for a logo?", answer:"Logo Design starts from LKR 8,000. If you're starting a new business and need a complete identity, our Starter Brand Identity package starts from LKR 15,000 and includes the logo, color palette, typography, and basic brand guidelines.", category:"pricing", displayOrder:10 },
  { question:"How much does a website cost?", answer:"Our website packages:\n• Starter Website — from LKR 35,000 (up to 5 pages)\n• Business Website — from LKR 75,000 (up to 10 pages)\n• Corporate Website — from LKR 150,000 (unlimited pages)\n• Custom Web Solution — Custom Quote\nThe final price depends on your specific requirements.", category:"pricing", displayOrder:11 },
  { question:"How much does social media management cost?", answer:"Our social media packages:\n• Starter Organic: LKR 14,000/month (15 posts, Facebook & Instagram)\n• Starter + $20 Boosting: LKR 20,000/month\n• Growth Organic: LKR 25,000/month (20 posts + 4 reels)\n• Growth + Boosting: LKR 25,000/month + ad budget\n• Premium Organic: LKR 40,000/month (30 posts + 8 reels)\n• Premium + Boosting: LKR 40,000/month + ad budget", category:"pricing", displayOrder:12 },
  { question:"How much does TikTok video production cost?", answer:"TikTok production packages (no boosting included):\n• Single Video: LKR 5,000\n• Growth — 4 Videos/month: LKR 18,000\n• Premium — 8 Videos/month: LKR 32,000\n• Additional Video: LKR 5,000\nTikTok advertising budgets are separate.", category:"pricing", displayOrder:13 },
  { question:"Do you require an advance payment?", answer:"Yes. For most projects, we require a 50% advance to begin, with the remaining 50% due before final delivery. Larger or custom projects may use milestone-based payments.", category:"payment", displayOrder:14 },
  { question:"What payment methods do you accept?", answer:"We accept Cash and Bank Transfer.", category:"payment", displayOrder:15 },
  { question:"Is domain and hosting included?", answer:"Domain and hosting are third-party services and are billed separately unless specifically included in your quotation.", category:"pricing", displayOrder:16 },
  { question:"Is the advertising budget included in your social media packages?", answer:"For most packages, advertising budgets are separate from BrandHive's service fee. The only exception is the Starter $20 Boosting package (LKR 20,000/month) which explicitly includes a $20 boosting allocation.", category:"pricing", displayOrder:17 },
  { question:"Can I get a discount?", answer:"I can check with the BrandHive team regarding a special offer for your project. 😊", category:"pricing", displayOrder:18 },
  { question:"Can you give a custom quotation?", answer:"Yes. BrandHive Studio can prepare custom quotations based on your business goals, requirements, and project scope.", category:"pricing", displayOrder:19 },
  { question:"How long is a quotation valid?", answer:"Quotations are valid for 30 days from the date of issue unless otherwise stated.", category:"pricing", displayOrder:20 },
  { question:"Do you offer individual services or only packages?", answer:"Individual services are available across most categories, so you don't always need to choose a full package.", category:"services", displayOrder:30 },
  { question:"Do you manage TikTok separately from social media?", answer:"Yes. TikTok video production is a separate service category. TikTok advertising budgets are also separate from production packages.", category:"services", displayOrder:31 },
  { question:"Do you offer academic project help?", answer:"Yes. We provide mentoring, technical consultation, code review, debugging, and project guidance for academic software projects. Students remain responsible for their own academic work.", category:"services", displayOrder:32 },
  { question:"Do you do website maintenance?", answer:"Yes. Website maintenance is available from LKR 8,000/month (individual service) or LKR 5,000/month (add-on).", category:"services", displayOrder:33 },
  { question:"Do you offer SEO services?", answer:"Yes. SEO Optimization starts from LKR 15,000. Basic SEO is also included in the Starter Website package, and Advanced SEO is in higher-tier packages.", category:"services", displayOrder:34 },
  { question:"How do I get started with BrandHive Studio?", answer:"Simply tell us what you'd like to build or improve. We'll understand your requirements, recommend the most suitable service, and arrange a quotation where needed. You can reach us via WhatsApp at +94 70 641 0093.", category:"process", displayOrder:40 },
  { question:"What is the project process?", answer:"Discovery → Strategy → Design → Development → Launch. Larger projects may include milestone-based checkpoints.", category:"process", displayOrder:41 },
  { question:"How long does a project take?", answer:"Delivery depends on the project scope, complexity, and timely client feedback. Once we understand your requirements, the BrandHive team can provide an accurate timeline.", category:"process", displayOrder:42 },
  { question:"How many revisions are included?", answer:"Revision availability depends on the selected package or quotation. The exact allowance is specified per package.", category:"process", displayOrder:43 },
  { question:"Who owns the final work?", answer:"Final approved deliverables are transferred to you after full payment, unless otherwise agreed in the quotation.", category:"process", displayOrder:44 },
  { question:"What happens if I delay providing feedback or content?", answer:"Project timelines depend on client feedback, content, and approvals. If client inputs are delayed, the timeline may extend. BrandHive may pause a project when necessary inputs are unavailable.", category:"process", displayOrder:45 },
  { question:"What is the cancellation policy?", answer:"Before work begins: Cancellation may qualify for a refund of the unused advance portion after deducting completed work and non-refundable third-party costs.\nAfter work begins: Payments for completed work are non-refundable. Third-party services are subject to each provider's own terms.", category:"policies", displayOrder:50 },
  { question:"Can I request a refund?", answer:"Refund eligibility depends on the project stage, completed work, third-party costs, and agreed terms. Please contact our Client Relations Team for review.", category:"policies", displayOrder:51 },
  { question:"What academic project types do you support?", answer:"We support web applications, mobile apps, AI/ML projects, database systems, software engineering projects, and general academic software development.", category:"academic", displayOrder:60 },
  { question:"Will you complete my assignment for me?", answer:"No. BrandHive provides mentoring, guidance, code review, and technical consultation. Students remain responsible for completing and submitting their own academic work per their institution's integrity requirements.", category:"academic", displayOrder:61 },
];

// ── SETTINGS ──────────────────────────────────────────────────

const SETTINGS: SettingDef[] = [
  { key:"business_name", value:"BrandHive Studio", description:"Official business name" },
  { key:"slogan", value:"Crafting Brands That Inspire", description:"Official business tagline" },
  { key:"contact_phone_whatsapp", value:"+94 70 641 0093", description:"Primary WhatsApp and phone number" },
  { key:"contact_email", value:"brandhive.studio.lk@gmail.com", description:"Primary contact email" },
  { key:"website_url", value:"https://brandhivestudio.com.lk", description:"Official website URL" },
  { key:"business_hours", value:"Monday–Saturday: 9:00 AM – 6:00 PM. Sunday: Closed. Timezone: Asia/Colombo (UTC+5:30).", description:"Human support business hours" },
  { key:"payment_terms_standard", value:"50% advance to initiate project. Remaining 50% due before final delivery. Larger or custom projects may use milestone-based payments.", description:"Standard payment terms" },
  { key:"payment_methods", value:"Cash, Bank Transfer", description:"Accepted payment methods" },
  { key:"portfolio_url", value:"https://brandhivestudio.com.lk/portfolio", description:"Portfolio page URL" },
  { key:"social_instagram", value:"https://www.instagram.com/brandhivestudiolk", description:"Official Instagram" },
  { key:"social_facebook", value:"https://www.facebook.com/brandhivestudiolk", description:"Official Facebook" },
  { key:"social_tiktok", value:"https://www.tiktok.com/@brandhivestudiolk", description:"Official TikTok" },
  { key:"cancellation_policy", value:"Before work begins: Cancellation may qualify for a refund of the unused advance portion after deducting completed work and non-refundable third-party costs. After work begins: Payments for completed work are non-refundable. Third-party services are subject to each provider's own terms.", description:"Cancellation and refund policy" },
  { key:"revision_policy", value:"Revision availability depends on the selected package or quotation. The exact allowance is specified per package.", description:"Revision policy" },
  { key:"ownership_policy", value:"Final approved deliverables are transferred after full payment unless otherwise agreed in the quotation.", description:"IP ownership transfer policy" },
  { key:"third_party_costs_policy", value:"Domain, hosting, advertising budgets, premium subscriptions, payment gateway charges, and other third-party costs are billed separately unless explicitly included in a quotation.", description:"Third-party cost disclaimer" },
  { key:"advertising_budget_policy", value:"Advertising budgets are separate from BrandHive service fees unless a specific offering explicitly includes an allocation.", description:"Advertising budget separation rule" },
  { key:"quotation_validity", value:"30 days from the date of issue unless otherwise stated.", description:"Standard quotation validity" },
  { key:"discount_policy", value:"BrandHive AI may only communicate officially active promotions stored in the system. The AI cannot invent, negotiate, or promise discounts independently.", description:"Discount authorization rule" },
  { key:"ai_model", value:"gemini-3.8-flash", description:"Primary Gemini model for HIVE AI website chat" },
  { key:"core_services_summary", value:"Brand Strategy & Identity, Digital Experiences (websites, web apps), Growth Marketing (social media, TikTok, paid advertising), Academic Technology (software development mentoring)", description:"Core service areas summary" },
  { key:"business_registration_policy", value:"Registration status is internal. Do not disclose, confirm, or deny. Escalate to Client Relations Team if asked.", description:"Business registration disclosure policy" },
  { key:"payment_security_policy", value:"Never request OTP, card PIN, banking password, or sensitive payment credentials. Bank details must come from secure authorized payment system only.", description:"Payment security rules" },
  { key:"academic_integrity_policy", value:"BrandHive provides mentoring, guidance, code review, and technical consulting. Students remain responsible for completing and submitting their own academic work per institutional requirements.", description:"Academic integrity disclaimer" },
  { key:"human_handoff_role", value:"BrandHive Studio Client Relations Team", description:"Official human handoff team name" },
  { key:"whatsapp_ai_availability", value:"24/7 when automation is operational. Human support: Monday–Saturday, 9AM–6PM. Sunday: Closed.", description:"AI vs human availability" },
];

async function insertFresh() {
  const now = new Date();

  console.log("\n✍  Inserting fresh spec data...");

  // Services
  for (const svc of SERVICES) {
    await db.insert(brainServices).values({
      id: randomUUID(),
      slug: svc.slug,
      name: svc.name,
      description: svc.description ?? null,
      category: svc.category,
      itemType: svc.itemType,
      pricingType: svc.pricingType,
      price: svc.price ?? null,
      startingPrice: svc.startingPrice ?? null,
      currency: "LKR",
      unit: svc.unit ?? null,
      adBudgetSeparate: svc.adBudgetSeparate ?? false,
      inclusions: svc.inclusions ? JSON.stringify(svc.inclusions) : null,
      isActive: true,
      displayOrder: svc.displayOrder,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  ✓ Inserted ${SERVICES.length} services/packages`);

  // Add-ons
  for (const addon of ADDONS) {
    await db.insert(brainAddons).values({
      id: randomUUID(),
      serviceId: null,
      name: addon.name,
      description: addon.description ?? null,
      pricingType: addon.pricingType,
      price: (addon as { price?: number }).price ?? null,
      startingPrice: addon.startingPrice ?? null,
      currency: "LKR",
      unit: addon.unit ?? null,
      isActive: true,
      displayOrder: addon.displayOrder,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  ✓ Inserted ${ADDONS.length} add-ons`);

  // FAQs
  for (const faq of FAQS) {
    await db.insert(brainFaqs).values({
      id: randomUUID(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: true,
      displayOrder: faq.displayOrder,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  ✓ Inserted ${FAQS.length} FAQs`);

  // Settings
  for (const setting of SETTINGS) {
    await db.insert(brainSettings).values({
      id: randomUUID(),
      key: setting.key,
      value: setting.value,
      description: setting.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  console.log(`  ✓ Inserted ${SETTINGS.length} settings`);
}

// ============================================================
// STEP 4: VERIFICATION
// ============================================================
async function verify() {
  console.log("\n🔍 Verifying post-replacement state...");
  const [svcs, addons, faqs, settings] = await Promise.all([
    db.select({ slug: brainServices.slug, name: brainServices.name, price: brainServices.price, startingPrice: brainServices.startingPrice, pricingType: brainServices.pricingType }).from(brainServices),
    db.select({ name: brainAddons.name }).from(brainAddons),
    db.select({ q: brainFaqs.question, cat: brainFaqs.category }).from(brainFaqs),
    db.select({ key: brainSettings.key, val: brainSettings.value }).from(brainSettings),
  ]);

  console.log(`  ✓ brain_services: ${svcs.length} records (expected ${SERVICES.length})`);
  console.log(`  ✓ brain_addons: ${addons.length} records (expected ${ADDONS.length})`);
  console.log(`  ✓ brain_faqs: ${faqs.length} records (expected ${FAQS.length})`);
  console.log(`  ✓ brain_settings: ${settings.length} records (expected ${SETTINGS.length})`);

  // Spot-check specific prices
  const logoSvc = svcs.find(s => s.slug === "brd-svc-01");
  const smm01a = svcs.find(s => s.slug === "smm-pkg-01a");
  const ttk02 = svcs.find(s => s.slug === "ttk-pkg-02");
  const webPkg01 = svcs.find(s => s.slug === "web-pkg-01");
  const aiModelSetting = settings.find(s => s.key === "ai_model");
  const businessNameSetting = settings.find(s => s.key === "business_name");

  console.log("\n  Spot-check prices:");
  console.log(`    Logo Design (brd-svc-01): starting from ${logoSvc?.startingPrice} LKR [expected: 8000]`);
  console.log(`    SMM Starter Organic (smm-pkg-01a): ${smm01a?.price} LKR/mo [expected: 14000]`);
  console.log(`    TikTok Growth 4 Videos (ttk-pkg-02): ${ttk02?.price} LKR/mo [expected: 18000]`);
  console.log(`    Starter Website (web-pkg-01): starting from ${webPkg01?.startingPrice} LKR [expected: 35000]`);

  console.log("\n  Settings spot-check:");
  console.log(`    ai_model: "${aiModelSetting?.val}" [expected: gemini-3.8-flash]`);
  console.log(`    business_name: "${businessNameSetting?.val}" [expected: BrandHive Studio]`);

  const issues = [];
  if (svcs.length !== SERVICES.length) issues.push(`Services count mismatch: ${svcs.length} vs ${SERVICES.length}`);
  if (addons.length !== ADDONS.length) issues.push(`Addons count mismatch: ${addons.length} vs ${ADDONS.length}`);
  if (faqs.length !== FAQS.length) issues.push(`FAQs count mismatch: ${faqs.length} vs ${FAQS.length}`);
  if (settings.length !== SETTINGS.length) issues.push(`Settings count mismatch: ${settings.length} vs ${SETTINGS.length}`);
  if (logoSvc?.startingPrice !== 8000) issues.push("Logo price mismatch");
  if (smm01a?.price !== 14000) issues.push("SMM starter price mismatch");
  if (ttk02?.price !== 18000) issues.push("TikTok growth price mismatch");
  if (aiModelSetting?.val !== "gemini-3.8-flash") issues.push("ai_model setting mismatch");

  if (issues.length > 0) {
    console.error("\n  ❌ Verification FAILED:");
    issues.forEach(i => console.error(`    - ${i}`));
    return false;
  }

  console.log("\n  ✅ All verification checks PASSED");
  return true;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log("\n🐝 BrandHive Studio — Clean Brain Replacement\n");
  console.log("⚠  This will DELETE all existing brain data and replace from spec.\n");

  try {
    await backup();
    await clearAll();
    await insertFresh();
    const ok = await verify();
    if (!ok) {
      console.error("\n❌ Script completed with verification errors. Check backup file and investigate.");
      process.exit(1);
    }
    console.log("\n✅ Brain clean replacement complete!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  }
}

main();
