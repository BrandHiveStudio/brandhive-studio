import {
  fetchActiveServices,
  getServicePricing,
  listAddons,
  searchServices,
  searchFaqs,
  getBusinessInfo,
  formatPriceDisplay,
  type Service,
  type ServicePricingDetail,
} from "@/lib/knowledge/supabase-knowledge";
import { getPublishedFaqs, fallbackFaqs } from "@/lib/db/queries/faqs";
import { getPublishedServices } from "@/lib/db/queries/services";

export interface HiveMessageOptions {
  message: string;
  history?: Array<{ role: "assistant" | "user"; content: string }>;
  channel?: "web" | "whatsapp";
  senderName?: string;
}

export interface HiveResponse {
  reply: string;
  needsLeadCapture: boolean;
  suggestedAction?: string;
}

/**
 * Standard BrandHive Studio profile used for WhatsApp and base fallback.
 * Strictly preserved for WhatsApp bot consistency.
 */
export const companyProfile = {
  name: "BrandHive Studio",
  tagline: "Premium branding and digital experiences",
  contactNumber: "+94 70 641 0093",
  whatsappUrl: "https://wa.me/94706410093",
  email: "brandhive.studio.lk@gmail.com",
  websiteUrl: "https://brandhivestudio.com.lk",
  services: [
    "Brand Strategy & Positioning",
    "Visual Identity & Logo Systems",
    "Website Design & Full-Stack Development",
    "Digital Marketing & Growth Strategy",
    "UI/UX Experience Design",
    "Packaging & Motion Graphics",
  ],
  process: ["Discovery", "Strategy", "Design", "Development", "Launch"],
};

// =============================================================================
// SECTION 1: WHATSAPP LOGIC (STRICTLY PRESERVED & BEHAVIORALLY UNCHANGED)
// =============================================================================

/**
 * WhatsApp fallback logic — completely preserved from original implementation.
 * Zero changes to WhatsApp responses, formatting, pricing behavior, or decision logic.
 */
async function getWhatsAppFallbackReply(message: string): Promise<HiveResponse> {
  const normalized = message.toLowerCase().trim();

  // 1. Projects, Discovery, Pricing, Estimates, Start Project
  if (
    normalized.includes("project planner") ||
    normalized.includes("planner") ||
    normalized.includes("start a project") ||
    normalized.includes("start project") ||
    normalized.includes("book a call") ||
    normalized.includes("discovery") ||
    normalized.includes("quote") ||
    normalized.includes("budget") ||
    normalized.includes("price") ||
    normalized.includes("pricing") ||
    normalized.includes("cost") ||
    normalized.includes("estimate")
  ) {
    return {
      reply:
        "Thanks for reaching out about starting a project with BrandHive Studio!\n\nWe would love to learn more about your vision. To map out scope, timeline, and pricing, you can share a quick summary of what you need right here, or explore our Project Planner at: https://brandhivestudio.com.lk/contact\n\nOur creative director will review your requirements and respond promptly.",
      needsLeadCapture: true,
    };
  }

  // 2. Services, Capabilities, Offerings
  if (
    normalized.includes("service") ||
    normalized.includes("offer") ||
    normalized.includes("website") ||
    normalized.includes("web design") ||
    normalized.includes("branding") ||
    normalized.includes("logo") ||
    normalized.includes("marketing") ||
    normalized.includes("ui/ux") ||
    normalized.includes("packaging")
  ) {
    let serviceList = companyProfile.services;
    try {
      const liveServices = await getPublishedServices();
      if (liveServices && liveServices.length > 0) {
        serviceList = liveServices.map((s) => s.title);
      }
    } catch {
      // Use companyProfile.services fallback
    }

    const bullets = serviceList.map((s) => `• ${s}`).join("\n");
    return {
      reply: `At BrandHive Studio, we craft premium digital experiences and brand identities. Our core services include:\n\n${bullets}\n\nWould you like more details on a specific service, or shall we discuss a tailored package for your business?`,
      needsLeadCapture: false,
    };
  }

  // 3. Process, Methodology, How We Work
  if (
    normalized.includes("process") ||
    normalized.includes("how it works") ||
    normalized.includes("how we work") ||
    normalized.includes("steps") ||
    normalized.includes("methodology")
  ) {
    return {
      reply:
        "Our collaborative process follows 5 proven phases:\n\n1. Discovery — Understanding your vision, audience, and goals\n2. Strategy — Positioning, architecture, and creative roadmap\n3. Design — High-fidelity concepts and identity systems\n4. Development — Production-ready build with modern tech\n5. Launch — Thorough testing and seamless deployment\n\nWould you like to schedule an introductory discovery session?",
      needsLeadCapture: false,
    };
  }

  // 4. Contact Details & Team
  if (
    normalized.includes("contact") ||
    normalized.includes("email") ||
    normalized.includes("phone") ||
    normalized.includes("call") ||
    normalized.includes("address") ||
    normalized.includes("location")
  ) {
    return {
      reply: `You can reach BrandHive Studio directly via WhatsApp at ${companyProfile.contactNumber}, email us at ${companyProfile.email}, or visit our website at ${companyProfile.websiteUrl}.`,
      needsLeadCapture: false,
    };
  }

  // 5. Match CMS FAQs
  try {
    const faqs = await getPublishedFaqs();
    const activeFaqs = faqs && faqs.length > 0 ? faqs : fallbackFaqs;
    const matchingFaq = activeFaqs.find(
      (f) =>
        normalized.includes(f.question.toLowerCase()) ||
        f.question.toLowerCase().includes(normalized)
    );

    if (matchingFaq) {
      return {
        reply: matchingFaq.answer,
        needsLeadCapture: false,
      };
    }
  } catch {
    // Proceed to greeting / general fallback
  }

  // 6. Greetings & Introductions
  if (
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey") ||
    normalized === "hive"
  ) {
    return {
      reply: `Hello! I'm HIVE AI, the digital assistant for BrandHive Studio.\n\nI can help you explore our services, understand our design and development process, or connect you directly with our team to start your project. How can I assist you today?`,
      needsLeadCapture: false,
    };
  }

  // Default Fallback
  return {
    reply: `I'm here to assist with BrandHive Studio. I can share details on our branding, website design, and development services, walk through our process, or connect you with our team for a project discovery call. What would you like to explore?`,
    needsLeadCapture: false,
  };
}

