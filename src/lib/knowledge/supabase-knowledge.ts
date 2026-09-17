/**
 * Authoritative Supabase Knowledge Base Client
 *
 * Connects directly to the live Supabase Knowledge Base.
 *
 * Requirements:
 * - Requires NEXT_PUBLIC_SUPABASE_URL from environment configuration (no hardcoded fallback).
 * - Requires SUPABASE_SERVICE_ROLE_KEY from server environment (no fallback to anon key).
 * - Live runtime queries directly against Supabase (no 5-minute memory cache).
 *
 * Provides typed access to:
 * - Active services & live LKR pricing
 * - Service add-ons and options
 * - Agency FAQs
 * - Business settings and metadata
 */

export type PricingType = "fixed" | "starting_from" | "custom_quote";
export type ServiceItemType = "service" | "package";

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  pricing_type: PricingType;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  item_type: ServiceItemType;
  ad_budget_separate: boolean;
  active: boolean;
  display_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceAddon {
  id: string;
  service_id: string | null;
  name: string;
  description: string | null;
  pricing_type: PricingType;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceSummary {
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  item_type: ServiceItemType;
}

export interface ServicePricingDetail {
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  item_type: ServiceItemType;
  pricing_type: PricingType;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  ad_budget_separate: boolean;
  inclusions: string[] | null;
  exclusions: string[] | null;
  display_price: string;
}

export type ServicePricingResult =
  | { status: "match"; authoritative: true; match_confidence: "exact" | "fuzzy"; service: ServicePricingDetail }
  | { status: "no_match"; authoritative: true; query: string }
  | { status: "ambiguous"; authoritative: true; query: string; candidates: ServiceSummary[] }
  | { status: "error"; authoritative: false; message: string };

export interface AddonDetail {
  name: string;
  description: string | null;
  pricing_type: PricingType;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  display_price: string;
}

export type AddonListResult =
  | { status: "results"; scope: "global" | "service"; service: ServiceSummary | null; addons: AddonDetail[] }
  | { status: "no_match"; query: string }
  | { status: "ambiguous"; query: string; candidates: ServiceSummary[] }
  | { status: "error"; message: string };

export interface FaqSummary {
  question: string;
  answer: string;
  category: string | null;
}

export interface FaqSearchResult {
  status: "results" | "no_match" | "error";
  query: string;
  matches: FaqSummary[];
  message?: string;
}

export interface BusinessInfoEntry {
  key: string;
  value: unknown;
  description: string | null;
}

export type BusinessInfoResult =
  | { status: "results"; entries: BusinessInfoEntry[] }
  | { status: "no_match"; key: string }
  | { status: "error"; message: string };

// -----------------------------------------------------------------------------
// Formatters
// -----------------------------------------------------------------------------

function formatAmount(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function formatPriceDisplay(row: {
  pricing_type: PricingType;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  ad_budget_separate?: boolean;
}): string {
  const unitSuffix = row.unit ? ` / ${row.unit}` : "";
  const adBudgetSuffix = row.ad_budget_separate ? " + Ad Budget" : "";

  switch (row.pricing_type) {
    case "fixed":
      if (row.price == null) {
        return "Pricing not available — please confirm with the BrandHive team.";
      }
      return `${formatAmount(row.price, row.currency)}${unitSuffix}${adBudgetSuffix}`;

    case "starting_from":
      if (row.starting_price == null) {
        return "Pricing not available — please confirm with the BrandHive team.";
      }
      return `Starting from ${formatAmount(row.starting_price, row.currency)}${unitSuffix}${adBudgetSuffix}`;

    case "custom_quote":
      return "Custom quotation required";

    default:
      return "Pricing not available — please confirm with the BrandHive team.";
  }
}

function toSummary(row: Service): ServiceSummary {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    item_type: row.item_type,
  };
}

function extractStringArray(value: unknown): string[] | null {
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return value as string[];
  }
  return null;
}

function toPricingDetail(row: Service): ServicePricingDetail {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    item_type: row.item_type,
    pricing_type: row.pricing_type,
    price: row.price,
    starting_price: row.starting_price,
    currency: row.currency,
    unit: row.unit,
    ad_budget_separate: row.ad_budget_separate,
    inclusions: extractStringArray(metadata.inclusions),
    exclusions: extractStringArray(metadata.exclusions),
    display_price: formatPriceDisplay(row),
  };
}

// -----------------------------------------------------------------------------
// Supabase Configuration & Fetcher (Runtime Only - No Caching)
// -----------------------------------------------------------------------------

function getSupabaseConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment configuration");
  }

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in server environment configuration");
  }

  return { url: url.replace(/\/+$/, ""), key };
}

async function fetchFromSupabase<T>(path: string): Promise<T[]> {
  const config = getSupabaseConfig();
  const endpoint = `${config.url}/rest/v1/${path}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed [${response.status}]: ${response.statusText}`);
  }

  return (await response.json()) as T[];
}

// -----------------------------------------------------------------------------
// Core Runtime Fetchers (Live Real-Time Data)
// -----------------------------------------------------------------------------

export async function fetchActiveServices(): Promise<Service[]> {
  return fetchFromSupabase<Service>("services?active=eq.true&order=display_order.asc");
}

export async function fetchActiveAddons(): Promise<ServiceAddon[]> {
  return fetchFromSupabase<ServiceAddon>("service_addons?active=eq.true");
}

export async function fetchActiveFaqs(): Promise<Faq[]> {
  return fetchFromSupabase<Faq>("faqs?active=eq.true&order=display_order.asc");
}

export async function fetchActiveSettings(): Promise<Setting[]> {
  return fetchFromSupabase<Setting>("settings?active=eq.true&order=key.asc");
}

// -----------------------------------------------------------------------------
// Scoring & Match Helpers
// -----------------------------------------------------------------------------

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FAQ_STOP_WORDS = new Set([
  "what", "is", "are", "your", "you", "the", "a", "an", "do", "i",
  "can", "how", "to", "in", "for", "of", "we", "our"
]);

