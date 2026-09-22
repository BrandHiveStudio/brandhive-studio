import {
  getBrainServices,
  getBrainAddons,
  getBrainFaqs,
  getBrainSettings,
} from "@/lib/db/queries/brain";
import type { BrainService, BrainAddon, BrainFaq, BrainSetting } from "@/lib/db/schema";

export interface CompanyProfile {
  name: string;
  tagline: string;
  contactNumber: string;
  whatsappUrl: string;
  email: string;
  websiteUrl: string;
  businessHours?: string;
  paymentTerms?: string;
  paymentMethods?: string;
  process: string[];
}

export const fallbackCompanyProfile: CompanyProfile = {
  name: "BrandHive Studio",
  tagline: "Crafting Brands That Inspire",
  contactNumber: "+94 70 641 0093",
  whatsappUrl: "https://wa.me/94706410093",
  email: "brandhive.studio.lk@gmail.com",
  websiteUrl: "https://brandhivestudio.com.lk",
  businessHours: "Monday to Saturday: 9:00 AM – 6:00 PM, Sunday: Closed (Asia/Colombo, UTC+5:30)",
  paymentTerms: "50% advance to initiate project, 50% upon final delivery.",
  paymentMethods: "Cash, Bank Transfer",
  process: ["Discovery", "Strategy", "Design", "Development", "Launch"],
};

/**
 * Format any service or add-on price into clean customer-facing LKR text.
 */
export function formatBrainPriceDisplay(item: {
  pricingType: string;
  price: number | null;
  startingPrice: number | null;
  currency?: string;
  unit?: string | null;
}): string {
  const curr = item.currency || "LKR";
  const unitStr = item.unit ? ` / ${item.unit.replace(/^per\s+/i, "")}` : "";

  if (item.pricingType === "fixed" && item.price !== null) {
    return `${curr} ${item.price.toLocaleString()}${unitStr}`;
  }
  if (item.pricingType === "starting_from" && item.startingPrice !== null) {
    return `From ${curr} ${item.startingPrice.toLocaleString()}${unitStr}`;
  }
  if (item.pricingType === "custom_quote") {
    return item.startingPrice
      ? `Custom Quote (starting from ${curr} ${item.startingPrice.toLocaleString()})`
      : "Custom Quote";
  }
  if (item.price !== null) {
    return `${curr} ${item.price.toLocaleString()}${unitStr}`;
  }
  return "Custom Quote";
}

/**
 * Retrieve dynamic agency business profile directly from Turso brain_settings.
 */
export async function getBrainCompanyProfile(): Promise<CompanyProfile> {
  try {
    const settings = await getBrainSettings({ isActive: true });
    if (settings && settings.length > 0) {
      const getVal = (key: string, fallback: string) => {
        const found = settings.find((s) => s.key === key);
        return found && found.value && found.value.trim() ? found.value.trim() : fallback;
      };

      return {
        name: getVal("business_name", fallbackCompanyProfile.name),
        tagline: getVal("slogan", fallbackCompanyProfile.tagline),
        contactNumber: getVal("contact_phone_whatsapp", fallbackCompanyProfile.contactNumber),
        whatsappUrl: "https://wa.me/94706410093",
        email: getVal("contact_email", fallbackCompanyProfile.email),
        websiteUrl: getVal("website_url", fallbackCompanyProfile.websiteUrl),
        businessHours: getVal("business_hours", fallbackCompanyProfile.businessHours!),
        paymentTerms: getVal("payment_terms_standard", fallbackCompanyProfile.paymentTerms!),
        paymentMethods: getVal("payment_methods", fallbackCompanyProfile.paymentMethods!),
        process: fallbackCompanyProfile.process,
      };
    }
  } catch (err) {
    console.error("[Turso Brain] Error fetching company profile settings:", err);
  }

  return fallbackCompanyProfile;
}

/**
 * Retrieve active services and packages from Turso.
 */
export async function fetchActiveBrainServices(): Promise<BrainService[]> {
  try {
    return await getBrainServices({ isActive: true });
  } catch (err) {
    console.error("[Turso Brain] Error fetching active services:", err);
    return [];
  }
}

/**
 * Retrieve active add-ons from Turso.
 */
export async function fetchActiveBrainAddons(): Promise<BrainAddon[]> {
  try {
    return await getBrainAddons({ isActive: true });
  } catch (err) {
    console.error("[Turso Brain] Error fetching active add-ons:", err);
    return [];
  }
}

/**
 * Retrieve active FAQs from Turso.
 */
export async function fetchActiveBrainFaqs(): Promise<BrainFaq[]> {
  try {
    return await getBrainFaqs({ isActive: true });
  } catch (err) {
    console.error("[Turso Brain] Error fetching active FAQs:", err);
    return [];
  }
}

export type PricingLookupResult =
  | { status: "match"; service: BrainService; displayPrice: string; inclusions: string[] }
  | { status: "ambiguous"; candidates: BrainService[] }
  | { status: "none" };

