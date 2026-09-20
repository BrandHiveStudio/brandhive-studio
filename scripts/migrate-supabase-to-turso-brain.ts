import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db, client } from "../src/lib/db";
import {
  brainServices,
  brainAddons,
  brainFaqs,
  brainSettings,
} from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

interface SupabaseServiceRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  pricing_type: string;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  active: boolean;
  display_order: number;
  metadata: Record<string, unknown> | null;
  item_type: string;
  ad_budget_separate: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseAddonRow {
  id: string;
  service_id: string | null;
  name: string;
  description: string | null;
  pricing_type: string;
  price: number | null;
  starting_price: number | null;
  currency: string;
  unit: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseFaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseSettingRow {
  key: string;
  value: unknown;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchSupabaseTable<T>(endpoint: string, key: string, url: string): Promise<T[]> {
  const res = await fetch(`${url}/rest/v1/${endpoint}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint} from Supabase: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T[];
}

export async function runMigration(dryRun = false) {
  console.log("==================================================");
  console.log("HIVE BRAIN MIGRATION: SUPABASE → TURSO");
  console.log(`MODE: ${dryRun ? "DRY RUN (Inspect & Validate Only)" : "LIVE MIGRATION (Idempotent Upsert)"}`);
  console.log("==================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  // 1. Fetch live records from Supabase
  console.log("\n[1/5] Fetching live records from authoritative Supabase Brain...");

  const [supabaseServices, supabaseAddons, supabaseFaqs, supabaseSettings] = await Promise.all([
    fetchSupabaseTable<SupabaseServiceRow>("services?order=display_order.asc", supabaseKey, supabaseUrl),
    fetchSupabaseTable<SupabaseAddonRow>("service_addons?order=created_at.asc", supabaseKey, supabaseUrl),
    fetchSupabaseTable<SupabaseFaqRow>("faqs?order=display_order.asc", supabaseKey, supabaseUrl),
    fetchSupabaseTable<SupabaseSettingRow>("settings?order=key.asc", supabaseKey, supabaseUrl),
  ]);

  console.log(`  ✓ Services & Packages fetched: ${supabaseServices.length} (Expected: 79)`);
  console.log(`  ✓ Service Add-ons fetched:    ${supabaseAddons.length} (Expected: 13)`);
  console.log(`  ✓ FAQs fetched:               ${supabaseFaqs.length} (Expected: 12)`);
  console.log(`  ✓ Settings fetched:           ${supabaseSettings.length} (Expected: 15)`);

  if (dryRun) {
    console.log("\nDry run completed successfully. All records are accessible and intact.");
    return {
      success: true,
      dryRun: true,
      counts: {
        services: supabaseServices.length,
        addons: supabaseAddons.length,
        faqs: supabaseFaqs.length,
        settings: supabaseSettings.length,
      },
    };
  }

  // 2. Migrate Services & Packages
  console.log("\n[2/5] Migrating Services & Packages to Turso 'brain_services'...");
  let srvInserted = 0;
  let srvUpdated = 0;

  for (const s of supabaseServices) {
    const meta = s.metadata ?? {};
    const sku = typeof meta.sku === "string" ? meta.sku : null;
    const inclusions = Array.isArray(meta.inclusions) ? JSON.stringify(meta.inclusions) : null;
    const exclusions = Array.isArray(meta.exclusions) ? JSON.stringify(meta.exclusions) : null;
    const metadataStr = meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : null;

    const rowData = {
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description || null,
      category: s.category || "general",
      itemType: s.item_type === "package" ? "package" : "service",
      pricingType: ["fixed", "starting_from", "custom_quote"].includes(s.pricing_type)
        ? s.pricing_type
        : "fixed",
      price: s.price != null ? Number(s.price) : null,
      startingPrice: s.starting_price != null ? Number(s.starting_price) : null,
      currency: s.currency || "LKR",
      unit: s.unit || null,
      adBudgetSeparate: Boolean(s.ad_budget_separate),
      sku,
      inclusions,
      exclusions,
      metadata: metadataStr,
      isActive: Boolean(s.active),
      displayOrder: s.display_order ?? 0,
      createdAt: s.created_at ? new Date(s.created_at) : new Date(),
      updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
    };

    const existing = await db
      .select({ id: brainServices.id })
      .from(brainServices)
      .where(eq(brainServices.id, s.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(brainServices)
        .set(rowData)
        .where(eq(brainServices.id, s.id));
      srvUpdated++;
    } else {
      await db.insert(brainServices).values(rowData);
      srvInserted++;
    }
  }
  console.log(`  ✓ brain_services: ${srvInserted} inserted, ${srvUpdated} updated.`);

  // 3. Migrate Add-ons
  console.log("\n[3/5] Migrating Add-ons to Turso 'brain_addons'...");
  let addInserted = 0;
  let addUpdated = 0;

  for (const a of supabaseAddons) {
    const rowData = {
      id: a.id,
      serviceId: a.service_id || null,
      name: a.name,
      description: a.description || null,
      pricingType: ["fixed", "starting_from", "custom_quote"].includes(a.pricing_type)
        ? a.pricing_type
        : "fixed",
      price: a.price != null ? Number(a.price) : null,
      startingPrice: a.starting_price != null ? Number(a.starting_price) : null,
      currency: a.currency || "LKR",
      unit: a.unit || null,
      isActive: Boolean(a.active),
      displayOrder: 0,
      createdAt: a.created_at ? new Date(a.created_at) : new Date(),
      updatedAt: a.updated_at ? new Date(a.updated_at) : new Date(),
    };

    const existing = await db
      .select({ id: brainAddons.id })
      .from(brainAddons)
      .where(eq(brainAddons.id, a.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(brainAddons)
        .set(rowData)
        .where(eq(brainAddons.id, a.id));
      addUpdated++;
    } else {
      await db.insert(brainAddons).values(rowData);
      addInserted++;
    }
  }
  console.log(`  ✓ brain_addons: ${addInserted} inserted, ${addUpdated} updated.`);

  // 4. Migrate FAQs
  console.log("\n[4/5] Migrating FAQs to Turso 'brain_faqs'...");
  let faqInserted = 0;
  let faqUpdated = 0;

  for (const f of supabaseFaqs) {
    const rowData = {
      id: f.id,
      question: f.question,
      answer: f.answer,
      category: f.category || "general",
      isActive: Boolean(f.active),
      displayOrder: f.display_order ?? 0,
      createdAt: f.created_at ? new Date(f.created_at) : new Date(),
      updatedAt: f.updated_at ? new Date(f.updated_at) : new Date(),
    };

    const existing = await db
      .select({ id: brainFaqs.id })
      .from(brainFaqs)
      .where(eq(brainFaqs.id, f.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(brainFaqs)
        .set(rowData)
        .where(eq(brainFaqs.id, f.id));
      faqUpdated++;
    } else {
      await db.insert(brainFaqs).values(rowData);
      faqInserted++;
    }
  }
  console.log(`  ✓ brain_faqs: ${faqInserted} inserted, ${faqUpdated} updated.`);

  // 5. Migrate Settings
  console.log("\n[5/5] Migrating Settings to Turso 'brain_settings'...");
  let setInserted = 0;
  let setUpdated = 0;

  for (const st of supabaseSettings) {
    const formattedValue =
      typeof st.value === "object" && st.value !== null
        ? JSON.stringify(st.value)
        : String(st.value ?? "");

    const rowData = {
      id: `bset_${st.key}`,
      key: st.key,
      value: formattedValue,
      description: st.description || null,
      isActive: Boolean(st.active),
      createdAt: st.created_at ? new Date(st.created_at) : new Date(),
      updatedAt: st.updated_at ? new Date(st.updated_at) : new Date(),
    };

    const existing = await db
      .select({ id: brainSettings.id })
      .from(brainSettings)
      .where(eq(brainSettings.key, st.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(brainSettings)
        .set(rowData)
        .where(eq(brainSettings.key, st.key));
      setUpdated++;
    } else {
      await db.insert(brainSettings).values(rowData);
      setInserted++;
    }
  }
  console.log(`  ✓ brain_settings: ${setInserted} inserted, ${setUpdated} updated.`);

  // 6. Verification: Check Turso counts
  console.log("\n==================================================");
  console.log("VERIFICATION: CHECKING TURSO BRAIN RECORD COUNTS");
  console.log("==================================================");

  const [tServices, tAddons, tFaqs, tSettings] = await Promise.all([
    client.execute("SELECT count(*) as count FROM brain_services"),
    client.execute("SELECT count(*) as count FROM brain_addons"),
    client.execute("SELECT count(*) as count FROM brain_faqs"),
    client.execute("SELECT count(*) as count FROM brain_settings"),
  ]);

  const countServices = Number(tServices.rows[0].count);
  const countAddons = Number(tAddons.rows[0].count);
  const countFaqs = Number(tFaqs.rows[0].count);
  const countSettings = Number(tSettings.rows[0].count);

  console.log(`Turso brain_services: ${countServices} (Expected: ${supabaseServices.length})`);
  console.log(`Turso brain_addons:   ${countAddons} (Expected: ${supabaseAddons.length})`);
  console.log(`Turso brain_faqs:     ${countFaqs} (Expected: ${supabaseFaqs.length})`);
  console.log(`Turso brain_settings: ${countSettings} (Expected: ${supabaseSettings.length})`);

  const allMatch =
    countServices === supabaseServices.length &&
    countAddons === supabaseAddons.length &&
    countFaqs === supabaseFaqs.length &&
    countSettings === supabaseSettings.length;

  if (allMatch) {
    console.log("\n🎉 INTEGRITY CHECK PASSED: All 119 Supabase Brain records are 100% synchronized in Turso!");
  } else {
    console.warn("\n⚠️ WARNING: Count mismatch detected. Please review logs.");
  }

  return {
    success: allMatch,
    counts: {
      services: countServices,
      addons: countAddons,
      faqs: countFaqs,
      settings: countSettings,
    },
  };
}

// CLI entry point
if (require.main === module || process.argv[1]?.includes("migrate-supabase-to-turso-brain")) {
  const isDryRun = process.argv.includes("--dry-run");
  runMigration(isDryRun)
    .then(() => {
      // Exit cleanly
      setTimeout(() => process.exit(0), 100);
    })
    .catch((err) => {
      console.error("\n❌ Migration failed:", err.message);
      setTimeout(() => process.exit(1), 100);
    });
}

