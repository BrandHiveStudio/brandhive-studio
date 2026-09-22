import {
  getBrainCompanyProfile,
  fetchActiveBrainServices,
  fetchActiveBrainAddons,
  fetchActiveBrainFaqs,
  getBrainServicePricing,
  searchBrainFaqs,
  formatBrainPriceDisplay,
  fallbackCompanyProfile,
  type CompanyProfile,
} from "@/lib/knowledge/turso-brain-knowledge";
import type { BrainService, BrainAddon, BrainFaq } from "@/lib/db/schema";
import { getPublishedFaqs, fallbackFaqs } from "@/lib/db/queries/faqs";

export interface HiveMessageOptions {
  message: string;
  history?: Array<{ role: "assistant" | "user"; content: string }>;
  channel?: "web";
  senderName?: string;
}

export interface HiveResponse {
  reply: string;
  needsLeadCapture: boolean;
  suggestedAction?: string;
}

/**
 * Standard BrandHive Studio profile used for base website fallback.
 */
export const companyProfile = fallbackCompanyProfile;

// =============================================================================
// MODULE-LEVEL CACHE (30-second TTL) — reduces Turso roundtrips per request
// =============================================================================
interface BrainCache {
  profile: CompanyProfile;
  services: BrainService[];
  expiresAt: number;
}
let _brainCache: BrainCache | null = null;
const BRAIN_CACHE_TTL_MS = 30_000; // 30 seconds

async function getWebsiteBrainData(): Promise<{ profile: CompanyProfile; services: BrainService[] }> {
  const now = Date.now();
  if (_brainCache && now < _brainCache.expiresAt) {
    return { profile: _brainCache.profile, services: _brainCache.services };
  }
  const [profile, services] = await Promise.all([
    getBrainCompanyProfile(),
    fetchActiveBrainServices().catch(() => [] as BrainService[]),
  ]);
  _brainCache = { profile, services, expiresAt: now + BRAIN_CACHE_TTL_MS };
  return { profile, services };
}

// =============================================================================
// WEBSITE HIVE AI LOGIC (LIVE TURSO BRAIN KNOWLEDGE INTEGRATION)
// =============================================================================

/**
 * Retrieve dynamic agency business info for the website from the live Turso brain_settings table.
 */
async function getWebsiteLiveCompanyProfile(): Promise<CompanyProfile> {
  return getBrainCompanyProfile();
}

/**
 * Supported language and conversational style types.
 */
export type LanguageStyle = "en" | "singlish" | "sinhala" | "tanglish" | "tamil";

// Distinctive Tanglish markers (Romanized Tamil words)
const TANGLISH_MARKERS = [
  /\bpanreengala\b/, /\bpannuvom\b/, /\bpannalama\b/, /\bpanna\b/, /\bpanrom\b/,
  /\bpannuveengala\b/, /\bpannuvengala\b/, /\bevlo\b/, /\bevvlavu\b/, /\birukku\b/,
  /\birukka\b/, /\benna\b/, /\badhu\b/, /\bsolla\b/, /\bsollunga\b/, /\bpathi\b/,
  /\bkudunga\b/, /\baagum\b/, /\bvilai\b/, /\bunga\b/, /\bungalukku\b/, /\bnalla\b/,
  /\billai\b/, /\bvenum\b/, /\bseiyalama\b/, /\bseivingala\b/, /\btheriyuma\b/,
  /\bpaakkalaama\b/, /\bpesalaama\b/, /\bkandippa\b/, /\bkandippen\b/, /\bmudiyuma\b/,
  /\btheva\b/, /\bpudhu\b/
];

// Distinctive Singlish markers (Romanized Sinhala words) - STRICTLY NO TAMIL WORDS
const SINGLISH_MARKERS = [
  /\bkaranawa\b/, /\bkaranawada\b/, /\bkaranna\b/, /\bkarala\b/, /\bhadanna\b/,
  /\bhadala\b/, /\bmonawada\b/, /\bmonada\b/, /\bkeeyada\b/, /\bganan\b/,
  /\bkohomada\b/, /\bpuluwanda\b/, /\bpuluwan\b/, /\beka\b/, /\bekak\b/,
  /\bthiyenawada\b/, /\bthiyenne\b/, /\bthiyenawa\b/, /\bbalanna\b/, /\bbalamuda\b/,
  /\bdanna\b/, /\bmata\b/, /\bape\b/, /\boyala\b/, /\boyalage\b/, /\boyata\b/,
  /\bmokakda\b/, /\bhari\b/, /\bkiyanna\b/, /\bneda\b/, /\bmehema\b/, /\bowa\b/,
  /\bthawa\b/, /\bganna\b/, /\bkiyada\b/, /\bona\b/, /\boneda\b/, /\baniwarenma\b/,
  /\bdennam\b/, /\bbalagannam\b/, /\bkihipayak\b/, /\bmewaye\b/
];

/**
 * Detect customer's language and style (English, Sinhala, Singlish, Tamil, Tanglish, or mixed).
 * If the current message is a short follow-up without language markers, inherits style from recent user history.
 */
export function detectLanguageStyle(
  text: string,
  history: Array<{ role: "assistant" | "user"; content: string }> = []
): LanguageStyle {
  // Check for Sinhala script Unicode range: 0D80–0DFF
  if (/[\u0D80-\u0DFF]/.test(text)) return "sinhala";

  // Check for Tamil script Unicode range: 0B80–0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return "tamil";

  const lower = text.toLowerCase();

  // Tanglish markers checked first to prevent cross-language collision
  if (TANGLISH_MARKERS.some((m) => m.test(lower))) return "tanglish";

  // Singlish markers
  if (SINGLISH_MARKERS.some((m) => m.test(lower))) return "singlish";

  // If the message has no explicit script or markers and is short, check conversation history
  const words = lower.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 5 && history && history.length > 0) {
    const lastUser = [...history].reverse().find((h) => h.role === "user");
    if (lastUser) {
      if (/[\u0D80-\u0DFF]/.test(lastUser.content)) return "sinhala";
      if (/[\u0B80-\u0BFF]/.test(lastUser.content)) return "tamil";
      const lastLower = lastUser.content.toLowerCase();
      if (TANGLISH_MARKERS.some((m) => m.test(lastLower))) return "tanglish";
      if (SINGLISH_MARKERS.some((m) => m.test(lastLower))) return "singlish";
    }
  }

  return "en";
}

/**
 * Detect the primary active service topic from recent conversation history across languages.
 */
function getRecentTopicContext(
  history: Array<{ role: "assistant" | "user"; content: string }>
): string | null {
  if (!history || history.length === 0) return null;
  const recent = history
    .slice(-4)
    .map((h) => h.content)
    .join(" ")
    .toLowerCase();

  // Prioritize TikTok first so words like 'video' or 'post' don't trigger social-media
  if (
    recent.includes("tiktok") ||
    recent.includes("tik tok") ||
    recent.includes("ටක්ටොක්") ||
    recent.includes("ටික්ටොක්") ||
    recent.includes("டிக்டாக்") ||
    recent.includes("டிக் டாக்") ||
    recent.includes("ttk")
  ) {
    return "tiktok";
  }
  if (
    recent.includes("website") ||
    recent.includes("web design") ||
    recent.includes("web development") ||
    recent.includes("e-commerce") ||
    recent.includes("ecommerce") ||
    recent.includes("online store") ||
    recent.includes("landing page") ||
    recent.includes("site") ||
    recent.includes("වෙබ්") ||
    recent.includes("වෙබ්සයිට්") ||
    recent.includes("සයිට්") ||
    recent.includes("வலைத்தளம்") ||
    recent.includes("வெப்சைட்") ||
    recent.includes("சைட்")
  ) {
    return "website";
  }
  if (
    recent.includes("social media") ||
    recent.includes("facebook") ||
    recent.includes("instagram") ||
    recent.includes("smm") ||
    recent.includes("marketing") ||
    recent.includes("posts") ||
    recent.includes("reels") ||
    recent.includes("සෝෂල්") ||
    recent.includes("සමාජ මාධ්‍ය") ||
    recent.includes("පේජ්") ||
    recent.includes("fb") ||
    recent.includes("insta") ||
    recent.includes("post") ||
    recent.includes("reel") ||
    recent.includes("சோஷியல்") ||
    recent.includes("சமூக")
  ) {
    return "social-media";
  }
  if (
    recent.includes("branding") ||
    recent.includes("logo") ||
    recent.includes("identity") ||
    recent.includes("stationery") ||
    recent.includes("business card") ||
    recent.includes("ලෝගෝ") ||
    recent.includes("බ්‍රෑන්ඩින්") ||
    recent.includes("ලාංඡන") ||
    recent.includes("லோகோ") ||
    recent.includes("பிராண்டிங்")
  ) {
    return "branding";
  }
  if (
    recent.includes("ad") ||
    recent.includes("advertising") ||
    recent.includes("google ads") ||
    recent.includes("meta ads") ||
    recent.includes("boosting") ||
    recent.includes("දැන්වීම්") ||
    recent.includes("விளம்பரம்")
  ) {
    return "advertising";
  }
  return null;
}

/**
 * Strip common conversational question phrasing across languages to isolate the query item.
 */
function cleanPricingQuery(message: string): string {
  return message
    .toLowerCase()
    .replace(
      /\b(how much do you charge for|how much do you charge|how much does it cost for|how much does it cost|how much is|how much for|how much|what do you charge for|what do you charge|what is the price of|what is the cost of|pricing for|price of|price|cost|quote|budget|estimate|starting from|fee|rates?|for|a|an|the|please|brandhive|monawada|keeyada|ganan|kohomada|evlo|vilai|enna|packages|package)\b/g,
      " "
    )
    .replace(/[?.,!]/g, "")
    .trim();
}

/**
 * Select the most relevant services and packages for the customer's query context,
 * drawing authoritatively from the live Turso Brain catalog.
 * Strongly prevents cross-platform package contamination (e.g. returning Facebook packages for TikTok queries).
 */
