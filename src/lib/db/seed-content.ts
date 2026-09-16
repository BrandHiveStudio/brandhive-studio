import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { siteContent } from "./schema";
import { fallbackSiteContent } from "./queries/content";

const contentMetadata: Record<string, { group: string; description: string }> = {
  // Stats
  "stats_projects_number": { group: "Stats", description: "Homepage stat: Total projects delivered" },
  "stats_projects_suffix": { group: "Stats", description: "Homepage stat: Projects delivered suffix symbol" },
  "stats_projects_label": { group: "Stats", description: "Homepage stat: Projects delivered label" },
  "stats_clients_number": { group: "Stats", description: "Homepage stat: Total clients served count" },
  "stats_clients_suffix": { group: "Stats", description: "Homepage stat: Clients served suffix symbol" },
  "stats_clients_label": { group: "Stats", description: "Homepage stat: Clients served label" },
  "stats_years_number": { group: "Stats", description: "Homepage stat: Years of agency experience count" },
  "stats_years_suffix": { group: "Stats", description: "Homepage stat: Years of experience suffix symbol" },
  "stats_years_label": { group: "Stats", description: "Homepage stat: Years of experience label" },
  "stats_satisfaction_number": { group: "Stats", description: "Homepage stat: Client satisfaction percentage" },
  "stats_satisfaction_suffix": { group: "Stats", description: "Homepage stat: Client satisfaction suffix symbol" },
  "stats_satisfaction_label": { group: "Stats", description: "Homepage stat: Client satisfaction label" },
  "stats_awwwards_title": { group: "Stats", description: "Hero badge award title" },
  "stats_awwwards_subtitle": { group: "Stats", description: "Hero badge award subtitle" },

  // Hero
  "hero_badge": { group: "Hero", description: "Hero top pill badge label" },
  "hero_title_line1": { group: "Hero", description: "Hero main headline line 1" },
  "hero_title_line2": { group: "Hero", description: "Hero main headline line 2" },
  "hero_title_highlight": { group: "Hero", description: "Hero main headline highlighted gradient text" },
  "hero_description": { group: "Hero", description: "Hero lead paragraph description" },
  "hero_cta_primary": { group: "Hero", description: "Hero primary CTA button label" },
  "hero_cta_secondary": { group: "Hero", description: "Hero secondary CTA button label" },

  // About
  "about_badge": { group: "About", description: "About section badge label" },
  "about_heading": { group: "About", description: "About section main headline" },
  "about_story_lead": { group: "About", description: "About section introductory narrative paragraph" },
  "about_mission": { group: "About", description: "BrandHive Studio mission statement" },
  "about_vision": { group: "About", description: "BrandHive Studio vision statement" },

  // CTA
  "cta_badge": { group: "CTA", description: "Call-to-action section badge" },
  "cta_heading": { group: "CTA", description: "Call-to-action main headline" },
  "cta_description": { group: "CTA", description: "Call-to-action narrative description" },
  "cta_button_text": { group: "CTA", description: "Call-to-action primary button label" },
};

async function seedContent() {
  console.log("🌱 Seeding Site Content into Turso database...");

  for (const [key, value] of Object.entries(fallbackSiteContent)) {
    const meta = contentMetadata[key] || { group: "General", description: "General site content" };

    await db
      .insert(siteContent)
      .values({
        id: `content_${key}`,
        contentKey: key,
        contentValue: value,
        groupName: meta.group,
        description: meta.description,
      })
      .onConflictDoNothing();

    console.log(`  ✓ Content key '${key}' (${meta.group}) verified.`);
  }

  console.log("✅ Site Content seeded successfully into Turso!");
}

seedContent()
  .catch((err) => {
    console.error("Site content seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
