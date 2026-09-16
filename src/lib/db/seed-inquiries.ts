import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "./index";
import { contactInquiries } from "./schema";
import { sql } from "drizzle-orm";

const initialInquiries = [
  {
    id: `inq_seed_01`,
    name: "Dr. Aritha Wickramasinghe",
    email: "dr.aritha@veritas.lk",
    phone: "+94 77 123 4567",
    company: "Veritas Medical Institute",
    service: "Website Design & Development",
    budget: "$2,000 - $5,000",
    message: "We are seeking a complete revamp of our clinical healthcare website with integrated appointment scheduling and modern responsive aesthetics.",
    status: "new",
    notes: "High priority medical client. Requesting a Zoom discovery call this Thursday.",
  },
  {
    id: `inq_seed_02`,
    name: "Malik Perera",
    email: "malik@auraliving.com",
    phone: "+94 71 987 6543",
    company: "Aura Living",
    service: "Brand Identity",
    budget: "$1,500 - $3,000",
    message: "Looking for high-end luxury brand packaging, guidelines, and visual identity for our new organic lifestyle and home decor line.",
    status: "contacted",
    notes: "Sent proposal deck and portfolio samples on Wednesday. Awaiting client budget review.",
  },
  {
    id: `inq_seed_03`,
    name: "Kavindi Jayawardena",
    email: "kavindi@cloudnine.lk",
    phone: "+94 76 555 1234",
    company: "CloudNine Fitness",
    service: "UI/UX Design",
    budget: "$3,000+",
    message: "Need intuitive mobile app and member dashboard UI designs for our expanding boutique gym chain across Colombo.",
    status: "in_progress",
    notes: "Sprint 1 wireframes in development. Target completion date end of month.",
  },
];

async function seedInquiries() {
  console.log("🌱 Seeding contact inquiries into Turso...");

  for (const item of initialInquiries) {
    await db
      .insert(contactInquiries)
      .values({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        service: item.service,
        budget: item.budget,
        message: item.message,
        status: item.status,
        notes: item.notes,
        createdAt: sql`(unixepoch())`,
        updatedAt: sql`(unixepoch())`,
      })
      .onConflictDoNothing();

    console.log(`  ✓ Inquiry from '${item.name}' (${item.company}) verified.`);
  }

  console.log("✅ Contact inquiries seeded successfully!");
}

seedInquiries()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