function scoreFaqMatch(query: string, faq: Faq): number {
  const allTerms = normalizeForSearch(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const contentTerms = allTerms.filter((t) => !FAQ_STOP_WORDS.has(t));
  const terms = contentTerms.length > 0 ? contentTerms : allTerms;

  if (terms.length === 0) return 0;

  const qText = normalizeForSearch(faq.question);
  const cText = normalizeForSearch(faq.category || "");
  const aText = normalizeForSearch(faq.answer);

  return terms.reduce((score, term) => {
    let pts = 0;
    const isPay = term.startsWith("pay") && qText.includes("pay");

    // Intent-bearing Question match (3 points)
    if (qText.includes(term) || isPay) pts += 3;

    // Category match (2 points)
    if (cText.includes(term) || (term.startsWith("pay") && cText.includes("pay"))) pts += 2;

    // Incidental answer text match (1 point)
    if (pts === 0 && aText.includes(term)) pts += 1;

    return score + pts;
  }, 0);
}

const ITEM_TYPE_KEYWORDS: Record<string, ServiceItemType> = {
  package: "package",
  packages: "package",
  bundle: "package",
  bundles: "package",
  service: "service",
  services: "service",
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWholeWord(haystack: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`).test(haystack);
}

function scoreMatch(
  query: string,
  haystacks: (string | null)[],
  itemType?: ServiceItemType
): number {
  const terms = query
    .split(/\s+/)
    .map((t) => normalizeForSearch(t.trim()))
    .filter((t) => t.length >= 2);

  if (terms.length === 0) return 0;

  const text = normalizeForSearch(haystacks.filter(Boolean).join(" "));

  return terms.reduce((score, term) => {
    let next = score;
    if (containsWholeWord(text, term)) next += 1;
    if (itemType && ITEM_TYPE_KEYWORDS[term] === itemType) next += 1;
    return next;
  }, 0);
}

type ResolvedService =
  | { kind: "exact" | "fuzzy"; row: Service }
  | { kind: "ambiguous"; candidates: Service[] }
  | { kind: "none" };

function resolveService(query: string, services: Service[]): ResolvedService {
  const normalized = query.trim().toLowerCase();

  const exact = services.filter(
    (s) => s.slug.toLowerCase() === normalized || s.name.toLowerCase() === normalized
  );
  if (exact.length === 1) return { kind: "exact", row: exact[0] };
  if (exact.length > 1) return { kind: "ambiguous", candidates: exact };

  const scored = services
    .map((row) => ({
      row,
      score: scoreMatch(query, [row.name, row.description, row.category]),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { kind: "none" };
  if (scored.length === 1 || scored[0].score > scored[1].score) {
    return { kind: "fuzzy", row: scored[0].row };
  }
  return { kind: "ambiguous", candidates: scored.slice(0, 5).map((s) => s.row) };
}

// -----------------------------------------------------------------------------
// Knowledge API Functions
// -----------------------------------------------------------------------------

/**
 * Search services by query string at runtime
 */
export async function searchServices(
  query: string,
  limit = 5
): Promise<{ status: "results" | "no_match" | "error"; query: string; matches: ServiceSummary[]; message?: string }> {
  try {
    const services = await fetchActiveServices();
    const scored = services
      .map((row) => ({
        row,
        score: scoreMatch(query, [row.name, row.description, row.category], row.item_type),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, limit));

    if (scored.length === 0) {
      return { status: "no_match", query, matches: [] };
    }
    return { status: "results", query, matches: scored.map((s) => toSummary(s.row)) };
  } catch (err) {
    return {
      status: "error",
      query,
      matches: [],
      message: err instanceof Error ? err.message : "Knowledge lookup failed",
    };
  }
}

/**
 * Look up exact or fuzzy pricing for a specific service name or query at runtime
 */
export async function getServicePricing(service: string): Promise<ServicePricingResult> {
  try {
    const services = await fetchActiveServices();
    const resolved = resolveService(service, services);

    switch (resolved.kind) {
      case "none":
        return { status: "no_match", authoritative: true, query: service };
      case "ambiguous":
        return {
          status: "ambiguous",
          authoritative: true,
          query: service,
          candidates: resolved.candidates.map(toSummary),
        };
      case "exact":
      case "fuzzy":
        return {
          status: "match",
          authoritative: true,
          match_confidence: resolved.kind,
          service: toPricingDetail(resolved.row),
        };
    }
  } catch (err) {
    return {
      status: "error",
      authoritative: false,
      message: err instanceof Error ? err.message : "Knowledge lookup failed",
    };
  }
}

/**
 * List add-ons either globally or tied to a resolved service at runtime
 */
export async function listAddons(service?: string): Promise<AddonListResult> {
  try {
    const allAddons = await fetchActiveAddons();

    if (!service || !service.trim()) {
      const globalAddons = allAddons.filter((a) => a.service_id == null);
      return {
        status: "results",
        scope: "global",
        service: null,
        addons: globalAddons.map((a) => ({
          name: a.name,
          description: a.description,
          pricing_type: a.pricing_type,
          price: a.price,
          starting_price: a.starting_price,
          currency: a.currency,
          unit: a.unit,
          display_price: formatPriceDisplay(a),
        })),
      };
    }

    const services = await fetchActiveServices();
    const resolved = resolveService(service, services);

    if (resolved.kind === "none") {
      return { status: "no_match", query: service };
    }
    if (resolved.kind === "ambiguous") {
      return { status: "ambiguous", query: service, candidates: resolved.candidates.map(toSummary) };
    }

    const serviceAddons = allAddons.filter((a) => a.service_id === resolved.row.id);
    return {
      status: "results",
      scope: "service",
      service: toSummary(resolved.row),
      addons: serviceAddons.map((a) => ({
        name: a.name,
        description: a.description,
        pricing_type: a.pricing_type,
        price: a.price,
        starting_price: a.starting_price,
        currency: a.currency,
        unit: a.unit,
        display_price: formatPriceDisplay(a),
      })),
    };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Knowledge lookup failed" };
  }
}

/**
 * Search authoritative FAQs at runtime
 */
export async function searchFaqs(query: string, limit = 5): Promise<FaqSearchResult> {
  try {
    const faqs = await fetchActiveFaqs();

    const scored = faqs
      .map((row) => ({
        row,
        score: scoreFaqMatch(query, row),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, limit));

    if (scored.length === 0) {
      return { status: "no_match", query, matches: [] };
    }
    return {
      status: "results",
      query,
      matches: scored.map((s) => ({
        question: s.row.question,
        answer: s.row.answer,
        category: s.row.category,
      })),
    };
  } catch (err) {
    return {
      status: "error",
      query,
      matches: [],
      message: err instanceof Error ? err.message : "Knowledge lookup failed",
    };
  }
}

/**
 * Get agency business settings at runtime
 */
export async function getBusinessInfo(key?: string): Promise<BusinessInfoResult> {
  try {
    const settings = await fetchActiveSettings();

    if (key) {
      const match = settings.find((s) => s.key === key);
      if (!match) {
        return { status: "no_match", key };
      }
      return {
        status: "results",
        entries: [{ key: match.key, value: match.value, description: match.description }],
      };
    }

    return {
      status: "results",
      entries: settings.map((s) => ({ key: s.key, value: s.value, description: s.description })),
    };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Knowledge lookup failed" };
  }
}
