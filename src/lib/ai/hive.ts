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

/**
 * Deterministic fallback knowledge engine used when an external LLM API key is
 * absent or unconfigured. Ensures HIVE AI reliably responds 24/7 with accurate
 * BrandHive Studio agency data.
 */
export async function getFallbackReply(
  message: string,
  channel: "web" | "whatsapp" = "web"
): Promise<HiveResponse> {
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
    if (channel === "whatsapp") {
      return {
        reply:
          "Thanks for reaching out about starting a project with BrandHive Studio!\n\nWe would love to learn more about your vision. To map out scope, timeline, and pricing, you can share a quick summary of what you need right here, or explore our Project Planner at: https://brandhivestudio.com.lk/contact\n\nOur creative director will review your requirements and respond promptly.",
        needsLeadCapture: true,
      };
    }

    return {
      reply:
        "That sounds like the right next step. I can connect you with the team for a discovery call and help map out the scope, timeline, and budget for your project.",
      needsLeadCapture: true,
      suggestedAction: "Share your name and email so we can reach out with the next step.",
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

    if (channel === "whatsapp") {
      const bullets = serviceList.map((s) => `• ${s}`).join("\n");
      return {
        reply: `At BrandHive Studio, we craft premium digital experiences and brand identities. Our core services include:\n\n${bullets}\n\nWould you like more details on a specific service, or shall we discuss a tailored package for your business?`,
        needsLeadCapture: false,
      };
    }

    return {
      reply: `We specialize in ${serviceList.join(", ")}. If you want the strongest fit, I can recommend a path based on whether you need a brand refresh, a launch-ready website, or a full digital experience.`,
      needsLeadCapture: false,
      suggestedAction: "Ask for a service recommendation",
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
    if (channel === "whatsapp") {
      return {
        reply:
          "Our collaborative process follows 5 proven phases:\n\n1. Discovery — Understanding your vision, audience, and goals\n2. Strategy — Positioning, architecture, and creative roadmap\n3. Design — High-fidelity concepts and identity systems\n4. Development — Production-ready build with modern tech\n5. Launch — Thorough testing and seamless deployment\n\nWould you like to schedule an introductory discovery session?",
        needsLeadCapture: false,
      };
    }

    return {
      reply: `Our process is simple and premium: ${companyProfile.process.join(" → ")}. We move from discovery to strategy, design, development, and launch with clarity at every step.`,
      needsLeadCapture: false,
      suggestedAction: "Learn more about the process",
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
      suggestedAction: "Contact the team",
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
    if (channel === "whatsapp") {
      return {
        reply: `Hello! I'm HIVE AI, the digital assistant for BrandHive Studio.\n\nI can help you explore our services, understand our design and development process, or connect you directly with our team to start your project. How can I assist you today?`,
        needsLeadCapture: false,
      };
    }

    return {
      reply: `Hello, I’m Hive from ${companyProfile.name}. I can answer questions about our services, explain our process, or guide you to the Project Planner.`,
      needsLeadCapture: false,
      suggestedAction: "Start a conversation",
    };
  }

  // Default Fallback
  if (channel === "whatsapp") {
    return {
      reply: `I'm here to assist with BrandHive Studio. I can share details on our branding, website design, and development services, walk through our process, or connect you with our team for a project discovery call. What would you like to explore?`,
      needsLeadCapture: false,
    };
  }

  return {
    reply: `I’m here to help with ${companyProfile.name}. I can recommend the right service, explain our branding process, and help you take the next step toward your project.`,
    needsLeadCapture: false,
    suggestedAction: "Ask about services or the project planner",
  };
}

/**
 * Main HIVE AI processor. Handles OpenAI LLM calls when OPENAI_API_KEY is available,
 * falling back seamlessly to deterministic CMS-powered knowledge matching.
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
    const systemPrompt = isWhatsApp
      ? `You are HIVE AI, the official AI concierge for BrandHive Studio on WhatsApp (+94 70 641 0093). BrandHive Studio is a premium branding, UI/UX, and web development agency. Keep answers concise, helpful, and formatted naturally for WhatsApp reading. Use clean line breaks. Return valid JSON with keys: reply, needsLeadCapture.`
      : `You are Hive, the premium AI concierge for BrandHive Studio. You help visitors understand the agency, recommend services, explain the branding process, guide them to the Project Planner, and collect leads professionally. Keep responses short, polished, and warm. Return valid JSON with keys: reply, needsLeadCapture, suggestedAction.`;

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
