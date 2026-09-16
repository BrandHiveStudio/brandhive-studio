import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { processSteps } from "./schema";
import { fallbackProcessSteps } from "./queries/process";
import { sql } from "drizzle-orm";

async function seedProcess() {
  console.log("🌱 Seeding Process Steps into Turso database...");

  for (const item of fallbackProcessSteps) {
    await db
      .insert(processSteps)
      .values({
        id: item.id,
        stepNumber: item.stepNumber,
        title: item.title,
        shortTitle: item.shortTitle,
        badge: item.badge,
        shortDescription: item.shortDescription,
        description: item.description,
        icon: item.icon,
        imageUrl: item.imageUrl,
        deliverables: JSON.stringify(item.deliverables),
        displayOrder: item.displayOrder,
        isPublished: item.isPublished,
        createdAt: sql`(unixepoch())`,
        updatedAt: sql`(unixepoch())`,
      })
      .onConflictDoNothing();

    console.log(`  ✓ Process Step [${item.stepNumber}] '${item.title}' verified.`);
  }

  console.log("✅ Process steps seeded successfully into Turso!");
}

seedProcess()
  .catch((err) => {
    console.error("Process steps seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
