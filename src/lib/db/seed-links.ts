import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { externalLinks } from "./schema";
import { fallbackLinks } from "./queries/links";
import { sql } from "drizzle-orm";

async function seedLinks() {
  console.log("🌱 Seeding External Links into Turso database...");

  for (const item of fallbackLinks) {
    await db
      .insert(externalLinks)
      .values({
        id: item.id,
        platform: item.platform,
        url: item.url,
        label: item.label,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
        createdAt: sql`(unixepoch())`,
      })
      .onConflictDoNothing();

    console.log(`  ✓ External Link '${item.label}' (${item.platform}) verified.`);
  }

  console.log("✅ External links seeded successfully into Turso!");
}

seedLinks()
  .catch((err) => {
    console.error("External links seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
