export interface BrainService {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  itemType: "service" | "package";
  pricingType: "fixed" | "starting_from" | "custom_quote";
  price: number | null;
  startingPrice: number | null;
  currency: string;
  unit: string | null;
  adBudgetSeparate: boolean;
  sku: string | null;
  inclusions: string | null; // serialized JSON array
  exclusions: string | null; // serialized JSON array
  metadata: string | null; // serialized JSON
  isActive: boolean;
  displayOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BrainAddon {
  id: string;
  serviceId: string | null;
  name: string;
  description: string | null;
  pricingType: string;
  price: number | null;
  startingPrice: number | null;
  currency: string;
  unit: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BrainFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BrainSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const SERVICE_CATEGORIES = [
  { value: "social-media", label: "Social Media Marketing" },
  { value: "web-development", label: "Web Design & Development" },
  { value: "branding", label: "Branding & Creative Design" },
  { value: "seo-growth", label: "SEO & Growth Marketing" },
  { value: "video-production", label: "Video & Content Creation" },
  { value: "general", label: "General Services" },
] as const;

export const FAQ_CATEGORIES = [
  "general",
  "services",
  "pricing",
  "process",
  "support",
  "technology",
] as const;
