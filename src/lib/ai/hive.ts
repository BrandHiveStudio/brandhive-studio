import {
  fetchActiveServices,
  getServicePricing,
  listAddons,
  searchServices,
  searchFaqs,
  getBusinessInfo,
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
 * Website HIVE AI deterministic fallback knowledge engine powered by the live Supabase Knowledge Base.
 * Retrieves real-time services, pricing, add-ons, FAQs, and business settings.
 */
async function getWebsiteFallbackReply(message: string): Promise<HiveResponse> {
  const normalized = message.toLowerCase().trim();
  const profile = await getWebsiteLiveCompanyProfile();

  // 1. Specific Pricing / Cost / Quote Lookups from live Supabase
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
    normalized.includes("fee");

  if (isPricingIntent) {
    const serviceSearchTerm = normalized
      .replace(
        /\b(how much is|how much for|what is the price of|what is the cost of|pricing for|price of|price|cost|quote|budget|estimate|starting from|fee|rates?|for|a|an|the|please|brandhive)\b/g,
        " "
      )
      .replace(/[?.,!]/g, "")
      .trim();

    if (serviceSearchTerm.length >= 2) {
      try {
        const pricingResult = await getServicePricing(serviceSearchTerm);

        if (pricingResult.status === "match") {
          const s: ServicePricingDetail = pricingResult.service;
          const inclusionsText =
            s.inclusions && s.inclusions.length > 0
              ? ` Includes: ${s.inclusions.slice(0, 3).join(", ")}.`
              : "";

          return {
            reply: `Our ${s.name} is ${s.display_price}.${inclusionsText}${
              s.description ? ` ${s.description}` : ""
            }`,
            needsLeadCapture: true,
            suggestedAction: "Start a project planner inquiry",
          };
        }

        if (pricingResult.status === "ambiguous") {
          const candidateNames = pricingResult.candidates.map((c) => c.name).join(", ");
          return {
            reply: `We have several options available: ${candidateNames}. Which one would you like details on?`,
            needsLeadCapture: false,
            suggestedAction: "Ask about a specific package",
          };
        }
      } catch {
        // Fall back to general project planner response
      }
    }

    return {
      reply:
        "We offer clear, transparent pricing across our branding, web design, and digital marketing services. Tell me what you're looking to build and I'll share exact pricing or guide you through our Project Planner.",
      needsLeadCapture: true,
      suggestedAction: "Start a project planner inquiry",
    };
  }

  // 2. Add-ons Inquiry from live Supabase
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
        const topAddons = addonResult.addons.slice(0, 5);
        const listText = topAddons
          .map((a) => `${a.name} (${a.display_price})`)
          .join(", ");
        return {
          reply: `We provide flexible add-on features including: ${listText}. Let us know if you'd like to include any of these in your project scope.`,
          needsLeadCapture: false,
          suggestedAction: "Ask about package customizations",
        };
      }
    } catch {
      // Fall through
    }
  }

  // 3. Authoritative FAQs from live Supabase
  try {
    const faqResult = await searchFaqs(message, 1);
    if (faqResult.status === "results" && faqResult.matches.length > 0) {
      const match = faqResult.matches[0];
      return {
        reply: match.answer,
        needsLeadCapture: false,
        suggestedAction: "Explore our services",
      };
    }
  } catch {
    // Fall back to CMS FAQs if Supabase query encounters issues
  }

  // CMS FAQs fallback
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
    // Continue
  }

  // 4. Services, Capabilities & Offerings from live Supabase
  if (
    normalized.includes("service") ||
    normalized.includes("offer") ||
    normalized.includes("website") ||
    normalized.includes("web design") ||
    normalized.includes("branding") ||
    normalized.includes("logo") ||
    normalized.includes("marketing") ||
    normalized.includes("ui/ux") ||
    normalized.includes("packaging") ||
    normalized.includes("seo") ||
    normalized.includes("e-commerce") ||
    normalized.includes("ecommerce")
  ) {
    try {
      const searchRes = await searchServices(message, 4);
      if (searchRes.status === "results" && searchRes.matches.length > 0) {
        return {
          reply: `We offer ${searchRes.matches.map((s) => s.name).join(", ")}. Would you like pricing details or an overview of what's included?`,
          needsLeadCapture: false,
          suggestedAction: "Ask for pricing or scope",
        };
      }

      const liveServices = await fetchActiveServices();
      if (liveServices.length > 0) {
        const serviceNames = Array.from(
          new Set(liveServices.map((s) => s.category || s.name))
        ).slice(0, 6);

        return {
          reply: `We specialize in ${serviceNames.join(", ")}. If you share your goals, I can recommend the right scope and provide starting pricing.`,
          needsLeadCapture: false,
          suggestedAction: "Ask for a service recommendation",
        };
      }
    } catch {
      // Fall back
    }

    return {
      reply:
        "We specialize in Brand Strategy, Visual Identity, Web Design & Development, and Growth Marketing. Tell me about your project and I'll recommend the ideal package.",
      needsLeadCapture: false,
      suggestedAction: "Ask for a service recommendation",
    };
  }

  // 5. Agency Process & Methodology
  if (
    normalized.includes("process") ||
    normalized.includes("how it works") ||
    normalized.includes("how we work") ||
    normalized.includes("steps") ||
    normalized.includes("methodology") ||
    normalized.includes("timeline")
  ) {
    return {
      reply: `Our process is simple and premium: ${profile.process.join(" → ")}. We move from discovery to strategy, design, development, and launch with clarity at every step.`,
      needsLeadCapture: false,
      suggestedAction: "Learn more about the process",
    };
  }

  // 6. Contact Details & Business Settings from live Supabase
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
      reply: `You can reach BrandHive Studio directly via WhatsApp at ${profile.contactNumber}, email us at ${profile.email}, or visit our website at ${profile.websiteUrl}.`,
      needsLeadCapture: false,
      suggestedAction: "Contact the team",
    };
  }

  // 7. Greetings & Introductions
  if (
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey") ||
    normalized === "hive"
  ) {
    return {
      reply: `Hello, I’m Hive from ${profile.name}. I can answer questions about our services, share exact package pricing, explain our process, or guide you through the Project Planner.`,
      needsLeadCapture: false,
      suggestedAction: "Explore services & pricing",
    };
  }

  // 8. Default Fallback
  return {
    reply: `I’m here to help with ${profile.name}. I can provide live package pricing, recommend services for your brand, and help you take the next step toward your project.`,
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
  channel: "web" | "whatsapp" = "web"
): Promise<HiveResponse> {
  if (channel === "whatsapp") {
    return getWhatsAppFallbackReply(message);
  }
  return getWebsiteFallbackReply(message);
}