// =============================================================================
// SECTION 2: WEBSITE HIVE AI LOGIC (LIVE SUPABASE KNOWLEDGE INTEGRATION)
// =============================================================================

/**
 * Retrieve dynamic agency business info for the website from the live Supabase settings table,
 * falling back gracefully if unconfigured or unavailable.
 */
async function getWebsiteLiveCompanyProfile() {
  try {
    const info = await getBusinessInfo();
    if (info.status === "results" && info.entries.length > 0) {
      const getVal = (key: string, fallback: string) => {
        const entry = info.entries.find((e) => e.key === key);
        return entry && typeof entry.value === "string" ? entry.value : fallback;
      };

      return {
        name: getVal("agency_name", companyProfile.name),
        tagline: getVal("agency_tagline", companyProfile.tagline),
        contactNumber: getVal("agency_phone", companyProfile.contactNumber),
        whatsappUrl: getVal("agency_whatsapp", companyProfile.whatsappUrl),
        email: getVal("agency_email", companyProfile.email),
        websiteUrl: getVal("agency_website", companyProfile.websiteUrl),
        process: companyProfile.process,
      };
    }
  } catch {
    // Fall back gracefully
  }

  return companyProfile;
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
    recent.includes("tiktok") ||
    recent.includes("ටික්ටොක්") ||
    recent.includes("டிக் டாக்")
  ) {
    return "tiktok";
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
 * drawing authoritatively from the live Supabase catalog.
 */
function getRelevantServicesContext(
  services: Service[],
  contextQuery: string
): string {
  const normalizedQuery = contextQuery.toLowerCase();

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

    if (
      s.item_type === "package" &&
      (normalizedQuery.includes("package") ||
        normalizedQuery.includes("plan") ||
        normalizedQuery.includes("how much") ||
        normalizedQuery.includes("price") ||
        normalizedQuery.includes("cost") ||
        normalizedQuery.includes("manage") ||
        normalizedQuery.includes("run") ||
        normalizedQuery.includes("monawada") ||
        normalizedQuery.includes("keeyada") ||
        normalizedQuery.includes("evlo"))
    ) {
      score += 2;
    }

    return { service: s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topScored = scored
    .filter((item) => item.score > 0)
    .slice(0, 15)
    .map((item) => item.service);

  let selectedServices: Service[] = [];
  if (topScored.length >= 4) {
    selectedServices = topScored;
  } else {
    // Flagship packages across core categories
    const coreSlugs = new Set([
      "brd-pkg-01", "brd-pkg-02", "brd-pkg-03", // Branding packages
      "web-pkg-01", "web-pkg-02", "web-pkg-03", // Website packages
      "smm-pkg-01a", "smm-pkg-01b", "smm-pkg-02a", "smm-pkg-03a", // Social Media packages
    ]);
    const corePackages = services.filter((s) => coreSlugs.has(s.slug));

    const combined = [...topScored];
    for (const cp of corePackages) {
      if (!combined.some((s) => s.id === cp.id)) {
        combined.push(cp);
      }
    }
    selectedServices = combined.slice(0, 18);
  }

  return selectedServices
    .map((s) => {
      const priceDisplay = formatPriceDisplay(s);
      const metadata = (s.metadata ?? {}) as Record<string, unknown>;
      const inclusions =
        Array.isArray(metadata.inclusions) && metadata.inclusions.length > 0
          ? ` | Includes: ${(metadata.inclusions as string[]).slice(0, 3).join(", ")}`
          : "";
      return `- ${s.name} [${s.category || "General"}] (${s.item_type}): ${priceDisplay}${inclusions}`;
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
    if (recentTopic === "social-media") {
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

    if (recentTopic === "website") {
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

    if (recentTopic === "branding") {
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
      (recentTopic === "social-media" && !normalized.includes("website") && !normalized.includes("brand"))
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
    if (recentTopic === "social-media") {
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
    if (recentTopic === "website") {
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
    if (recentTopic === "branding") {
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
    return {
      reply: "Sure! Which service or project would you like pricing for?",
      needsLeadCapture: false,
      suggestedAction: "Tell us what you need",
    };
  }

  // 5. Specific Pricing / Cost / Quote Lookups from live Supabase
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
    normalized.includes("keeyada") ||
    normalized.includes("ganan") ||
    normalized.includes("evlo") ||
    normalized.includes("vilai") ||
    normalized.includes("කීයද") ||
    normalized.includes("ගණන්") ||
    normalized.includes("මිල") ||
    normalized.includes("எவ்வளவு") ||
    normalized.includes("விலை");

  if (isPricingIntent) {
    let serviceSearchTerm = cleanPricingQuery(normalized);
    if (serviceSearchTerm.length < 2 && recentTopic) {
      serviceSearchTerm = recentTopic.replace("-", " ");
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

    if (serviceSearchTerm.length >= 2) {
      try {
        const pricingResult = await getServicePricing(serviceSearchTerm);

        if (pricingResult.status === "match") {
          const s: ServicePricingDetail = pricingResult.service;
          const inclusionsText =
            s.inclusions && s.inclusions.length > 0
              ? ` It includes: ${s.inclusions.slice(0, 3).join(", ")}.`
              : "";

          if (langStyle === "singlish") {
            return {
              reply: `Sure 😊 Ape ${s.name} eka ${s.display_price} wenawa.${inclusionsText} Mewaye thawa details kiyannada?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "sinhala") {
            return {
              reply: `Sure 😊 අපේ ${s.name} එක ${s.display_price} වෙනවා.${inclusionsText} වැඩි විස්තර දැනගන්න කැමතිද?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "tanglish") {
            return {
              reply: `Sure 😊 Namma ${s.name} ${s.display_price} varum.${inclusionsText} Idhoda details sollatumaa?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          if (langStyle === "tamil") {
            return {
              reply: `Sure 😊 எங்கள் ${s.name} ${s.display_price} வரும்.${inclusionsText} விவரங்கள் சொல்லவா?`,
              needsLeadCapture: false,
              suggestedAction: "Ask about package inclusions",
            };
          }
          return {
            reply: `Sure 😊 Our ${s.name} is ${s.display_price}.${inclusionsText} Want me to share more details on what's included?`,
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

        // Try fuzzy search if getServicePricing didn't resolve
        const searchRes = await searchServices(serviceSearchTerm, 3);
        if (searchRes.status === "results" && searchRes.matches.length > 0) {
          const optionsText = searchRes.matches.map((m) => m.name).join(", ");
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

  // 7. Add-ons Inquiry from live Supabase
  if (
    normalized.includes("add-on") ||
    normalized.includes("addon") ||
    normalized.includes("addons") ||
    normalized.includes("extra") ||
    normalized.includes("extension")
  ) {
    try {
      const addonResult = await listAddons();
      if (addonResult.status === "results" && addonResult.addons.length > 0) {
        const topAddons = addonResult.addons.slice(0, 4);
        const listText = topAddons
          .map((a) => `${a.name} (${a.display_price})`)
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

  // 7. Authoritative FAQs from live Supabase (Protected against generic words and low confidence)
  try {
    const faqResult = await searchFaqs(message, 1);
    if (faqResult.status === "results" && faqResult.matches.length > 0) {
      const match = faqResult.matches[0];
      return {
        reply: match.answer,
        needsLeadCapture: false,
        suggestedAction: "Ask another question",
      };
    }
  } catch {
    // Fall back to CMS FAQs if Supabase query encounters issues
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
      const searchRes = await searchServices(message, 3);
      if (searchRes.status === "results" && searchRes.matches.length > 0) {
        return {
          reply: `We offer ${searchRes.matches.map((s) => s.name).join(", ")} 😊 Would you like to see package prices or what's included?`,
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
// SECTION 3: ENTRY POINTS
// =============================================================================

/**
 * Route message to either WhatsApp fallback or Website live Supabase fallback.
 */
export async function getFallbackReply(
  message: string,
  channel: "web" | "whatsapp" = "web",
  history: Array<{ role: "assistant" | "user"; content: string }> = []
): Promise<HiveResponse> {
  if (channel === "whatsapp") {
    return getWhatsAppFallbackReply(message);
  }
  return getWebsiteFallbackReply(message, history);
}

/**
 * Main HIVE AI processor.
 * - When channel is "whatsapp": Executes original, unchanged WhatsApp AI behavior.
 * - When channel is "web": Executes Website HIVE AI grounded in live Supabase knowledge.
 */
export async function processHiveMessage(options: HiveMessageOptions): Promise<HiveResponse> {
  const { message, history = [], channel = "web" } = options;
  const apiKey = process.env.GEMINI_API_KEY;

  const formattedHistory: Array<{ role: "assistant" | "user"; content: string }> = history.map((entry) => ({
    role: entry.role === "assistant" ? "assistant" : "user",
    content: entry.content,
  }));

  if (!apiKey) {
    return getFallbackReply(message, channel, formattedHistory);
  }

  try {
    const isWhatsApp = channel === "whatsapp";

    let systemPrompt: string;

    if (isWhatsApp) {
      // STRICTLY PRESERVED: Original WhatsApp prompt without Supabase alterations
      systemPrompt = `You are HIVE AI, the official AI concierge for BrandHive Studio on WhatsApp (+94 70 641 0093). BrandHive Studio is a premium branding, UI/UX, and web development agency. Keep answers concise, helpful, and formatted naturally for WhatsApp reading. Use clean line breaks. Return valid JSON with keys: reply, needsLeadCapture.`;
    } else {
      // WEBSITE HIVE AI: Live Supabase services & LKR pricing context with multilingual intelligence
      const [profile, activeServices] = await Promise.all([
        getWebsiteLiveCompanyProfile(),
        fetchActiveServices().catch(() => [] as Service[]),
      ]);
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

      systemPrompt = `You are Hive, a friendly, warm, and helpful sales & support specialist chatting with a visitor on BrandHive Studio's website (${profile.websiteUrl}).

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

Authoritative Live Supabase Services & Packages:
${servicesContext}`;
    }

    const configuredModel = process.env.GEMINI_MODEL?.trim().replace(/^["']|["']$/g, "");
    const primaryModel = (configuredModel || "gemini-3.8-flash").replace(/^models\//, "");
    const secondaryModel = primaryModel === "gemini-2.5-flash" ? "gemini-flash-latest" : "gemini-2.5-flash";

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

    const callGeminiApi = async (targetModel: string): Promise<{ ok: boolean; status: number; text: string; error?: string }> => {
      const cleanModel = targetModel.trim().replace(/^["']|["']$/g, "").replace(/^models\//, "");
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent`;
      const thinkingConfig = cleanModel.includes("gemini-3")
        ? { thinkingLevel: "LOW" }
        : { thinkingBudget: 0 };

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: geminiContents,
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
              thinkingConfig,
            },
          }),
        });

        if (!res.ok) {
          return { ok: false, status: res.status, text: "" };
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return { ok: true, status: res.status, text };
      } catch (err) {
        return { ok: false, status: 0, text: "", error: err instanceof Error ? err.message : "Network error" };
      }
    };

    // Primary attempt using exact configured model
    let response = await callGeminiApi(primaryModel);

    // If primary failed with transient server/network errors (500, 502, 503, 504, or network drops), immediately attempt ONE secondary stable model
    const isTransient = [500, 502, 503, 504].includes(response.status) || (response.status === 0 && Boolean(response.error));
    if (!response.ok && isTransient) {
      console.warn(`[HIVE AI] Primary model (${primaryModel}) transient failure (${response.status || response.error}). Immediately attempting secondary model (${secondaryModel}).`);
      response = await callGeminiApi(secondaryModel);
    }

    if (response.ok && response.text) {
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
    }

    // Only if both attempts fail to produce a usable response, use the deterministic fallback
    return getFallbackReply(message, channel, formattedHistory);
  } catch (error) {
    console.error("[HIVE AI] Unexpected failure in model pipeline, using fallback:", error);
    return getFallbackReply(message, channel, formattedHistory);
  }
}