/**
 * Query-aware pricing lookup with platform intelligence (e.g. TikTok vs SMM).
 */
export async function getBrainServicePricing(searchTerm: string): Promise<PricingLookupResult> {
  const normalized = searchTerm.toLowerCase().trim();
  const all = await fetchActiveBrainServices();

  if (all.length === 0) return { status: "none" };

  // 1. Check for platform-specific queries
  const isTikTok =
    normalized.includes("tiktok") ||
    normalized.includes("ටික්ටොක්") ||
    normalized.includes("டிக் டாக்");

  if (isTikTok) {
    const tiktokPackages = all.filter(
      (s) => s.category === "tiktok" || s.slug.startsWith("ttk-")
    );
    if (tiktokPackages.length > 0) {
      if (normalized.includes("starter") || normalized.includes("single") || normalized.includes("1 video")) {
        const starter = tiktokPackages.find((s) => s.slug === "ttk-pkg-01") || tiktokPackages[0];
        return {
          status: "match",
          service: starter,
          displayPrice: formatBrainPriceDisplay(starter),
          inclusions: starter.inclusions ? JSON.parse(starter.inclusions) : [],
        };
      }
      if (normalized.includes("growth") || normalized.includes("4 video")) {
        const growth = tiktokPackages.find((s) => s.slug === "ttk-pkg-02") || tiktokPackages[1];
        return {
          status: "match",
          service: growth,
          displayPrice: formatBrainPriceDisplay(growth),
          inclusions: growth.inclusions ? JSON.parse(growth.inclusions) : [],
        };
      }
      if (normalized.includes("premium") || normalized.includes("8 video")) {
        const premium = tiktokPackages.find((s) => s.slug === "ttk-pkg-03") || tiktokPackages[2];
        return {
          status: "match",
          service: premium,
          displayPrice: formatBrainPriceDisplay(premium),
          inclusions: premium.inclusions ? JSON.parse(premium.inclusions) : [],
        };
      }
      return { status: "ambiguous", candidates: tiktokPackages };
    }
  }

  // 2. Exact slug match
  const slugMatch = all.find((s) => s.slug.toLowerCase() === normalized);
  if (slugMatch) {
    return {
      status: "match",
      service: slugMatch,
      displayPrice: formatBrainPriceDisplay(slugMatch),
      inclusions: slugMatch.inclusions ? JSON.parse(slugMatch.inclusions) : [],
    };
  }

  // 3. Exact name match
  const exactName = all.find((s) => s.name.toLowerCase() === normalized);
  if (exactName) {
    return {
      status: "match",
      service: exactName,
      displayPrice: formatBrainPriceDisplay(exactName),
      inclusions: exactName.inclusions ? JSON.parse(exactName.inclusions) : [],
    };
  }

  // 4. Keyword matching
  const words = normalized.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length === 0) return { status: "none" };

  const matches = all.filter((s) => {
    const nameLower = s.name.toLowerCase();
    const slugLower = s.slug.toLowerCase();
    return words.every((w) => nameLower.includes(w) || slugLower.includes(w));
  });

  if (matches.length === 1) {
    const s = matches[0];
    return {
      status: "match",
      service: s,
      displayPrice: formatBrainPriceDisplay(s),
      inclusions: s.inclusions ? JSON.parse(s.inclusions) : [],
    };
  }

  if (matches.length > 1) {
    return { status: "ambiguous", candidates: matches.slice(0, 5) };
  }

  return { status: "none" };
}

const FAQ_STOP_WORDS = new Set([
  "what", "what's", "whats", "are", "your", "the", "how", "can", "you", "for", "and", "our",
  "with", "have", "does", "this", "that", "from", "tell", "about", "give", "want", "need",
  "please", "some", "any", "which", "there", "they", "them", "then", "will", "would",
  "could", "should", "know", "much", "many", "package", "packages", "service", "services",
  "monawada", "keeyada", "karanawa", "puluwan", "enna", "irukku"
]);

/**
 * Search active FAQs from Turso by keyword relevance.
 */
export async function searchBrainFaqs(
  query: string,
  limit: number = 1
): Promise<{ question: string; answer: string; category: string }[]> {
  const faqs = await fetchActiveBrainFaqs();
  if (faqs.length === 0) return [];

  const normalized = query.toLowerCase().trim();
  const rawWords = normalized.replace(/[?.,!]/g, "").split(/\s+/);
  const words = rawWords.filter((w) => w.length >= 3 && !FAQ_STOP_WORDS.has(w));
  if (words.length === 0) return [];

  const scored = faqs.map((f) => {
    let score = 0;
    const qLower = f.question.toLowerCase();
    const aLower = f.answer.toLowerCase();

    for (const w of words) {
      if (qLower.includes(w)) score += 3;
      if (aLower.includes(w)) score += 1;
    }

    return { faq: f, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((item) => item.score >= 3)
    .slice(0, limit)
    .map((item) => ({
      question: item.faq.question,
      answer: item.faq.answer,
      category: item.faq.category,
    }));
}