/**
 * Main HIVE AI processor.
 * - When channel is "whatsapp": Executes original, unchanged WhatsApp AI behavior.
 * - When channel is "web": Executes Website HIVE AI grounded in live Supabase knowledge.
 */
export async function processHiveMessage(options: HiveMessageOptions): Promise<HiveResponse> {
  const { message, history = [], channel = "web" } = options;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getFallbackReply(message, channel);
  }

  const formattedHistory = history.map((entry) => ({
    role: entry.role === "assistant" ? "assistant" : "user",
    content: entry.content,
  }));

  try {
    const isWhatsApp = channel === "whatsapp";

    let systemPrompt: string;

    if (isWhatsApp) {
      // STRICTLY PRESERVED: Original WhatsApp prompt without Supabase alterations
      systemPrompt = `You are HIVE AI, the official AI concierge for BrandHive Studio on WhatsApp (+94 70 641 0093). BrandHive Studio is a premium branding, UI/UX, and web development agency. Keep answers concise, helpful, and formatted naturally for WhatsApp reading. Use clean line breaks. Return valid JSON with keys: reply, needsLeadCapture.`;
    } else {
      // WEBSITE HIVE AI: Live Supabase services & LKR pricing context
      const profile = await getWebsiteLiveCompanyProfile();

      let servicesContext = "";
      try {
        const activeServices = await fetchActiveServices();
        if (activeServices.length > 0) {
          servicesContext = activeServices
            .slice(0, 30)
            .map(
              (s) =>
                `- ${s.name} (${s.category || "General"}): ${
                  s.pricing_type === "fixed" && s.price
                    ? `${s.currency} ${s.price.toLocaleString()}`
                    : s.pricing_type === "starting_from" && s.starting_price
                    ? `Starting from ${s.currency} ${s.starting_price.toLocaleString()}`
                    : "Custom quotation"
                }`
            )
            .join("\n");
        }
      } catch {
        // Continue without injected catalog context if fetch fails
      }

      systemPrompt = `You are Hive, the premium AI concierge for BrandHive Studio (${profile.websiteUrl}). You help visitors understand the agency, quote accurate package pricing, explain our design & development process, and collect leads professionally. Keep responses polished, warm, concise, and trustworthy. Never invent prices not present in the authoritative catalog below. Always quote prices in LKR. Return valid JSON with keys: reply, needsLeadCapture, suggestedAction.

Authoritative Supabase Services & Live LKR Pricing:
${servicesContext}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...formattedHistory,
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Partial<HiveResponse>;

    const fallback = await getFallbackReply(message, channel);

    return {
      reply: parsed.reply || fallback.reply,
      needsLeadCapture: parsed.needsLeadCapture ?? fallback.needsLeadCapture,
      suggestedAction: parsed.suggestedAction || fallback.suggestedAction,
    };
  } catch (error) {
    console.error("[HIVE AI] Model call failed or timed out, using fallback:", error);
    return getFallbackReply(message, channel);
  }
}
