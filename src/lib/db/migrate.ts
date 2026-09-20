import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { client } from "./index";

const tableMigrations = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    cover_image TEXT,
    logo_image TEXT,
    client TEXT,
    role TEXT,
    year TEXT,
    deliverables TEXT,
    is_featured INTEGER DEFAULT 0,
    is_ongoing INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS project_images (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    section TEXT DEFAULT 'Gallery',
    display_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_key TEXT NOT NULL UNIQUE,
    public_url TEXT NOT NULL,
    alt_text TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT,
    display_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS testimonials (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    company TEXT NOT NULL,
    role TEXT,
    review TEXT NOT NULL,
    logo_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS external_links (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY,
    content_key TEXT NOT NULL UNIQUE,
    content_value TEXT NOT NULL,
    description TEXT,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS contact_inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service TEXT,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    category TEXT NOT NULL DEFAULT 'Branding',
    author TEXT NOT NULL DEFAULT 'BrandHive Studio',
    read_time TEXT DEFAULT '5 MIN READ',
    tags TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    published_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS process_steps (
    id TEXT PRIMARY KEY,
    step_number TEXT NOT NULL,
    title TEXT NOT NULL,
    short_title TEXT,
    badge TEXT,
    short_description TEXT,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'search',
    image_url TEXT,
    deliverables TEXT,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS brain_services (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    item_type TEXT NOT NULL DEFAULT 'service',
    pricing_type TEXT NOT NULL DEFAULT 'fixed',
    price REAL,
    starting_price REAL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    unit TEXT,
    ad_budget_separate INTEGER NOT NULL DEFAULT 0,
    sku TEXT,
    inclusions TEXT,
    exclusions TEXT,
    metadata TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS brain_addons (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES brain_services(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    pricing_type TEXT NOT NULL DEFAULT 'fixed',
    price REAL,
    starting_price REAL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    unit TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS brain_faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    is_active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE TABLE IF NOT EXISTS brain_settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );`,

  `CREATE INDEX IF NOT EXISTS idx_brain_services_category ON brain_services(category);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_services_item_type ON brain_services(item_type);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_services_is_active ON brain_services(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_services_display_order ON brain_services(display_order);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_addons_service_id ON brain_addons(service_id);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_addons_is_active ON brain_addons(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_faqs_category ON brain_faqs(category);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_faqs_is_active ON brain_faqs(is_active);`,
  `CREATE INDEX IF NOT EXISTS idx_brain_settings_key ON brain_settings(key);`,
];


const columnMigrations = [
  { table: "projects", column: "is_ongoing", ddl: `ALTER TABLE projects ADD COLUMN is_ongoing INTEGER DEFAULT 0;` },
  { table: "projects", column: "is_published", ddl: `ALTER TABLE projects ADD COLUMN is_published INTEGER DEFAULT 1;` },
  { table: "project_images", column: "section", ddl: `ALTER TABLE project_images ADD COLUMN section TEXT DEFAULT 'Gallery';` },
  { table: "services", column: "badge", ddl: `ALTER TABLE services ADD COLUMN badge TEXT;` },
  { table: "services", column: "short_description", ddl: `ALTER TABLE services ADD COLUMN short_description TEXT;` },
  { table: "services", column: "image_url", ddl: `ALTER TABLE services ADD COLUMN image_url TEXT;` },
  { table: "services", column: "features", ddl: `ALTER TABLE services ADD COLUMN features TEXT;` },
  { table: "services", column: "is_published", ddl: `ALTER TABLE services ADD COLUMN is_published INTEGER DEFAULT 1;` },
  { table: "testimonials", column: "avatar_url", ddl: `ALTER TABLE testimonials ADD COLUMN avatar_url TEXT;` },
  { table: "testimonials", column: "is_published", ddl: `ALTER TABLE testimonials ADD COLUMN is_published INTEGER DEFAULT 1;` },
  { table: "site_content", column: "group_name", ddl: `ALTER TABLE site_content ADD COLUMN group_name TEXT DEFAULT 'General';` },
];

async function runMigrations() {
  console.log("🚀 Starting controlled schema migration on Turso database...");
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL environment variable is missing.");
  }

  for (let i = 0; i < tableMigrations.length; i++) {
    const ddl = tableMigrations[i];
    const match = ddl.match(/CREATE TABLE IF NOT EXISTS ([a-z_]+)/i);
    const tableName = match ? match[1] : `statement #${i + 1}`;
    try {
      await client.execute(ddl);
      console.log(`  ✓ Table '${tableName}' verified/created successfully.`);
    } catch (err) {
      console.error(`  ✗ Error applying table '${tableName}':`, err);
      throw err;
    }
  }

  console.log("⚙️  Checking column updates...");
  for (const cm of columnMigrations) {
    try {
      await client.execute(cm.ddl);
      console.log(`  ✓ Column '${cm.column}' added to '${cm.table}'.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate column") || msg.includes("already exists")) {
        console.log(`  ✓ Column '${cm.column}' in '${cm.table}' already exists.`);
      } else {
        console.warn(`  ⚠️ Column migration note for '${cm.column}': ${msg}`);
      }
    }
  }

  console.log("✅ All migrations applied successfully to Turso!");
}

runMigrations()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