function getRelevantServicesContext(
  services: BrainService[],
  contextQuery: string
): string {
  const normalizedQuery = contextQuery.toLowerCase();

  // 1. Detect if the query specifically targets a platform/channel
  const isTikTok =
    normalizedQuery.includes("tiktok") ||
    normalizedQuery.includes("ටික්ටොක්") ||
    normalizedQuery.includes("டிக் டாக்") ||
    normalizedQuery.includes("tik tok") ||
    normalizedQuery.includes("ttk");

  const isSocialMedia =
    !isTikTok &&
    (normalizedQuery.includes("social media") ||
      normalizedQuery.includes("facebook") ||
      normalizedQuery.includes("fb") ||
      normalizedQuery.includes("instagram") ||
      normalizedQuery.includes("insta") ||
      normalizedQuery.includes("smm") ||
      normalizedQuery.includes("posts") ||
      normalizedQuery.includes("reels") ||
      normalizedQuery.includes("සෝෂල්") ||
      normalizedQuery.includes("සමාජ මාධ්‍ය") ||
      normalizedQuery.includes("පේජ්") ||
      normalizedQuery.includes("சோஷியல்") ||
      normalizedQuery.includes("சமூக"));

  const isWebsite =
    normalizedQuery.includes("website") ||
    normalizedQuery.includes("web design") ||
    normalizedQuery.includes("web development") ||
    normalizedQuery.includes("ecommerce") ||
    normalizedQuery.includes("e-commerce") ||
    normalizedQuery.includes("online store") ||
    normalizedQuery.includes("landing page") ||
    normalizedQuery.includes("site") ||
    normalizedQuery.includes("වෙබ්") ||
    normalizedQuery.includes("வலைத்தளம்");

  const isBranding =
    normalizedQuery.includes("branding") ||
    normalizedQuery.includes("logo") ||
    normalizedQuery.includes("brand identity") ||
    normalizedQuery.includes("visual identity") ||
    normalizedQuery.includes("stationery") ||
    normalizedQuery.includes("business card") ||
    normalizedQuery.includes("ලෝගෝ") ||
    normalizedQuery.includes("බ්‍රෑන්ඩින්") ||
    normalizedQuery.includes("லோகோ");

  const isAcademic =
    normalizedQuery.includes("academic") ||
    normalizedQuery.includes("student project") ||
    normalizedQuery.includes("final year") ||
    normalizedQuery.includes("degree project");

  let selectedServices: BrainService[] = [];

  if (isTikTok) {
    // Specifically prioritize TikTok packages and related services ONLY!
    // NEVER inject Facebook/Instagram post packages into TikTok queries!
    const tiktokItems = services.filter(
      (s) =>
        s.category === "tiktok" ||
        s.slug.startsWith("ttk-") ||
        s.name.toLowerCase().includes("tiktok") ||
        (s.description && s.description.toLowerCase().includes("tiktok")) ||
        s.slug === "ads-svc-06" // TikTok Ads Setup
    );

    tiktokItems.sort((a, b) => {
      if (a.itemType === "package" && b.itemType !== "package") return -1;
      if (b.itemType === "package" && a.itemType !== "package") return 1;
      return (a.price || a.startingPrice || 0) - (b.price || b.startingPrice || 0);
    });

    selectedServices = tiktokItems;
  } else if (isSocialMedia) {
    // Specifically prioritize Social Media / SMM packages
    const smmItems = services.filter(
      (s) =>
        s.category === "social-media" ||
        s.slug.startsWith("smm-") ||
        s.slug === "ads-svc-01" ||
        s.slug === "ads-svc-02"
    );
    smmItems.sort((a, b) => {
      if (a.itemType === "package" && b.itemType !== "package") return -1;
      if (b.itemType === "package" && a.itemType !== "package") return 1;
      return (a.price || a.startingPrice || 0) - (b.price || b.startingPrice || 0);
    });
    selectedServices = smmItems;
  } else if (isWebsite) {
    // Specifically prioritize Website packages and services
    const webItems = services.filter(
      (s) =>
        s.category === "web-development" ||
        s.category === "website" ||
        s.slug.startsWith("web-")
    );
    webItems.sort((a, b) => {
      if (a.itemType === "package" && b.itemType !== "package") return -1;
      if (b.itemType === "package" && a.itemType !== "package") return 1;
      return (a.price || a.startingPrice || 0) - (b.price || b.startingPrice || 0);
    });
    selectedServices = webItems;
  } else if (isBranding) {
    // Specifically prioritize Branding packages and services
    const brdItems = services.filter(
      (s) =>
        s.category === "branding" ||
        s.slug.startsWith("brd-")
    );
    brdItems.sort((a, b) => {
      if (a.itemType === "package" && b.itemType !== "package") return -1;
      if (b.itemType === "package" && a.itemType !== "package") return 1;
      return (a.price || a.startingPrice || 0) - (b.price || b.startingPrice || 0);
    });
    selectedServices = brdItems;
  } else if (isAcademic) {
    const acaItems = services.filter(
      (s) =>
        s.category === "academic" ||
        s.slug.startsWith("aca-")
    );
    selectedServices = acaItems;
  } else {
    // Broad or mixed query: score services by keyword relevance
    const scored = services.map((s) => {
      let score = 0;
      const nameLower = s.name.toLowerCase();
      const catLower = (s.category || "").toLowerCase();
      const descLower = (s.description || "").toLowerCase();

      const words = normalizedQuery.split(/\s+/).filter((w) => w.length >= 3);
      for (const w of words) {
        if (nameLower.includes(w)) score += 3;
        if (catLower.includes(w)) score += 2;
        if (descLower.includes(w)) score += 1;
      }

      if (s.itemType === "package") {
        score += 2;
      }

      return { service: s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const topScored = scored
      .filter((item) => item.score > 0)
      .slice(0, 15)
      .map((item) => item.service);

    if (topScored.length >= 5) {
      selectedServices = topScored;
    } else {
      // Flagship packages across ALL core categories (including TikTok!)
      const flagshipSlugs = new Set([
        "brd-pkg-01", "brd-pkg-02", "brd-pkg-03", // Branding
        "web-pkg-01", "web-pkg-02", "web-pkg-03", // Website
        "smm-pkg-01a", "smm-pkg-02a", "smm-pkg-03a", // Social Media
        "ttk-pkg-01", "ttk-pkg-02", "ttk-pkg-03", // TikTok
      ]);
      const flagships = services.filter((s) => flagshipSlugs.has(s.slug));

      const combined = [...topScored];
      for (const fp of flagships) {
        if (!combined.some((s) => s.id === fp.id)) {
          combined.push(fp);
        }
      }
      selectedServices = combined.slice(0, 20);
    }
  }

  return selectedServices
    .map((s) => {
      const priceDisplay = formatBrainPriceDisplay(s);
      let inclusionsText = "";
      try {
        if (s.inclusions) {
          const arr = JSON.parse(s.inclusions);
          if (Array.isArray(arr) && arr.length > 0) {
            inclusionsText = ` | Includes: ${arr.slice(0, 4).join(", ")}`;
          }
        }
      } catch {}

      let categoryLabel = s.category;
      if (s.category === "tiktok" || s.slug.startsWith("ttk-")) {
        categoryLabel = "TikTok Video Package";
      } else if (s.category === "social-media") {
        categoryLabel = "Social Media (Facebook/Instagram)";
      } else if (s.category === "website") {
        categoryLabel = "Website Development";
      } else if (s.category === "branding") {
        categoryLabel = "Brand Identity";
      }

      return `- [${categoryLabel}] ${s.name} (${s.itemType}): ${priceDisplay}${inclusionsText}`;
    })
    .join("\n");
}

/**
 * Helper to test if a message is a referential or contextual follow-up across languages.
 */
function isReferentialMessage(normalized: string): boolean {
  if (
    /^(what are they|what are those|what is it|what are the packages|how much are they|tell me more|which one|the first one|the second one|the third one|how much( is it| is that|\?)?|tell me about (them|it)|can you explain (them|it)|does it include reels|what do i get|what about that)\b/i.test(
      normalized
    ) ||
    ["what are they", "what are they?", "what are those", "what are those?", "what are the options", "they"].includes(normalized) ||
    /(packages monawada|monawada thiyenne|eka keeyada|keeyada|ganan kohomada|reels thiyenawada|mata monawada hambenne|palaweni eka|palawani eka|first eka|deweni eka|second eka)/i.test(
      normalized
    ) ||
    /(packages enna|enna packages irukku|adhu evlo|evlo|first one pathi sollunga|reels irukka|enna include aagum|edhu suit aagum)/i.test(
      normalized
    ) ||
    normalized.includes("පැකේජ් මොනවද") ||
    normalized.includes("packages මොනවද") ||
    normalized.includes("මොනවද තියෙන්නේ") ||
    normalized.includes("මොනවද පැකේජ්") ||
    normalized.includes("ඒක කීයද") ||
    normalized.includes("කීයද") ||
    normalized.includes("ගණන් කොහොමද") ||
    normalized.includes("පළවෙනි එක") ||
    normalized.includes("දෙවෙනි එක") ||
    normalized.includes("රීල්ස් තියෙනවද") ||
    normalized.includes("මොනවද ලැබෙන්නේ") ||
    normalized.includes("packages என்ன") ||
    normalized.includes("என்ன packages இருக்கு") ||
    normalized.includes("அது எவ்வளவு") ||
    normalized.includes("எவ்வளவு") ||
    normalized.includes("முதல் package") ||
    normalized.includes("ரீல்ஸ் இருக்கா") ||
    normalized.includes("என்ன கிடைக்கும்")
  ) {
    return true;
  }
  return false;
}

/**
 * Helper to test if a customer is expressing a requirement or asking whether BrandHive provides a service.
 */
function isRequirementMessage(normalized: string): boolean {
  return (
    /(you have to|i need you to|i want you to|can you manage|can you run|can you build|help me with|i need|we need|manage my|run my|handle my|build my|design my|do you manage|do you do|can you do|manage karanawada|karanna puluwanda|hadanna puluwanda|design karanna|hadala denna|manage karanna|run karanna|manage panreengala|panna mudiyuma|design panreengala|manage pannuvengala|manage pannuveengala)\b/i.test(
      normalized
    ) ||
    normalized.includes("කරනවද") ||
    normalized.includes("කරලා දෙනවද") ||
    normalized.includes("කරන්න පුළුවන්ද") ||
    normalized.includes("හදන්න පුළුවන්ද") ||
    normalized.includes("හදලා දෙන්න") ||
    normalized.includes("බලාගන්නවද") ||
    normalized.includes("පළ කරනවද") ||
    normalized.includes("manage කරනවද") ||
    normalized.includes("பண்றீங்களா") ||
    normalized.includes("செய்வீர்களா") ||
    normalized.includes("பண்ண முடியுமா") ||
    normalized.includes("நிர்வகிக்கிறீர்களா")
  );
}

/**
 * Helper to test if a customer is asking about agency services or capabilities broadly
 * (e.g., "what services do you offer?", "what can you do for my business?", "what do you do?").
 * Excludes specific topic inquiries like "ongoing support", "maintenance", "hosting", "domain", "pricing", etc.
 */
function isBroadServiceInquiry(normalized: string): boolean {
  const specificTopics = [
    "support", "maintenance", "hosting", "domain", "advance", "payment", "revisions", "portfolio", "hours", "process"
  ];
  if (specificTopics.some((t) => normalized.includes(t))) {
    return false;
  }

  if (
    /(what services|what kind of services|what sort of services|which services|services do you|services you offer|services available|what do you offer|what do you do|what do you guys do|what can you do|what can you help|what does brandhive do|what can brandhive do|how can you help|what can you do for my business|tell me about your services|list your services|overview of services)/i.test(
      normalized
    ) ||
    /^(services|our services|your services|what are your services|all services|offerings)\b/i.test(
      normalized
    ) ||
    /(services monawada|monawada karanne|monawada karala denne|oyala monawada karanne|brandhive eken monawada karanne|mona services da thiyenne|thiyena services monawada)/i.test(
      normalized
    ) ||
    /(services enna|enna services|enna panreenga|enna pannuveenga|brandhive enna pannum|enna offer panreenga)/i.test(
      normalized
    ) ||
    normalized.includes("සේවාවන් මොනවද") ||
    normalized.includes("මොනවද සේවා") ||
    normalized.includes("මොනවද කරන්නේ") ||
    normalized.includes("මොනවාද කරන්නේ") ||
    normalized.includes("කරන සේවා") ||
    normalized.includes("සේවා මොනවද") ||
    normalized.includes("சேவைகள் என்ன") ||
    normalized.includes("என்ன சேவைகள்") ||
    normalized.includes("என்ன செய்வீர்கள்") ||
    normalized.includes("என்ன பண்றீங்க")
  ) {
    return true;
  }
  return false;
}

/**
 * Website HIVE AI deterministic fallback knowledge engine powered by the live Supabase Knowledge Base.
 * Conversational, multilingual, context-aware, and grounded in real-time services, pricing, and FAQs.
 */
async function getWebsiteFallbackReply(
  message: string,
  history: Array<{ role: "assistant" | "user"; content: string }> = []
): Promise<HiveResponse> {
  const normalized = message.toLowerCase().trim();
  const profile = await getWebsiteLiveCompanyProfile();
  const recentTopic = getRecentTopicContext(history);
  const currentTopic = getRecentTopicContext([{ role: "user", content: message }]);
  const effectiveTopic = recentTopic || currentTopic;
  const langStyle = detectLanguageStyle(message, history);

  // 1. Inexperienced / Non-Technical Customer Statements
  if (
    normalized.includes("don't know") ||
    normalized.includes("dont know") ||
    normalized.includes("not sure") ||
    normalized.includes("no idea") ||
    normalized.includes("confused") ||
    normalized.includes("danna na") ||
    normalized.includes("therenne na") ||
    normalized.includes("theriyadhu") ||
    normalized.includes("puriyala") ||
    normalized.includes("දන්නේ නෑ") ||
    normalized.includes("තේරෙන්නේ නෑ")
  ) {
    if (langStyle === "singlish") {
      return {
        reply: "Bayawenna epa 😊 Api okkoma karala dennam. Oyalage business eka gana podi wistharayak kiyanna!",
        needsLeadCapture: false,
        suggestedAction: "Tell us about your business",
      };
    }
    if (langStyle === "tanglish") {
      return {
        reply: "Kavalai padadheenga 😊 Nanga ellame pathukkuvom. Unga business pathi chinna intro kudunga!",
        needsLeadCapture: false,
        suggestedAction: "Tell us about your business",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply: "බයවෙන්න එපා 😊 අපි ඔක්කොම කරලා දෙන්නම්. ඔබේ ව්‍යාපාරය ගැන පොඩි විස්තරයක් කියන්න!",
        needsLeadCapture: false,
        suggestedAction: "Tell us about your business",
      };
    }
    if (langStyle === "tamil") {
      return {
        reply: "கவலைப்படாதீங்க 😊 நாங்க எல்லாமே பார்த்துப்போம். உங்க business பற்றி சொல்லுங்க!",
        needsLeadCapture: false,
        suggestedAction: "Tell us about your business",
      };
    }
    return {
      reply: "No worries at all 😊 We can handle everything for you. Just tell me a little about what your business does!",
      needsLeadCapture: false,
      suggestedAction: "Tell us about your business",
    };
  }

  // 2. Contextual & Referential Follow-ups across languages
  if (isReferentialMessage(normalized)) {
    if (effectiveTopic === "social-media") {
      // Questions about reels
      if (
        normalized.includes("reels") ||
        normalized.includes("reel") ||
        normalized.includes("රීල්ස්") ||
        normalized.includes("ரீல்ஸ்")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Ow! Ape Growth package ekata short reels 4k thiyenawa, Premium ekata reels 8k thiyenawa 😊 (Starter eke posts 15k thiyenne). Reels karanna kemathida?",
            needsLeadCapture: false,
            suggestedAction: "Ask about reels",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Aamanga! Growth package-la 4 short reels irukku, Premium package-la 8 reels irukku 😊 (Starter-la 15 posts mattum). Reels panna aasaiyaa?",
            needsLeadCapture: false,
            suggestedAction: "Ask about reels",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "ඔව්! අපේ Growth package එකට කෙටි reels 4ක් සහ Premium package එකට reels 8ක් ඇතුළත් වෙනවා 😊 (Starter එකේ posts 15ක් තියෙනවා). Reels ගැන දැනගන්න කැමතිද?",
            needsLeadCapture: false,
            suggestedAction: "Ask about reels",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "ஆம்! Growth package-ல் 4 reels மற்றும் Premium package-ல் 8 reels உள்ளது 😊 (Starter-ல் 15 posts மட்டும்). Reels பற்றி அறிய விரும்புகிறீர்களா?",
            needsLeadCapture: false,
            suggestedAction: "Ask about reels",
          };
        }
        return {
          reply: "Yes! Our Growth package includes 4 short reels, and the Premium package includes 8 custom reels per month 😊 (Starter is 15 posts without reels). Would you like to focus on reels?",
          needsLeadCapture: false,
          suggestedAction: "Ask about reels",
        };
      }

      // Questions about deliverables / what I get
      if (
        normalized.includes("what do i get") ||
        normalized.includes("what is included") ||
        normalized.includes("hambenne") ||
        normalized.includes("include aagum") ||
        normalized.includes("මොනවද ලැබෙන්නේ") ||
        normalized.includes("என்ன கிடைக்கும்")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Branded post designs, captions, hashtags, scheduling saha page management okkoma labenawa 😊 Wadi packages walata reels saha boosting thiyenawa. Packages balamuda?",
            needsLeadCapture: false,
            suggestedAction: "Ask about packages",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Branded post designs, captions, hashtags, scheduling and page management ellame kedaikkum 😊 Adutha packages-la reels and ad boost irukku.",
            needsLeadCapture: false,
            suggestedAction: "Ask about packages",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Branded post designs, captions, hashtags, scheduling සහ page management ඔක්කොම ලැබෙනවා 😊 ඉහළ packages වලට reels සහ boosting ඇතුළත් වෙනවා. Packages බලමුද?",
            needsLeadCapture: false,
            suggestedAction: "Ask about packages",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Branded post designs, captions, hashtags, scheduling மற்றும் page management எல்லாமே கிடைக்கும் 😊 அடுத்த packages-ல் reels மற்றும் ad boost உள்ளது.",
            needsLeadCapture: false,
            suggestedAction: "Ask about packages",
          };
        }
        return {
          reply: "You get custom branded graphics, captions, hashtag research, post scheduling, and page management 😊 Higher packages also include reels and ad boosting. Want to see the packages?",
          needsLeadCapture: false,
          suggestedAction: "Ask about packages",
        };
      }

      // Specific reference: the first one / starter
      if (
        normalized.includes("first") ||
        normalized.includes("palaweni") ||
        normalized.includes("palawani") ||
        normalized.includes("starter") ||
        normalized.includes("පළවෙනි") ||
        normalized.includes("முதல்")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Starter package eka LKR 14,000/month wenawa (organic posts 15k) 😊 $20 ad boost ekka nam LKR 20,000/month. Page eka active thiyaganna hodatama athi.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter package",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Starter package LKR 14,000/month varum (15 organic posts) 😊 $20 ad boost kooda venumna LKR 20,000/month. Page active-ah vekka perfect.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter package",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Starter package එක මාසෙකට LKR 14,000 වෙනවා (organic posts 15ක්) 😊 $20 ad boost එක්ක නම් LKR 20,000/month. Page එක active තියාගන්න හොඳටම ප්‍රමාණවත්.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter package",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Starter package மாதத்திற்கு LKR 14,000 வரும் (15 organic posts) 😊 $20 ad boost உடன் LKR 20,000/month. Page active-ஆக வைக்க சிறந்தது.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter package",
          };
        }
        return {
          reply: "Our Starter package is LKR 14,000/month for organic posts (or LKR 20,000 with $20 ad boosting). It includes 15 custom posts to keep your pages active 😊",
          needsLeadCapture: false,
          suggestedAction: "Ask about Starter package",
        };
      }

      // Specific reference: the second one / growth
      if (
        normalized.includes("second") ||
        normalized.includes("deweni") ||
        normalized.includes("growth") ||
        normalized.includes("දෙවෙනි") ||
        normalized.includes("இரண்டாவது")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Growth package eka LKR 25,000/month wenawa. Posts 20k saha short reels 4k labenawa reach eka wadi karaganna 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth package",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Growth package LKR 25,000/month varum. 20 posts and 4 short reels kedaikkum reach adhigama panna 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth package",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Growth package එක මාසෙකට LKR 25,000 වෙනවා. Reach එක වැඩි කරගන්න posts 20ක් සහ short reels 4ක් ලැබෙනවා 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth package",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Growth package மாதத்திற்கு LKR 25,000 வரும். 20 posts மற்றும் 4 reels கிடைக்கும் reach அதிகரிக்க 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth package",
          };
        }
        return {
          reply: "Our Growth package is LKR 25,000/month. It includes 20 custom posts plus 4 short reels to help your business reach more people 😊",
          needsLeadCapture: false,
          suggestedAction: "Ask about Growth package",
        };
      }

      // Asking for price of the packages ("eka keeyada", "ඒක කීයද", "adhu evlo", "how much is that")
      if (
        normalized.includes("keeyada") ||
        normalized.includes("evlo") ||
        normalized.includes("how much") ||
        normalized.includes("ganan") ||
        normalized.includes("vilai") ||
        normalized.includes("කීයද") ||
        normalized.includes("எவ்வளவு")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Starter eka LKR 14,000/mo, Growth eka LKR 25,000/mo, Premium eka LKR 40,000/mo wenawa 😊 Oyalata galapenne mona ekada?",
            needsLeadCapture: false,
            suggestedAction: "Ask about package details",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Starter LKR 14,000/mo, Growth LKR 25,000/mo, Premium LKR 40,000/mo varum 😊 Ungalukku edhu suit aagum?",
            needsLeadCapture: false,
            suggestedAction: "Ask about package details",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Starter එක LKR 14,000/mo, Growth එක LKR 25,000/mo, Premium එක LKR 40,000/mo වෙනවා 😊 ඔබට වඩාත්ම ගැලපෙන්නේ මොකක්ද?",
            needsLeadCapture: false,
            suggestedAction: "Ask about package details",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Starter LKR 14,000/mo, Growth LKR 25,000/mo, Premium LKR 40,000/mo வரும் 😊 உங்களுக்கு எது சரியா இருக்கும்?",
            needsLeadCapture: false,
            suggestedAction: "Ask about package details",
          };
        }
        return {
          reply: "Starter is LKR 14,000/mo, Growth is LKR 25,000/mo, and Premium is LKR 40,000/mo 😊 Which one sounds best for you?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }

      // General reference ("what are they", "packages monawada", "packages මොනවද", "packages enna")
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Packages 3k thiyenawa:\n\n• Starter (LKR 14,000/mo indala) — 15 posts, page eka active thiyaganna.\n• Growth (LKR 25,000/mo) — 20 posts saha reels 4k, reach eka wadi karaganna.\n• Premium (LKR 40,000/mo) — 30 posts saha reels 8k ekka full management.\n\nMewaye thawa details kiyannada?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 3 packages irukku:\n\n• Starter (LKR 14,000/mo la irundhu) — 15 posts, page active-ah vekka.\n• Growth (LKR 25,000/mo) — 20 posts + 4 reels, reach adhigama panna.\n• Premium (LKR 40,000/mo) — 30 posts + 8 reels kooda full management.\n\nIdhoda details paakkalaama?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure 😊 අපේ packages 3ක් තියෙනවා:\n\n• Starter (LKR 14,000/mo සිට) — Posts 15ක්, page එක active තියාගන්න.\n• Growth (LKR 25,000/mo) — Posts 20ක් සහ reels 4ක්, reach එක වැඩි කරගන්න.\n• Premium (LKR 40,000/mo) — Posts 30ක් සහ reels 8ක් එක්ක full management.\n\nතව විස්තර දැනගන්න කැමතිද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure 😊 3 packages இருக்கு:\n\n• Starter (LKR 14,000/mo முதல்) — 15 posts, page active-ஆக வைக்க.\n• Growth (LKR 25,000/mo) — 20 posts மற்றும் 4 reels, reach அதிகரிக்க.\n• Premium (LKR 40,000/mo) — 30 posts மற்றும் 8 reels உடன் full management.\n\nவிவரங்கள் தெரிஞ்சுக்கலாமா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      return {
        reply: "Sure 😊 We have a few packages:\n\n• Starter (from LKR 14,000/mo) — 15 custom posts to keep your pages active.\n• Growth (from LKR 25,000/mo) — 20 custom posts plus 4 reels to grow your reach.\n• Premium (from LKR 40,000/mo) — 30 custom posts, 8 reels, and dedicated campaign support.\n\nWant me to share more details on any of these?",
        needsLeadCapture: false,
        suggestedAction: "Ask about package details",
      };
    }

    if (effectiveTopic === "website") {
      // Inquiries about deliverables / inclusions / "what is included" / "that package" / "what do i get" / "starter"
      if (
        normalized.includes("what is included") ||
        normalized.includes("what do i get") ||
        normalized.includes("included") ||
        normalized.includes("inclusions") ||
        normalized.includes("that package") ||
        normalized.includes("this package") ||
        normalized.includes("first") ||
        normalized.includes("starter") ||
        normalized.includes("මොනවද ලැබෙන්නේ") ||
        normalized.includes("ඇතුළත්") ||
        normalized.includes("hambenne") ||
        normalized.includes("என்ன கிடைக்கும்")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Starter Website package eke (LKR 35,000) pages 5k, fully responsive mobile design, contact inquiry form, WhatsApp chat integration, basic SEO saha Google Maps labenawa 😊 Thawa details balamuda?",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter Website",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Starter Website package-la (LKR 35,000) 5 pages, mobile responsive design, contact form, WhatsApp chat integration, basic SEO and Google Maps kedaikkum 😊 Innum details paakkalaama?",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter Website",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Starter Website package එකට (LKR 35,000) pages 5ක්, mobile responsive design, contact form, WhatsApp chat integration, basic SEO සහ Google Maps ඇතුළත් වෙනවා 😊 වැඩිදුර විස්තර දැනගන්න කැමතිද?",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter Website",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Starter Website package-ல் (LKR 35,000) 5 pages, mobile responsive design, contact form, WhatsApp chat integration, basic SEO மற்றும் Google Maps கிடைக்கும் 😊 மேலும் விவரங்கள் பார்க்கலாமா?",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter Website",
          };
        }
        return {
          reply: "Our Starter Website package (from LKR 35,000) includes up to 5 pages, fully responsive mobile design, contact inquiry form, WhatsApp chat integration, basic SEO setup, and Google Maps integration 😊 Would you like to get started with this package?",
          needsLeadCapture: false,
          suggestedAction: "Ask about Starter Website",
        };
      }

      // Inquiries about business website package
      if (
        normalized.includes("business") ||
        normalized.includes("second") ||
        normalized.includes("10 page") ||
        normalized.includes("දෙවෙනි") ||
        normalized.includes("இரண்டாவது")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Business Website package eka LKR 75,000 indala thiyenawa. Pages 10k, premium UI, dynamic CMS, blog, advanced SEO saha analytics labenawa 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Business Website",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Business Website package එක LKR 75,000 සිට පවතී. Pages 10ක්, premium UI, dynamic CMS, blog, advanced SEO සහ analytics ඇතුළත් වේ 😊",
            needsLeadCapture: false,
            suggestedAction: "Ask about Business Website",
          };
        }
        return {
          reply: "Our Business Website package (from LKR 75,000) includes up to 10 pages, premium UI design, dynamic CMS integration, blog setup, advanced SEO, and analytics 😊",
          needsLeadCapture: false,
          suggestedAction: "Ask about Business Website",
        };
      }

      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Website packages 3k thiyenawa:\n\n• Starter Website (LKR 35,000 indala) — Pages 5k, mobile-friendly.\n• Business Website (LKR 75,000 indala) — Pages 10k, full management ekka.\n• Corporate (LKR 150,000 indala) — Custom built platform ekak.\n\nOyalata aluth website ekakda one?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website packages",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 Website packages irukku:\n\n• Starter Website (LKR 35,000 la irundhu) — 5 pages, mobile-friendly.\n• Business Website (LKR 75,000 la irundhu) — 10 pages with full features.\n• Corporate (LKR 150,000 la irundhu) — Custom multi-page build.\n\nPudhu website thevaiaa?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website packages",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure 😊 Website packages 3ක් තියෙනවා:\n\n• Starter Website (LKR 35,000 සිට) — Pages 5ක්, mobile-friendly.\n• Business Website (LKR 75,000 සිට) — Pages 10ක්, සම්පූර්ණ කළමනාකරණය සමඟ.\n• Corporate (LKR 150,000 සිට) — Custom platform එකක්.\n\nඔබට අලුත් website එකක්ද අවශ්‍ය?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website packages",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure 😊 Website packages இருக்கு:\n\n• Starter Website (LKR 35,000 முதல்) — 5 pages, mobile-friendly.\n• Business Website (LKR 75,000 முதல்) — 10 pages with full features.\n• Corporate (LKR 150,000 முதல்) — Custom multi-page build.\n\nபுதிய website தேவையா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website packages",
        };
      }
      return {
        reply: "Sure 😊 We have a few website options:\n\n• Starter Website (from LKR 35,000) — Up to 5 pages, mobile-friendly, great for small businesses.\n• Business Website (from LKR 75,000) — Up to 10 pages with full content management.\n• Corporate / Custom (from LKR 150,000) — Tailored multi-page build with custom features.\n\nAre you looking for a brand-new website or a redesign?",
        needsLeadCapture: false,
        suggestedAction: "Ask for a website recommendation",
      };
    }

    if (effectiveTopic === "branding") {
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Branding packages thiyenawa:\n\n• Standalone Logo (LKR 8,000 indala) — Logo design concepts.\n• Starter Brand Identity (LKR 15,000 indala) — Logo, color palette, fonts.\n• Business Brand Identity (LKR 35,000 indala) — Complete identity saha stationery.\n\nAluth logo ekak hadaganna kemathida?",
          needsLeadCapture: false,
          suggestedAction: "Ask about branding packages",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 Branding packages irukku:\n\n• Logo Design (LKR 8,000 la irundhu) — Logo design concepts.\n• Starter Brand Identity (LKR 15,000 la irundhu) — Logo, colors, fonts.\n• Business Brand Identity (LKR 35,000 la irundhu) — Complete identity and stationery.\n\nLogo refresh panna aasaiyaa?",
          needsLeadCapture: false,
          suggestedAction: "Ask about branding packages",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure 😊 Branding packages තියෙනවා:\n\n• Standalone Logo (LKR 8,000 සිට) — Logo design concepts.\n• Starter Brand Identity (LKR 15,000 සිට) — Logo, colors, සහ fonts.\n• Business Brand Identity (LKR 35,000 සිට) — සම්පූර්ණ identity සහ stationery.\n\nඅලුත් logo එකක් හදාගන්න කැමතිද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about branding packages",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure 😊 Branding packages இருக்கு:\n\n• Logo Design (LKR 8,000 முதல்) — Logo design concepts.\n• Starter Brand Identity (LKR 15,000 முதல்) — Logo, colors, மற்றும் fonts.\n• Business Brand Identity (LKR 35,000 முதல்) — Full identity மற்றும் stationery.\n\nLogo refresh செய்ய விரும்புகிறீர்களா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about branding packages",
        };
      }
      return {
        reply: "Sure 😊 Our branding packages include:\n\n• Standalone Logo Design (from LKR 8,000) — Custom logo concepts.\n• Starter Brand Identity (from LKR 15,000) — Logo design, color palette, and typography system.\n• Business Brand Identity (from LKR 35,000) — Full visual identity, stationery, and social media branding kit.\n\nWould you like a brand-new identity or a logo refresh?",
        needsLeadCapture: false,
        suggestedAction: "Ask about branding packages",
      };
    }

    if (effectiveTopic === "tiktok") {
      // Questions about first / starter
      if (
        normalized.includes("first") ||
        normalized.includes("palaweni") ||
        normalized.includes("palawani") ||
        normalized.includes("starter") ||
        normalized.includes("single") ||
        normalized.includes("පළවෙනි") ||
        normalized.includes("முதல்")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Starter TikTok package eka LKR 5,000 wenawa 😊 Single on-location shoot video ekak, editing, captions, and uploads okkoma api karala denawa.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter TikTok video",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Starter TikTok package එක LKR 5,000 වෙනවා 😊 තනි වීඩියෝවක් location එකට ඇවිත් shoot කරලා, edit කරලා, upload කරලා දෙනවා.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter TikTok video",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Starter TikTok package LKR 5,000 varum 😊 1 video on-location shoot panni, edit panni, captions and upload ellame nanga panrom.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter TikTok video",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Starter TikTok package LKR 5,000 வரும் 😊 1 video on-location shoot செய்து, edit செய்து, upload செய்து தருவோம்.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Starter TikTok video",
          };
        }
        return {
          reply: "Our Starter TikTok package is LKR 5,000 for a single video 😊 It includes client-location shoot, professional editing, captions, and upload.",
          needsLeadCapture: false,
          suggestedAction: "Ask about Starter TikTok video",
        };
      }

      // Second / Growth
      if (
        normalized.includes("second") ||
        normalized.includes("deweni") ||
        normalized.includes("growth") ||
        normalized.includes("4 video") ||
        normalized.includes("දෙවෙනි") ||
        normalized.includes("இரண்டாவது")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Growth TikTok package eka LKR 18,000/month wenawa 😊 Monthly videos 4k, on-location shooting, editing, captions, uploads, saha content planning labenawa.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth TikTok package",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Growth TikTok package එක මාසෙකට LKR 18,000 වෙනවා 😊 වීඩියෝ 4ක්, on-location shoot, professional editing, captions, සහ monthly content planning ඇතුළත්.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth TikTok package",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Growth TikTok package LKR 18,000/month varum 😊 4 videos, on-location shooting, editing, captions, uploads, and monthly planning ellame irukku.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth TikTok package",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Growth TikTok package மாதத்திற்கு LKR 18,000 வரும் 😊 4 videos, on-location shooting, editing, captions மற்றும் planning அடங்கும்.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Growth TikTok package",
          };
        }
        return {
          reply: "Our Growth TikTok package is LKR 18,000/month for 4 videos 😊 Includes on-location shooting, editing, captions, uploads, and monthly content planning.",
          needsLeadCapture: false,
          suggestedAction: "Ask about Growth TikTok package",
        };
      }

      // Third / Premium
      if (
        normalized.includes("third") ||
        normalized.includes("thunweni") ||
        normalized.includes("premium") ||
        normalized.includes("8 video") ||
        normalized.includes("තුන්වෙනි") ||
        normalized.includes("மூன்றாவது")
      ) {
        if (langStyle === "singlish") {
          return {
            reply: "Premium TikTok package eka LKR 32,000/month wenawa 😊 Promotional videos 8k, on-location shoot, professional editing, captions, uploads, and optimization okkoma labenawa.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Premium TikTok package",
          };
        }
        if (langStyle === "sinhala") {
          return {
            reply: "Premium TikTok package එක මාසෙකට LKR 32,000 වෙනවා 😊 ප්‍රවර්ධන වීඩියෝ 8ක්, on-location shoot, professional editing, captions, uploads, සහ optimization ඇතුළත්.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Premium TikTok package",
          };
        }
        if (langStyle === "tanglish") {
          return {
            reply: "Premium TikTok package LKR 32,000/month varum 😊 8 promotional videos, on-location shoot, professional editing, captions, uploads, and optimization ellame irukku.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Premium TikTok package",
          };
        }
        if (langStyle === "tamil") {
          return {
            reply: "Premium TikTok package மாதத்திற்கு LKR 32,000 வரும் 😊 8 promotional videos, on-location shoot, editing, captions மற்றும் upload அடங்கும்.",
            needsLeadCapture: false,
            suggestedAction: "Ask about Premium TikTok package",
          };
        }
        return {
          reply: "Our Premium TikTok package is LKR 32,000/month for 8 videos 😊 Includes on-location shooting, promotional concepts, professional editing, and optimization.",
          needsLeadCapture: false,
          suggestedAction: "Ask about Premium TikTok package",
        };
      }

      // Default TikTok package overview
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 TikTok video packages 3k thiyenawa:\n\n• Starter (LKR 5,000) — Single on-location shoot video\n• Growth (LKR 18,000/mo) — 4 videos, shoot, edit, captions & planning\n• Premium (LKR 32,000/mo) — 8 videos full promotional package\n\nMewayin oyalage business ekata galapena eka balamuda?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok packages",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure 😊 අපේ TikTok packages 3ක් තියෙනවා:\n\n• Starter (LKR 5,000) — තනි වීඩියෝවක් (on-location shoot, edit, upload)\n• Growth (LKR 18,000/මසකට) — වීඩියෝ 4ක් (shoot, editing, planning)\n• Premium (LKR 32,000/මසකට) — වීඩියෝ 8ක් (promotional concepts, shoot & edit)\n\nඔබගේ ව්‍යාපාරයට ගැලපෙන package එක බලමුද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok packages",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 TikTok video packages irukku:\n\n• Starter (LKR 5,000) — 1 on-location video with shoot & edit\n• Growth (LKR 18,000/mo) — 4 videos with monthly planning\n• Premium (LKR 32,000/mo) — 8 videos with full promotional concepts\n\nUnga business-ku edhu suit aagum nu paakkalaama?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok packages",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure 😊 எங்களிடம் TikTok video packages உள்ளன:\n\n• Starter (LKR 5,000) — 1 on-location video (shoot & edit)\n• Growth (LKR 18,000/மாதம்) — 4 videos with content planning\n• Premium (LKR 32,000/மாதம்) — 8 videos with promotional production\n\nஎந்த package பார்க்க விரும்புகிறீர்கள்?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok packages",
        };
      }
      return {
        reply: "Sure 😊 We have 3 dedicated TikTok video packages:\n\n• Starter (LKR 5,000) — Single on-location shoot video with professional editing & upload.\n• Growth (LKR 18,000/month) — 4 monthly videos with on-location shooting, captions & planning.\n• Premium (LKR 32,000/month) — 8 high-impact promotional videos with optimization.\n\nWhich of these would you like to explore for your brand?",
        needsLeadCapture: false,
        suggestedAction: "Ask about TikTok packages",
      };
    }

    // Context reference cannot be resolved — ask natural clarification instead of guessing
    if (langStyle === "singlish") {
      return {
        reply: "Sure — oya ahanne api kalin katha karapu service eka gana neda? Poddak kiyannako oyalata one monawada kiyala 😊",
        needsLeadCapture: false,
        suggestedAction: "Clarify your question",
      };
    }
    if (langStyle === "tanglish") {
      return {
        reply: "Sure — nanga pesittu irundha service pathi kekkareengala? Ungalukku enna theva nu sonnaa therinjukalam 😊",
        needsLeadCapture: false,
        suggestedAction: "Clarify your question",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply: "Sure — ඔබ අදහස් කළේ අපි කතා කරපු service එක හෝ packages ගැනද? මට තව පොඩ්ඩක් විස්තර කියන්න පුළුවන්ද? 😊",
        needsLeadCapture: false,
        suggestedAction: "Clarify your question",
      };
    }
    if (langStyle === "tamil") {
      return {
        reply: "Sure — நாங்க பேசின service அல்லது packages பற்றி கேக்கறீங்களா? கொஞ்சம் விவரமா சொன்னீங்கன்னா நான் உதவ முடியும் 😊",
        needsLeadCapture: false,
        suggestedAction: "Clarify your question",
      };
    }
    return {
      reply: "Sure — do you mean the service or packages we were just talking about? Could you tell me a little more so I can help directly? 😊",
      needsLeadCapture: false,
      suggestedAction: "Clarify your question",
    };
  }

  // 3. Customer Requirement & Intent Statements across languages
  if (isRequirementMessage(normalized)) {
    if (
      normalized.includes("social media") ||
      normalized.includes("instagram") ||
      normalized.includes("facebook") ||
      normalized.includes("smm") ||
      normalized.includes("සෝෂල්") ||
      normalized.includes("සමාජ") ||
      normalized.includes("fb") ||
      normalized.includes("insta") ||
      normalized.includes("சோஷியல்") ||
      normalized.includes("சமூக") ||
      (effectiveTopic === "social-media" && !normalized.includes("website") && !normalized.includes("brand"))
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Ow 😊 Api oyage social media manage karanna puluwan. Posts hadala, schedule karala okkoma api balagannam. Packages tika balamuda?",
          needsLeadCapture: false,
          suggestedAction: "View social media packages",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Aamanga 😊 Nanga unga social media manage pannuvom. Content design, post scheduling ellame nanga pathukkuvom. Packages paakkalaama?",
          needsLeadCapture: false,
          suggestedAction: "View social media packages",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "ඔව් 😊 අපි ඔබගේ social media manage කරලා දෙන්න පුළුවන්. Content හදලා, posts schedule කරලා ඔක්කොම අපි බලාගන්නවා. Packages ටික බලමුද?",
          needsLeadCapture: false,
          suggestedAction: "View social media packages",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "ஆம் 😊 நாங்கள் உங்கள் social media-வை manage செய்து தருகிறோம். Content, post design, scheduling எல்லாவற்றையும் நாங்களே பார்த்துக் கொள்வோம். Packages பார்க்கலாமா?",
          needsLeadCapture: false,
          suggestedAction: "View social media packages",
        };
      }
      return {
        reply: "Sure, we can manage it for you 😊 We handle the content creation, graphic design, and posting so you don't have to worry about it. Want to see the available packages?",
        needsLeadCapture: false,
        suggestedAction: "View social media packages",
      };
    }

    if (
      normalized.includes("website") ||
      normalized.includes("web design") ||
      normalized.includes("online store") ||
      normalized.includes("ecommerce") ||
      normalized.includes("landing page") ||
      normalized.includes("site") ||
      normalized.includes("වෙබ්") ||
      normalized.includes("வலைத்தளம்") ||
      (recentTopic === "website" && !normalized.includes("social"))
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Ow 😊 Api oyata clean, modern, mobile-friendly website ekak hadala dennam. Mokawage website ekakda oyata one?",
          needsLeadCapture: false,
          suggestedAction: "Share website goals",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Aamanga 😊 Clean, modern, mobile-friendly website create pannuvom. Enna mathiri website theva?",
          needsLeadCapture: false,
          suggestedAction: "Share website goals",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "ඔව් 😊 අපි ඔබට modern, mobile-friendly website එකක් හදලා දෙන්න පුළුවන්. මොනවගේ website එකක්ද අවශ්‍ය?",
          needsLeadCapture: false,
          suggestedAction: "Share website goals",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "ஆம் 😊 நவீன, clean, mobile-friendly website செய்து தருகிறோம். என்ன மாதிரி website தேவை?",
          needsLeadCapture: false,
          suggestedAction: "Share website goals",
        };
      }
      return {
        reply: "Sure, we can build it for you 😊 We design clean, modern, and mobile-friendly websites that showcase your business and bring in customers. What kind of website do you need?",
        needsLeadCapture: false,
        suggestedAction: "Share website goals",
      };
    }

    if (
      normalized.includes("brand") ||
      normalized.includes("logo") ||
      normalized.includes("ලෝගෝ") ||
      normalized.includes("බ්‍රෑන්ඩින්") ||
      normalized.includes("லோகோ") ||
      (recentTopic === "branding" && !normalized.includes("social") && !normalized.includes("website"))
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Ow 😊 Api logo eke indala complete branding hadala dennam. Business eke nama hari concept ekak hari thiyenawada?",
          needsLeadCapture: false,
          suggestedAction: "Discuss branding ideas",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Aamanga 😊 Logo-la irundhu full branding design panni tharom. Name illa concept edhavadhu irukkaa?",
          needsLeadCapture: false,
          suggestedAction: "Discuss branding ideas",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "ඔව් 😊 අපි logo එකේ සිට complete branding කරලා දෙන්න පුළුවන්. Business එකේ නමක් හෝ අදහසක් තියෙනවද?",
          needsLeadCapture: false,
          suggestedAction: "Discuss branding ideas",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "ஆம் 😊 Logo முதல் complete branding வரை செய்து தருகிறோம். பெயர் அல்லது concept ஏதேனும் உள்ளதா?",
          needsLeadCapture: false,
          suggestedAction: "Discuss branding ideas",
        };
      }
      return {
        reply: "Sure, we can design that for you 😊 From logo concepts to complete branding, we make sure your business looks polished and memorable. Do you already have a name or idea in mind?",
        needsLeadCapture: false,
        suggestedAction: "Discuss branding ideas",
      };
    }
  }

  // 4. Isolated / Short Follow-Up Questions ("How much?", "Price?", "Keeyada?", "Evlo?", "කීයද?", "எவ்வளவு?")
  if (
    normalized === "how much" ||
    normalized === "how much?" ||
    normalized === "how much is it" ||
    normalized === "how much is it?" ||
    normalized === "price?" ||
    normalized === "cost?" ||
    normalized === "keeyada" ||
    normalized === "keeyada?" ||
    normalized === "evlo" ||
    normalized === "evlo?" ||
    normalized === "කීයද?" ||
    normalized === "කීයද" ||
    normalized === "ගණන් කොහොමද" ||
    normalized === "ගණන් කොහොමද?" ||
    normalized === "எவ்வளவு?" ||
    normalized === "எவ்வளவு"
  ) {
    if (effectiveTopic === "social-media") {
      if (langStyle === "singlish") {
        return {
          reply: "Sure — oya ahanne social media packages gana neda? Ape packages LKR 14,000/month indala thiyenawa 😊",
          needsLeadCapture: false,
          suggestedAction: "View social media pricing",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure — social media packages pathi kekkareengala? Namma packages LKR 14,000/month la irundhu irukku 😊",
          needsLeadCapture: false,
          suggestedAction: "View social media pricing",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure — ඔබ අහන්නේ social media packages ගැන නේද? අපේ packages මාසෙකට LKR 14,000 සිට තියෙනවා 😊",
          needsLeadCapture: false,
          suggestedAction: "View social media pricing",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure — social media packages பற்றி கேக்கறீங்களா? எங்க packages மாதத்திற்கு LKR 14,000 முதல் உள்ளது 😊",
          needsLeadCapture: false,
          suggestedAction: "View social media pricing",
        };
      }
      return {
        reply: "Sure — do you mean the social media packages we were just talking about? Our packages start from LKR 14,000/month.",
        needsLeadCapture: false,
        suggestedAction: "View social media pricing",
      };
    }
    if (effectiveTopic === "website") {
      if (langStyle === "singlish") {
        return {
          reply: "Sure — website packages gana neda? Starter website ekak LKR 35,000 indala thiyenawa 😊",
          needsLeadCapture: false,
          suggestedAction: "View website pricing",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure — website packages pathi kekkareengala? Starter website LKR 35,000 la irundhu irukku 😊",
          needsLeadCapture: false,
          suggestedAction: "View website pricing",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure — website packages ගැන නේද? Starter website එකක් LKR 35,000 සිට තියෙනවා 😊",
          needsLeadCapture: false,
          suggestedAction: "View website pricing",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure — website packages பற்றி கேக்கறீங்களா? Starter website LKR 35,000 முதல் உள்ளது 😊",
          needsLeadCapture: false,
          suggestedAction: "View website pricing",
        };
      }
      return {
        reply: "Sure — do you mean the website packages we were just talking about? Our website packages start from LKR 35,000.",
        needsLeadCapture: false,
        suggestedAction: "View website pricing",
      };
    }
    if (effectiveTopic === "branding") {
      if (langStyle === "singlish") {
        return {
          reply: "Sure — branding packages gana neda? Standalone logo design LKR 8,000 indala, full identity LKR 15,000 indala thiyenawa 😊",
          needsLeadCapture: false,
          suggestedAction: "View branding pricing",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure — branding packages ගැන නේද? Logo design LKR 8,000 සිට සහ full brand identity LKR 15,000 සිට තියෙනවා 😊",
          needsLeadCapture: false,
          suggestedAction: "View branding pricing",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure — branding packages pathi kekkareengala? Logo design LKR 8,000 la irundhu, full identity LKR 15,000 la irundhu irukku 😊",
          needsLeadCapture: false,
          suggestedAction: "View branding pricing",
        };
      }
      return {
        reply: "Sure — do you mean the branding packages we were just talking about? Standalone logo design starts from LKR 8,000, and full brand identity from LKR 15,000.",
        needsLeadCapture: false,
        suggestedAction: "View branding pricing",
      };
    }
    if (effectiveTopic === "tiktok") {
      if (langStyle === "singlish") {
        return {
          reply: "Sure — TikTok video packages gana neda? Starter package eka LKR 5,000 indala, Growth package (4 videos) LKR 18,000/month wenawa 😊",
          needsLeadCapture: false,
          suggestedAction: "View TikTok pricing",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "Sure — ඔබ අහන්නේ TikTok packages ගැන නේද? Starter එක LKR 5,000 සිට සහ Growth package (වීඩියෝ 4ක්) මාසෙකට LKR 18,000 වෙනවා 😊",
          needsLeadCapture: false,
          suggestedAction: "View TikTok pricing",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure — TikTok packages pathi kekkareengala? Starter package LKR 5,000 la irundhu, Growth package LKR 18,000/month varum 😊",
          needsLeadCapture: false,
          suggestedAction: "View TikTok pricing",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "Sure — TikTok packages பற்றி கேக்கறீங்களா? Starter package LKR 5,000 முதல் மற்றும் Growth package மாதத்திற்கு LKR 18,000 வரும் 😊",
          needsLeadCapture: false,
          suggestedAction: "View TikTok pricing",
        };
      }
      return {
        reply: "Sure — do you mean the TikTok video packages we were just talking about? Starter starts from LKR 5,000, and Growth (4 videos/month) is LKR 18,000/month.",
        needsLeadCapture: false,
        suggestedAction: "View TikTok pricing",
      };
    }
    return {
      reply: "Sure! Which service or project would you like pricing for?",
      needsLeadCapture: false,
      suggestedAction: "Tell us what you need",
    };
  }

  // 5. Specific Pricing / Cost / Quote Lookups from live Turso Brain
  const isPricingIntent =
    normalized.includes("price") ||
    normalized.includes("pricing") ||
    normalized.includes("cost") ||
    normalized.includes("how much") ||
    normalized.includes("rate") ||
    normalized.includes("quote") ||
    normalized.includes("estimate") ||
    normalized.includes("budget") ||
    normalized.includes("starting from") ||
    normalized.includes("fee") ||
    normalized.includes("package") ||
    normalized.includes("packages") ||
    normalized.includes("keeyada") ||
    normalized.includes("ganan") ||
    normalized.includes("evlo") ||
    normalized.includes("vilai") ||
    normalized.includes("කීයද") ||
    normalized.includes("ගණන්") ||
    normalized.includes("මිල") ||
    normalized.includes("පැකේජ") ||
    normalized.includes("පැකේජ්") ||
    normalized.includes("எவ்வளவு") ||
    normalized.includes("விலை") ||
    normalized.includes("பேக்கேஜ்");

  if (isPricingIntent) {
    let serviceSearchTerm = cleanPricingQuery(normalized);
    if (serviceSearchTerm.length < 2 && effectiveTopic) {
      serviceSearchTerm = effectiveTopic.replace("-", " ");
    }

    // Direct match for TikTok video packages pricing
    if (
      serviceSearchTerm.includes("tiktok") ||
      serviceSearchTerm.includes("tik tok") ||
      serviceSearchTerm.includes("ටක්ටොක්") ||
      serviceSearchTerm.includes("ටික්ටොක්") ||
      serviceSearchTerm.includes("டிக்டாக்") ||
      serviceSearchTerm.includes("டிக் டாக்")
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Ape TikTok video packages LKR 5,000 (Starter - single video) indala LKR 32,000/month (Premium - 8 videos) wenakam thiyenawa. Extra video add-ons LKR 5,000 wenawa. Oyalata one details tika mama kiyannada?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok package details",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 Namma TikTok video packages LKR 5,000 (Starter - 1 video) la irundhu LKR 32,000/month (Premium - 8 videos) varaikkum irukku. Extra video add-ons LKR 5,000 varum. Ungalukku enna theva nu sonnaa correct package solren.",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok package details",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "අපේ TikTok video packages LKR 5,000 (Starter - තනි වීඩියෝවක්) සිට LKR 32,000/මසකට (Premium - වීඩියෝ 8ක්) දක්වා තියෙනවා 😊 Extra video add-on එක LKR 5,000 වෙනවා. විස්තර කියන්නද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok package details",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "எங்க TikTok video packages LKR 5,000 (Starter - 1 video) முதல் LKR 32,000/மாதம் (Premium - 8 videos) வரை இருக்கு 😊 Extra video add-on LKR 5,000 வரும். விவரங்கள் சொல்லவா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about TikTok package details",
        };
      }
      return {
        reply: "Sure 😊 Our TikTok packages start from LKR 5,000 (Starter — 1 video with shoot & editing), LKR 18,000/month for Growth (4 videos), and LKR 32,000/month for Premium (8 videos). Extra video add-ons are LKR 5,000 each. Would you like details on what's included?",
        needsLeadCapture: false,
        suggestedAction: "Ask about TikTok package details",
      };
    }

    // Direct match for social media pricing
    if (
      serviceSearchTerm.includes("social media") ||
      serviceSearchTerm.includes("marketing") ||
      serviceSearchTerm.includes("smm") ||
      serviceSearchTerm.includes("සෝෂල්") ||
      serviceSearchTerm.includes("සමාජ") ||
      serviceSearchTerm.includes("சோஷியல்") ||
      serviceSearchTerm.includes("சமூக")
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Ape social media packages LKR 14,000/month (Starter package) indala LKR 40,000/month (Premium) wenakam thiyenawa. Oyalata one details tika mama kiyannada?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 Namma social media packages LKR 14,000/month (Starter) la irundhu LKR 40,000/month (Premium) varaikkum irukku. Ungalukku enna theva nu sonnaa correct package solren.",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "අපේ social media packages මාසෙකට LKR 14,000 (Starter) සිට LKR 40,000 (Premium) දක්වා තියෙනවා 😊 විස්තර කියන්නද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "எங்க social media packages மாதத்திற்கு LKR 14,000 (Starter) முதல் LKR 40,000 (Premium) வரை இருக்கு 😊 விவரங்கள் சொல்லவா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about package details",
        };
      }
      return {
        reply: "Sure 😊 Our social media packages start from LKR 14,000/month (Starter package) up to LKR 40,000/month (Premium package). If you tell me what you need help with, I can show you the right package.",
        needsLeadCapture: false,
        suggestedAction: "Ask about package details",
      };
    }

    // Direct match for website packages pricing
    if (
      serviceSearchTerm.includes("website") ||
      serviceSearchTerm.includes("web") ||
      serviceSearchTerm.includes("site") ||
      serviceSearchTerm.includes("ecommerce") ||
      serviceSearchTerm.includes("e-commerce") ||
      serviceSearchTerm.includes("landing page") ||
      serviceSearchTerm.includes("වෙබ්") ||
      serviceSearchTerm.includes("வலைத்தளம்")
    ) {
      if (langStyle === "singlish") {
        return {
          reply: "Sure 😊 Ape website packages LKR 35,000 (Starter Website - pages 5k) indala LKR 150,000 (Corporate Website) wenakam thiyenawa. Business Website eka LKR 75,000 wenawa. Custom platforms walatath api solutions denawa. Oyalata one details tika mama kiyannada?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website package details",
        };
      }
      if (langStyle === "tanglish") {
        return {
          reply: "Sure 😊 Namma website packages LKR 35,000 (Starter Website - 5 pages) la irundhu LKR 150,000 (Corporate Website) varaikkum irukku. Business Website LKR 75,000 varum. Ungalukku enna theva nu sonnaa correct package solren.",
          needsLeadCapture: false,
          suggestedAction: "Ask about website package details",
        };
      }
      if (langStyle === "sinhala") {
        return {
          reply: "අපේ website packages LKR 35,000 (Starter Website - pages 5ක්) සිට LKR 150,000 (Corporate Website) දක්වා තියෙනවා 😊 Business Website එක LKR 75,000 වෙනවා. විස්තර දැනගන්න කැමතිද?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website package details",
        };
      }
      if (langStyle === "tamil") {
        return {
          reply: "எங்க website packages LKR 35,000 (Starter Website - 5 pages) முதல் LKR 150,000 (Corporate Website) வரை இருக்கு 😊 Business Website LKR 75,000 வரும். விவரங்கள் சொல்லவா?",
          needsLeadCapture: false,
          suggestedAction: "Ask about website package details",
        };
      }
      return {
        reply: "Sure 😊 Our website packages start from LKR 35,000 for Starter (up to 5 pages), LKR 75,000 for Business (up to 10 pages with CMS & blog), and LKR 150,000 for Corporate (tailored multi-page build). We also build custom web solutions. Would you like details on what's included?",
        needsLeadCapture: false,
        suggestedAction: "Ask about website package details",
      };
    }

    if (serviceSearchTerm.length >= 2) {
      try {
        const pricingResult = await getBrainServicePricing(serviceSearchTerm);

        if (pricingResult.status === "match") {
          const s = pricingResult.service;
          const displayPrice = pricingResult.displayPrice;
          const inclusionsText =
            pricingResult.inclusions && pricingResult.inclusions.length > 0
              ? ` It includes: ${pricingResult.inclusions.slice(0, 3).join(", ")}.`
              : "";

          if (langStyle === "singlish") {
            return {
              reply: `Sure 😊 Ape ${s.name} eka ${displayPrice} wenawa.${inclusionsText} Mewaye thawa details kiyannada?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "sinhala") {
            return {
              reply: `Sure 😊 අපේ ${s.name} එක ${displayPrice} වෙනවා.${inclusionsText} වැඩි විස්තර දැනගන්න කැමතිද?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "tanglish") {
            return {
              reply: `Sure 😊 Namma ${s.name} ${displayPrice} varum.${inclusionsText} Idhoda details sollatumaa?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "tamil") {
            return {
              reply: `Sure 😊 எங்கள் ${s.name} ${displayPrice} வரும்.${inclusionsText} விவரங்கள் சொல்லவா?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          return {
            reply: `Sure 😊 Our ${s.name} is ${displayPrice}.${inclusionsText} Want me to share more details on what's included?`,
            needsLeadCapture: false,
            suggestedAction: "Ask about package inclusions",
          };
        }

        if (pricingResult.status === "ambiguous") {
          const candidateNames = pricingResult.candidates.map((c) => c.name).join(", ");
          return {
            reply: `Sure 😊 We have a few options available: ${candidateNames}. Which one would you like details on?`,
            needsLeadCapture: false,
            suggestedAction: "Ask about a specific package",
          };
        }

        // Try search across active brain services if getBrainServicePricing didn't resolve
        const allServices = await fetchActiveBrainServices();
        const searchWords = serviceSearchTerm.split(/\s+/).filter((w) => w.length >= 3);
        const matches = allServices.filter((s) => {
          const n = s.name.toLowerCase();
          const d = (s.description || "").toLowerCase();
          return searchWords.some((w) => n.includes(w) || d.includes(w));
        }).slice(0, 3);

        if (matches.length > 0) {
          const optionsText = matches.map((m) => m.name).join(", ");
          return {
            reply: `Sure 😊 For that, we offer: ${optionsText}. Which one would you like pricing and details on?`,
            needsLeadCapture: false,
            suggestedAction: "Ask about a service",
          };
        }
      } catch {
        // Fall through
      }
    }

    if (langStyle === "singlish") {
      return {
        reply: "Ape branding, website, saha social media packages walata thiyenne straightforward pricing 😊 Oyata one monawada kiyala kiyanawada?",
        needsLeadCapture: false,
        suggestedAction: "Tell us what you need",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply: "අපේ branding, website, සහ social media සේවාවන් සඳහා සාධාරණ පැහැදිලි මිල ගණන් පවතී 😊 ඔබට අවශ්‍ය කුමක්දැයි කියන්න පුළුවන්ද?",
        needsLeadCapture: false,
        suggestedAction: "Tell us what you need",
      };
    }
    return {
      reply: "We offer straightforward pricing across our branding, website, and social media services 😊 Tell me what you're looking to build and I'll share the exact package options.",
      needsLeadCapture: false,
      suggestedAction: "Tell us what you need",
    };
  }

  // 6. Broad Services & Agency Capabilities Overview (Handled before specific FAQ lookups)
  if (isBroadServiceInquiry(normalized)) {
    if (langStyle === "singlish") {
      return {
        reply:
          "Api pradhana washayen me dewal 3 karala denawa 😊\n\n• Brand Identity & Strategy (logos, visual systems, guidelines)\n• Website Design & Development (custom responsive websites, e-commerce)\n• Social Media Management (content creation, posts, reels, campaigns)\n\nMewayin oyalage business ekata one mona ekada?",
        needsLeadCapture: false,
        suggestedAction: "Ask about a service",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply:
          "අපි ප්‍රධාන වශයෙන් සේවා අංශ 3කින් ඔබට උදව් කරනවා 😊\n\n• Brand Identity & Strategy (logos, visual branding)\n• Website Design & Development (custom responsive websites)\n• Social Media Management (posts, reels, page management)\n\nඔබගේ ව්‍යාපාරයට මූලිකවම අවශ්‍ය මොන සේවාවද?",
        needsLeadCapture: false,
        suggestedAction: "Ask about a service",
      };
    }
    if (langStyle === "tanglish") {
      return {
        reply:
          "Nanga main-aa 3 areas-la help panrom 😊\n\n• Brand Identity & Logo Design\n• Website Design & Development\n• Social Media Management (posts, reels, campaigns)\n\nUnga business-ku idhula edhu theva?",
        needsLeadCapture: false,
        suggestedAction: "Ask about a service",
      };
    }
    if (langStyle === "tamil") {
      return {
        reply:
          "நாங்கள் பிரதானமாக 3 முக்கிய சேவைகளை வழங்குகிறோம் 😊\n\n• Brand Identity & Strategy (logos, visual branding)\n• Website Design & Development (custom websites, e-commerce)\n• Social Media Management (posts, reels, campaigns)\n\nஉங்கள் business-க்கு இதில் எது தேவைப்படுகிறது?",
        needsLeadCapture: false,
        suggestedAction: "Ask about a service",
      };
    }
    return {
      reply:
        "We specialize in 3 core areas 😊\n\n• Brand Identity & Strategy (logos, visual systems, brand guidelines)\n• Website Design & Development (custom responsive websites, e-commerce, web solutions)\n• Social Media Management (content creation, posts, reels, and growth campaigns)\n\nWhich of these would you like to explore for your business?",
      needsLeadCapture: false,
      suggestedAction: "Ask about a service",
    };
  }

  // 7. Add-ons Inquiry from live Turso Brain
  if (
    normalized.includes("add-on") ||
    normalized.includes("addon") ||
    normalized.includes("addons") ||
    normalized.includes("extra") ||
    normalized.includes("extension")
  ) {
    try {
      const addons = await fetchActiveBrainAddons();
      if (addons.length > 0) {
        const topAddons = addons.slice(0, 4);
        const listText = topAddons
          .map((a) => `${a.name} (${formatBrainPriceDisplay(a)})`)
          .join(", ");
        return {
          reply: `Sure 😊 We provide extra add-ons including: ${listText}. Would you like to add any of these to your package?`,
          needsLeadCapture: false,
          suggestedAction: "Ask about add-ons",
        };
      }
    } catch {
      // Fall through
    }
  }

  // 7. Authoritative FAQs from live Turso Brain (Protected against generic words and low confidence)
  try {
    const matchedFaqs = await searchBrainFaqs(message, 1);
    if (matchedFaqs.length > 0) {
      const match = matchedFaqs[0];
      return {
        reply: match.answer,
        needsLeadCapture: false,
        suggestedAction: "Ask another question",
      };
    }
  } catch {
    // Fall back to CMS FAQs if Turso Brain query encounters issues
  }

  // CMS FAQs fallback (requires substantial question keyword overlap)
  try {
    const faqs = await getPublishedFaqs();
    const activeFaqs = faqs && faqs.length > 0 ? faqs : fallbackFaqs;
    const meaningfulQueryWords = normalized.split(/\s+/).filter((w) => w.length >= 4);
    if (meaningfulQueryWords.length >= 2) {
      const matchingFaq = activeFaqs.find((f) => {
        const qLower = f.question.toLowerCase();
        return meaningfulQueryWords.every((w) => qLower.includes(w));
      });

      if (matchingFaq) {
        return {
          reply: matchingFaq.answer,
          needsLeadCapture: false,
        };
      }
    }
  } catch {
    // Continue
  }

  // 8. Services, Capabilities & Offerings
  if (
    normalized.includes("service") ||
    normalized.includes("offer") ||
    normalized.includes("website") ||
    normalized.includes("web design") ||
    normalized.includes("branding") ||
    normalized.includes("logo") ||
    normalized.includes("marketing") ||
    normalized.includes("seo") ||
    normalized.includes("e-commerce") ||
    normalized.includes("ecommerce") ||
    normalized.includes("සේවා") ||
    normalized.includes("මොනවද කරන්නේ") ||
    normalized.includes("සේවාවන්") ||
    normalized.includes("சேவைகள்") ||
    normalized.includes("என்ன பண்றீங்க") ||
    normalized.includes("services monawada") ||
    normalized.includes("monawada karanne") ||
    normalized.includes("services enna")
  ) {
    try {
      const allServices = await fetchActiveBrainServices();
      const queryWords = message.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
      const matches = allServices.filter((s) => {
        const n = s.name.toLowerCase();
        return queryWords.some((w) => n.includes(w));
      }).slice(0, 3);
      if (matches.length > 0) {
        return {
          reply: `We offer ${matches.map((s) => s.name).join(", ")} 😊 Would you like to see package prices or what's included?`,
          needsLeadCapture: false,
          suggestedAction: "Ask for pricing",
        };
      }
    } catch {
      // Fall back
    }

    if (langStyle === "singlish") {
      return {
        reply: "Api brand identity, websites, saha social media management karala denawa 😊 Oyalage business eka gana kiyannako, galapena package eka kiyannam.",
        needsLeadCapture: false,
        suggestedAction: "Ask for a recommendation",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply: "අපි brand identity, websites, සහ social media management සේවාවන් ලබා දෙනවා 😊 ඔබේ ව්‍යාපාරය ගැන කියන්න, වඩාත්ම ගැලපෙන package එක තෝරා දෙන්නම්.",
        needsLeadCapture: false,
        suggestedAction: "Ask for a recommendation",
      };
    }
    if (langStyle === "tanglish") {
      return {
        reply: "Nanga brand identity, websites, and social media management panrom 😊 Unga business pathi sonnaa, correct package recommend panren.",
        needsLeadCapture: false,
        suggestedAction: "Ask for a recommendation",
      };
    }
    if (langStyle === "tamil") {
      return {
        reply: "நாங்கள் brand identity, websites, மற்றும் social media management செய்கிறோம் 😊 உங்கள் business பற்றி சொல்லுங்கள், சரியான package-ஐ பரிந்துரைக்கிறேன்.",
        needsLeadCapture: false,
        suggestedAction: "Ask for a recommendation",
      };
    }
    return {
      reply: "We specialize in brand identity, websites, and social media management 😊 Tell me a little about your business, and I can recommend the right package.",
      needsLeadCapture: false,
      suggestedAction: "Ask for a recommendation",
    };
  }

  // 9. Agency Process
  if (
    normalized.includes("process") ||
    normalized.includes("how it works") ||
    normalized.includes("how we work") ||
    normalized.includes("steps") ||
    normalized.includes("timeline")
  ) {
    return {
      reply: `Our process is simple and collaborative: ${profile.process.join(" → ")} 😊 We keep you updated at every step. Want to learn more about how we work?`,
      needsLeadCapture: false,
      suggestedAction: "Learn about the process",
    };
  }

  // 10. Contact Details
  if (
    normalized.includes("contact") ||
    normalized.includes("email") ||
    normalized.includes("phone") ||
    normalized.includes("call") ||
    normalized.includes("address") ||
    normalized.includes("location") ||
    normalized.includes("hours")
  ) {
    return {
      reply: `You can reach our team directly on WhatsApp at ${profile.contactNumber} or email us at ${profile.email} 😊`,
      needsLeadCapture: false,
      suggestedAction: "Contact the team",
    };
  }

  // 11. Greetings & Introductions
  if (
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey") ||
    normalized.includes("ayubowan") ||
    normalized.includes("vanakkam") ||
    normalized.includes("ආයුබෝවන්") ||
    normalized.includes("வணக்கம்") ||
    normalized.includes("කොහොමද") ||
    normalized.includes("හායි") ||
    normalized.includes("halo") ||
    normalized === "hive"
  ) {
    if (langStyle === "singlish") {
      return {
        reply: "Ayubowan! Hey 😊 Mama kohomada oyata udaw karanne?",
        needsLeadCapture: false,
        suggestedAction: "Ask about services or pricing",
      };
    }
    if (langStyle === "tanglish") {
      return {
        reply: "Vanakkam! Hey 😊 Ungalukku eppadi help panna mudiyum?",
        needsLeadCapture: false,
        suggestedAction: "Ask about services or pricing",
      };
    }
    if (langStyle === "sinhala") {
      return {
        reply: "ආයුබෝවන්! 😊 මම ඔබට කොහොමද උදව් කරන්නේ?",
        needsLeadCapture: false,
        suggestedAction: "Ask about services or pricing",
      };
    }
    if (langStyle === "tamil") {
      return {
        reply: "வணக்கம்! 😊 உங்களுக்கு எப்படி உதவ முடியும்?",
        needsLeadCapture: false,
        suggestedAction: "Ask about services or pricing",
      };
    }
    return {
      reply: "Hey! 😊 How can I help?",
      needsLeadCapture: false,
      suggestedAction: "Ask about services or pricing",
    };
  }

  // 12. Default Fallback
  if (langStyle === "singlish") {
    return {
      reply: "Hey 😊 Mama methana inne branding, websites, saha social media gana udaw karanna. Oyalage business ekata monawada karaganna one?",
      needsLeadCapture: false,
      suggestedAction: "Ask about services or pricing",
    };
  }
  if (langStyle === "sinhala") {
    return {
      reply: "ආයුබෝවන් 😊 මම ඉන්නේ branding, websites, හෝ social media management ගැන උදව් කරන්න. ඔබේ ව්‍යාපාරයට මොනවගේ සේවාවක්ද අවශ්‍ය?",
      needsLeadCapture: false,
      suggestedAction: "Ask about services or pricing",
    };
  }
  if (langStyle === "tanglish") {
    return {
      reply: "Hey 😊 Branding, website, social media management ellathukkum help panren. Unga business-ku enna theva?",
      needsLeadCapture: false,
      suggestedAction: "Ask about services or pricing",
    };
  }
  if (langStyle === "tamil") {
    return {
      reply: "வணக்கம் 😊 Branding, websites, மற்றும் social media management சம்பந்தமாக உதவ நான் இருக்கிறேன். உங்கள் business-க்கு என்ன சேவை தேவைப்படுகிறது?",
      needsLeadCapture: false,
      suggestedAction: "Ask about services or pricing",
    };
  }
  return {
    reply: "Hey 😊 I'm here to help with branding, websites, or social media management. What are you looking to do for your business?",
    needsLeadCapture: false,
    suggestedAction: "Ask about services or pricing",
  };
}

// =============================================================================
// ENTRY POINTS
// =============================================================================

/**
 * Route message to Website fallback knowledge engine.
 */
export async function getFallbackReply(
  message: string,
  _channel: string = "web",
  history: Array<{ role: "assistant" | "user"; content: string }> = []
): Promise<HiveResponse> {
  return getWebsiteFallbackReply(message, history);
}

// =============================================================================
// EXPORTED GEMINI CALL PRIMITIVE
// =============================================================================
// GeminiCallResult and callGeminiEndpoint are exported so that focused tests can
// exercise the REAL production Gemini request logic with a mock fetch function,
// without needing a live Turso/DB connection or real API credentials.
// The production processHiveMessage function delegates its Gemini calls through
// this exported function.

export type GeminiCallResult = {
  ok: boolean;          // true only when HTTP 200 and non-empty text was extracted
  httpStatus: number;   // raw HTTP status (0 = network/fetch exception)
  text: string;         // extracted text from candidates[0].content.parts[0].text
  finishReason: string; // finishReason from first candidate (empty string if absent)
  fetchError?: string;  // message from a thrown fetch exception
};

/** Subset of fetch options needed by callGeminiEndpoint */
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/**
 * Core Gemini REST call primitive — exported for testing.
 * The production processHiveMessage closure calls this function so tests can
 * inject a mock fetch and exercise the REAL parsing and empty-response logic.
 *
 * thinkingConfig policy:
 *  - Omitted for non-thinking models (e.g. gemini-3.8-flash) — sending it causes
 *    empty candidates (confirmed root cause of the original empty-output error).
 *  - gemini-2.5-* variants receive thinkingBudget: 0 to disable thinking mode.
 */
export async function callGeminiEndpoint(
  targetModel: string,
  apiKey: string,
  systemPrompt: string,
  geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  fetchFn: FetchLike = fetch,
  signal?: AbortSignal
): Promise<GeminiCallResult> {
  const cleanModel = targetModel.trim().replace(/^["']|["']$/g, "").replace(/^models\//, "");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.3,
    maxOutputTokens: 350,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  try {
    const res = await fetchFn(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig,
      }),
      signal,
    });

    if (!res.ok) {
      console.warn(`[HIVE AI] Model "${cleanModel}" HTTP ${res.status}.`);
      return { ok: false, httpStatus: res.status, text: "", finishReason: "" };
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const finishReason: string = candidate?.finishReason ?? "";
    const text: string = candidate?.content?.parts?.[0]?.text ?? "";
    const hasUsableText = typeof text === "string" && text.trim().length > 0;

    if (!hasUsableText) {
      console.warn(
        `[HIVE AI] Model "${cleanModel}" returned no usable text.`,
        `HTTP ${res.status} | finishReason: ${finishReason || "(absent)"}`,
        `candidateCount: ${data?.candidates?.length ?? 0}`,
        data?.promptFeedback?.blockReason
          ? `| promptBlocked: ${data.promptFeedback.blockReason}`
          : ""
      );
      return { ok: false, httpStatus: res.status, text: "", finishReason };
    }

    return { ok: true, httpStatus: res.status, text, finishReason };
  } catch (err) {
    const fetchError = err instanceof Error ? err.message : "Network error";
    console.warn(`[HIVE AI] Model "${cleanModel}" fetch threw: ${fetchError}`);
    return { ok: false, httpStatus: 0, text: "", finishReason: "", fetchError };
  }
}

/**
 * Main HIVE AI processor for BrandHive Studio Website.
 */
export async function processHiveMessage(options: HiveMessageOptions): Promise<HiveResponse> {
  const { message, history = [] } = options;
  const apiKey = process.env.GEMINI_API_KEY;

  const formattedHistory: Array<{ role: "assistant" | "user"; content: string }> = history.map((entry) => ({
    role: entry.role === "assistant" ? "assistant" : "user",
    content: entry.content,
  }));

  if (!apiKey) {
    return getFallbackReply(message, "web", formattedHistory);
  }

  try {
    // WEBSITE HIVE AI: Live Turso Brain services & LKR pricing context with multilingual intelligence
    const { profile, services: activeServices } = await getWebsiteBrainData();
    const detectedLang = detectLanguageStyle(message, formattedHistory);

    let servicesContext = "";
    if (activeServices.length > 0) {
      const contextQuery = [
        message,
        ...history.slice(-3).map((h) => h.content),
      ].join(" ");
      servicesContext = getRelevantServicesContext(activeServices, contextQuery);
    }

    const langDirectiveMap: Record<LanguageStyle, string> = {
      singlish: `TARGET LANGUAGE/STYLE: SINGLISH (Sinhala written in English/Roman letters).
- MUST reply in natural, friendly Sri Lankan colloquial Singlish.
- Use natural Romanized Sinhala phrasing (e.g. "Ow 😊", "Api oyage social media manage karanna puluwan", "Posts hadala, schedule karala okkoma api balagannam", "Packages tika balamuda?", "thiyenawa").
- Standard English business terms can remain in English where natural (e.g. "social media", "posts", "reels", "package", "Starter", "Growth", "Premium", "website", "branding").
- STRICT PROHIBITION: NEVER use Tamil words (such as "kandippen", "kandippa", "vanakkam", "sollunga", "irukku", "adhu", "evlo").
- STRICT PROHIBITION: Do NOT output Sinhala Unicode script unless the user mixed Sinhala script into their message.
- Keep the grammar and rhythm natural to everyday Sri Lankan chat.`,

      sinhala: `TARGET LANGUAGE/STYLE: SINHALA SCRIPT (සිංහල).
- MUST reply in natural, welcoming Sinhala script (e.g. "ඔව් 😊 අපි ඔබගේ social media manage කරලා දෙන්න පුළුවන්. Content හදලා, posts schedule කරලා ඔක්කොම අපි බලාගන්නවා. Packages ටික බලමුද?").
- Common loan terms ("social media", "website", "branding", "posts", "reels", "packages", "Starter", "Growth", "Premium") may remain in English script where appropriate.
- STRICT PROHIBITION: NEVER reply in English when the user communicates in Sinhala script.
- STRICT PROHIBITION: NEVER use Tamil words or script.`,

      tanglish: `TARGET LANGUAGE/STYLE: TANGLISH (Tamil written in English/Roman letters).
- MUST reply in natural, friendly colloquial Tanglish (e.g. "Aamanga 😊 Nanga unga social media manage pannuvom. Content design, post scheduling ellame nanga pathukkuvom. Packages paakkalaama?").
- Standard English business terms can remain ("social media", "posts", "reels", "packages").
- STRICT PROHIBITION: NEVER use Sinhala words (such as "karanawa", "monawada", "keeyada", "puluwan", "ayubowan").`,

      tamil: `TARGET LANGUAGE/STYLE: TAMIL SCRIPT (தமிழ்).
- MUST reply in natural, welcoming Tamil script (e.g. "ஆம் 😊 நாங்கள் உங்கள் social media-வை manage செய்து தருகிறோம். Content, post design, scheduling எல்லாவற்றையும் நாங்களே பார்த்துக் கொள்வோம். Packages பார்க்கலாமா?").
- STRICT PROHIBITION: NEVER reply in English when the user communicates in Tamil script.
- STRICT PROHIBITION: NEVER use Sinhala words or script.`,

      en: `TARGET LANGUAGE/STYLE: ENGLISH.
- Reply in warm, natural, friendly conversational English. Keep it simple, human, and direct.`,
    };

    const systemPrompt = `You are Hive, a friendly, warm, and helpful sales & support specialist chatting with a visitor on BrandHive Studio's website (${profile.websiteUrl}).

==================================================
MANDATORY LANGUAGE/STYLE DIRECTIVE FOR THIS TURN:
${langDirectiveMap[detectedLang]}
==================================================

COMMUNICATE LIKE A REAL HUMAN:
- Talk like a real human team member having a natural chat, NOT an AI, software system, or corporate brochure.
- Keep replies SHORT (1 to 4 short sentences).
- Use everyday, simple words. Assume the customer has little or no knowledge of digital marketing, design, or websites.
- Acknowledge what the customer just said with warmth:
  • For English: "Sure 😊", "No problem 😊", "Yes 😊"
  • For Singlish: "Ow 😊", "Aniwarenma 😊", "Sure 😊"
  • For Sinhala: "ඔව් 😊", "අනිවාර්යයෙන්ම 😊", "Sure 😊"
  • For Tanglish: "Aamanga 😊", "Kandippa 😊", "Sure 😊"
  • For Tamil: "ஆம் 😊", "கண்டிப்பா 😊", "Sure 😊"
- Answer the customer's actual question directly in the very first sentence.
- NEVER use technical or corporate jargon such as: "scope", "conversion", "CMS", "API", "lead capture", "knowledge base", "UI/UX", "deliverables", "project planner", or "onboarding".
- Do not repeat information the customer already knows.
- Do not introduce BrandHive in every reply.
- Do not sound like a sales script or an AI describing its capabilities.
- Avoid corporate filler like "I'd be delighted to assist" or "based on your requirements".

CONVERSATIONAL CONTEXT & PRONOUNS:
- Pay close attention to previous messages.
- If the customer uses words like "they", "it", "that", "those", "the first one", "how much?", "what are they?", "packages monawada?", "eka keeyada?", "පැකේජ් මොනවද?", "ඒක කීයද?", "adhu evlo?", resolve them using the previous conversation context. Never restart or treat follow-ups as disconnected.
- If a short follow-up genuinely cannot be resolved from context, ask a short, natural clarification instead of guessing or answering an unrelated topic.

PLATFORM ISOLATION & ACCURACY (CRITICAL):
- If the customer asks about TikTok, TikTok videos, or TikTok packages, ONLY present and quote TikTok video packages from the catalog below (Single Video LKR 5,000, Growth 4 videos/month LKR 18,000, Premium 8 videos/month LKR 32,000, Additional Video LKR 5,000). NEVER quote Facebook, Instagram, or SMM post packages for TikTok inquiries.
- If the customer asks about Social Media / SMM / Facebook / Instagram, quote the Social Media packages from the catalog below (Starter Organic LKR 14,000/month, Starter + Boosting LKR 20,000/month, Growth LKR 25,000/month, Premium LKR 40,000/month). Ad budgets are separate unless otherwise stated.
- If the customer asks about Websites, quote Website packages from the catalog below (Starter LKR 35,000, Business LKR 75,000, Corporate LKR 150,000, Custom — custom quote).
- If the customer asks about Branding/Logo, quote from the catalog below (Logo Design from LKR 8,000, Starter Brand Identity from LKR 15,000, Business Brand Identity from LKR 35,000, Premium from LKR 75,000).

REQUIREMENTS & GOALS:
- If a customer says what they need (e.g., "I need you to run my business social media", "oyaala social media manage karanawada?", "ඔයාලා සෝෂල් මීඩියා මැනේජ් කරනවද?"), acknowledge it directly and warmly, and naturally ask if they'd like to see the available packages.

AUTHORITATIVE LKR PRICING (NEVER GUESS):
- Always quote exact prices in LKR from the authoritative catalog below.
- Never invent, estimate, or guess prices.
- If they ask about pricing, state the starting price or package range immediately.

FOLLOW-UP QUESTIONS & LEAD CAPTURE:
- Ask at most ONE simple follow-up question, and only when it naturally helps the conversation.
- Do NOT push for name, email, or company details during normal exploratory questions.
- Set "needsLeadCapture": true ONLY when the customer explicitly asks to start a project, request a proposal, book a call, or give their contact details. Otherwise keep it false.

RESPONSE FORMAT:
Return valid JSON with keys:
- "reply": (string) Short, natural, human response in the user's language/style.
- "needsLeadCapture": (boolean) True only when ready for contact/signup.
- "suggestedAction": (string, optional) Brief helpful action label.

CONVERSATION EXAMPLES (FOLLOW THESE PATTERNS):

[TikTok Example]
Customer: "tiktok packages monawada?"
Hive: "TikTok video packages 3k thiyenawa 😊 Starter (LKR 5,000 - single shoot video), Growth (LKR 18,000/mo - 4 videos), saha Premium (LKR 32,000/mo - 8 videos). Oyage business ekata galapenne mona ekada?"
Customer: "how much for tiktok?"
Hive: "Our TikTok packages start from LKR 5,000 for a single video, or LKR 18,000/month for 4 videos with on-location shoot and editing 😊 Would you like to see what's included?"

[Singlish Example]
Customer: "oyaala social media manage karanawada?"
Hive: "Ow 😊 Api oyage social media manage karanna puluwan. Posts hadala, schedule karala okkoma api balagannam. Packages tika balamuda?"
Customer: "packages monawada?"
Hive: "Packages 3k thiyenawa 😊 Starter (LKR 14,000/mo indala), Growth (LKR 25,000/mo), saha Premium (LKR 40,000/mo). Mewaye details tika kiyannada?"
Customer: "eka keeyada?"
Hive: "Starter eka LKR 14,000/mo, Growth eka LKR 25,000/mo, Premium eka LKR 40,000/mo wenawa 😊 Oyalata galapenne mona ekada?"

[Sinhala Script Example]
Customer: "ඔයාලා සෝෂල් මීඩියා මැනේජ් කරනවද?"
Hive: "ඔව් 😊 අපි ඔබගේ social media manage කරලා දෙන්න පුළුවන්. Content හදලා, posts schedule කරලා ඔක්කොම අපි බලාගන්නවා. Packages ටික බලමුද?"
Customer: "පැකේජ් මොනවද?"
Hive: "අපේ packages 3ක් තියෙනවා 😊 Starter (LKR 14,000/mo සිට), Growth (LKR 25,000/mo), සහ Premium (LKR 40,000/mo). වැඩි විස්තර දැනගන්න කැමතිද?"
Customer: "ඒක කීයද?"
Hive: "Starter එක LKR 14,000/mo, Growth එක LKR 25,000/mo, Premium එක LKR 40,000/mo වෙනවා 😊 ඔබට වඩාත්ම ගැලපෙන්නේ මොකක්ද?"

[Tanglish Example]
Customer: "social media manage panreengala?"
Hive: "Aamanga 😊 Nanga unga social media manage pannuvom. Content design, post scheduling ellame nanga pathukkuvom. Packages paakkalaama?"
Customer: "packages enna?"
Hive: "3 packages irukku 😊 Starter (LKR 14,000/mo la irundhu), Growth (LKR 25,000/mo), and Premium (LKR 40,000/mo). Idhoda details paakkalaama?"
Customer: "adhu evlo?"
Hive: "Starter LKR 14,000/mo, Growth LKR 25,000/mo, Premium LKR 40,000/mo varum 😊 Ungalukku edhu suit aagum?"

[Tamil Script Example]
Customer: "நீங்கள் சமூக ஊடகங்களை நிர்வகிக்கிறீர்களா?"
Hive: "ஆம் 😊 நாங்கள் உங்கள் social media-வை manage செய்து தருகிறோம். Content, post design, scheduling எல்லாவற்றையும் நாங்களே பார்த்துக் கொள்வோம். Packages பார்க்கலாமா?"
Customer: "என்ன packages இருக்கு?"
Hive: "3 packages இருக்கு 😊 Starter (LKR 14,000/mo முதல்), Growth (LKR 25,000/mo), மற்றும் Premium (LKR 40,000/mo). விவரங்கள் தெரிஞ்சுக்கலாமா?"

[English Example]
Customer: "How much do you charge for social media marketing?"
Hive: "Our social media packages start from LKR 14,000/month for Starter, up to LKR 40,000/month for Premium 😊 Would you like to see what's included?"
Customer: "You have to run my business social media."
Hive: "Sure, we can manage that for you 😊 We handle the content creation, graphic design, and posting so you don't have to worry about it. Want to see the available packages?"
Customer: "what are they"
Hive: "Sure 😊 We have a few packages:\n\n• Starter (from LKR 14,000/mo) — 15 custom posts to keep your pages active.\n• Growth (from LKR 25,000/mo) — 20 custom posts plus 4 reels to grow your reach.\n• Premium (from LKR 40,000/mo) — 30 custom posts, 8 reels, and dedicated campaign support.\n\nWant me to share more details on any of these?"

Authoritative Live Turso HIVE Brain Services & Packages:
${servicesContext}`;

    const configuredModel = process.env.GEMINI_MODEL?.trim().replace(/^["']|["']$/g, "");
    const primaryModel = (configuredModel || "gemini-3.5-flash").replace(/^models\//, "");

    const configuredFallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim().replace(/^["']|["']$/g, "");
    const secondaryModel = (configuredFallbackModel || "gemini-flash-latest").replace(/^models\//, "");

    // Prepare Gemini contents (strictly alternating 'user' / 'model', starting with 'user', no duplicated active user turn)
    const rawTurns: Array<{ role: "user" | "model"; text: string }> = [];

    for (const entry of formattedHistory) {
      const text = entry.content?.trim();
      if (!text) continue;
      rawTurns.push({
        role: entry.role === "assistant" ? "model" : "user",
        text,
      });
    }

    const currentMsg = message.trim();
    const lastTurn = rawTurns[rawTurns.length - 1];
    // Prevent duplicate: only append currentMsg if history didn't already end with it
    if (!lastTurn || lastTurn.role !== "user" || lastTurn.text !== currentMsg) {
      if (currentMsg) {
        rawTurns.push({ role: "user", text: currentMsg });
      }
    }

    // Gemini requires multi-turn conversations to start with a "user" turn
    while (rawTurns.length > 0 && rawTurns[0].role === "model") {
      rawTurns.shift();
    }

    // Ensure at least one turn exists
    if (rawTurns.length === 0) {
      rawTurns.push({ role: "user", text: currentMsg || "Hello" });
    }

    // Gemini requires alternating roles (user -> model -> user). Merge adjacent same-role turns if any
    const geminiContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
    for (const turn of rawTurns) {
      const prev = geminiContents[geminiContents.length - 1];
      if (prev && prev.role === turn.role) {
        prev.parts[0].text += `\n${turn.text}`;
      } else {
        geminiContents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      }
    }

    // Helper to call Gemini with a specific timeout signal
    const callGeminiWithTimeout = async (targetModel: string, timeoutMs: number): Promise<GeminiCallResult> => {
      try {
        const signal = AbortSignal.timeout(timeoutMs);
        return await callGeminiEndpoint(targetModel, apiKey, systemPrompt, geminiContents, fetch, signal);
      } catch (err) {
        const fetchError = err instanceof Error ? err.message : "Aborted/Timeout";
        return { ok: false, httpStatus: 0, text: "", finishReason: "", fetchError };
      }
    };

    // --- Attempt 1: Primary Model (gemini-3.5-flash) with hard 2500ms abort ---
    let response = await callGeminiWithTimeout(primaryModel, 2500);

    // If primary failed, timed out, returned 503/429/404, or returned empty output, proceed to Attempt 2
    const shouldTrySecondary = !response.ok || response.text.trim().length === 0;

    if (shouldTrySecondary) {
      const reason =
        response.httpStatus === 0
          ? (response.fetchError ?? "timeout / aborted")
          : response.httpStatus >= 400
          ? `HTTP ${response.httpStatus}`
          : `empty output (finishReason: ${response.finishReason || "absent"})`;
      console.warn(
        `[HIVE AI] Primary model (${primaryModel}) unusable -- ${reason}. Attempting fallback model (${secondaryModel}) within 1200ms.`
      );

      // --- Attempt 2: Secondary Model (gemini-flash-latest) with hard 1200ms abort ---
      response = await callGeminiWithTimeout(secondaryModel, 1200);
    }

    // --- Parse and return Gemini response ---
    if (response.ok && response.text.trim().length > 0) {
      let rawText = response.text.trim();
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }

      let parsed: Partial<HiveResponse> = {};
      try {
        parsed = JSON.parse(rawText) as Partial<HiveResponse>;
      } catch {
        if (rawText && !rawText.startsWith("{")) {
          parsed = { reply: rawText };
        }
      }

      if (parsed.reply && typeof parsed.reply === "string" && parsed.reply.trim().length > 0) {
        return {
          reply: parsed.reply.trim(),
          needsLeadCapture: Boolean(parsed.needsLeadCapture),
          suggestedAction: parsed.suggestedAction?.trim() || undefined,
        };
      }

      // Text present but no valid reply key after parse -- fall through to deterministic engine
      console.warn(`[HIVE AI] Response text present but no valid "reply" key after JSON parse. Falling back.`);
    }

    // --- Attempt 3: Both models failed/timed out (≤ 3.8s total): deterministic local fallback ---
    return getFallbackReply(message, "web", formattedHistory);
  } catch (error) {
    console.error("[HIVE AI] Unexpected failure in model pipeline, using fallback:", error);
    return getFallbackReply(message, "web", formattedHistory);
  }
}

